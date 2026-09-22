# KEA Super Admin Platform
## VSR Module Functional Requirements and Data Management Specification

**Status:** Proposed production specification  
**Audience:** Super Admin, KEA Management, Operations, Product, Engineering, Data, Security  
**Scope:** Internal administration and operational oversight of Van Sales Representatives, Assistant VSRs, routes, territories, vans, GPS activity, and field KPIs.

## 1. Product Boundary

The VSR module is an internal control plane. It is not a client-facing dashboard and must not expose workforce identities, route allocations, GPS traces, sales activity, or operational coverage data to external client roles.

The current React screen is a frontend prototype with mock crew data. Production behavior requires a protected API, persistent relational data, a spatial data store, server-side authorization, audit logging, and a live ingestion path for GPS and field activity events.

### Internal audiences

- **Super Admin:** Full configuration, workforce CRUD, route and boundary management, KPI visibility, exports, and audit access.
- **KEA Management:** Read access to all operational data, KPI drill-down, map visibility, and approved exports. Configuration writes require explicit permission or delegated scope.
- **Operations Team:** Workforce, fleet, route, and activity management within assigned operational scope.
- **External/client roles:** No access to this module or its APIs.

## 2. Functional Requirements

### 2.1 Workforce Configuration and CRUD

The system must support create, read, update, and archive operations for both primary VSR and Assistant VSR profiles.

Required profile fields:

| Field | Requirement |
|---|---|
| Staff name | Required; legal/display name separated where needed |
| Staff ID | Required, globally unique, immutable after activation |
| Role | `VSR` or `ASSISTANT_VSR` |
| Assigned fleet/van ID | Required for active field profiles; one current assignment at a time |
| Work status | `ACTIVE`, `INACTIVE`, or `ON_LEAVE` |
| Region | Required controlled geography |
| State | Required; must belong to selected region |
| LGA | Required; must belong to selected state |
| Assigned territory | Required; must belong to selected LGA hierarchy |
| Phone/contact | Required for operational contact, access controlled |
| Effective dates | Required for assignment history |

Rules:

1. Staff ID is unique across VSRs and assistants.
2. A staff member may not be active in two current assignments simultaneously.
3. An active VSR must have a valid fleet/van assignment and at least one assigned route before being counted as operational.
4. An assistant may be paired to one primary VSR at a time; a primary VSR may have multiple historical or current assistants subject to an operations-configured capacity rule.
5. A territory has one canonical definition and may be linked to many VSRs.
6. A VSR may have many routes over time and may have multiple active routes only when an operations policy explicitly permits it.
7. Delete is a soft delete/archive operation. Historical activities, routes, GPS events, and audit records must remain queryable.
8. Changes to staff ID, role, van assignment, territory, or work status require an audit event.

### 2.2 Route and Geographic Mapping Engine

Administrators must be able to:

- Create and version operational territories as polygon or multipolygon boundaries.
- Upload GeoJSON route line strings and boundary files.
- Validate geometry type, coordinate reference system, maximum size, self-intersections, and required metadata before publishing.
- Create route records manually with a route code, name, region, territory, operating days, and active dates.
- Assign routes to one or more VSRs through effective-dated assignments.
- Edit route metadata without mutating historical GPS traces.
- Publish, unpublish, archive, and restore route versions.
- Toggle map layers for active fleet pins, completed stops, live route lines, and territory boundaries.
- Display the selected VSR's current route line, last validated location, completed stops, timestamps, and exception state.
- Show stale GPS data explicitly. A position older than the configured freshness threshold must not appear as live.

Geometry requirements:

- Store geographic coordinates in WGS84 (`EPSG:4326`) at ingestion.
- Use a spatial database type such as PostGIS `geometry(LineString, 4326)` and `geometry(MultiPolygon, 4326)`.
- Preserve the original uploaded file and a normalized geometry version.
- Record `source`, `source_file_id`, `captured_at`, `ingested_at`, `accuracy_meters`, and `validation_status` for every spatial payload.
- Do not infer an exact route from a visual map polyline. A route is authoritative only when backed by saved GPS or an approved administrative upload.

### 2.3 KPI Aggregation and Drill-down

The Super Admin landing page must expose these server-computed KPI cards:

| KPI | Definition | Drill-down |
|---|---|---|
| Total VSR Headcount | Count of distinct non-archived primary VSR profiles, optionally filtered by scope/date | Workforce list filtered to `role=VSR` |
| Total Active Fleet | Count of active VSR and Assistant VSR assignments with an active van assignment | Workforce/fleet list filtered to active field assets |
| Total Defined Routes | Count of published routes effective within the selected reporting window | Route registry filtered to published routes |
| Completed Field Activities/Visits | Count of validated completed activities in the selected date and scope | Activity ledger filtered to completed status |

KPI requirements:

- All KPI values must use one shared filter context: date window, region, state, LGA, territory, and role where applicable.
- Clicking a KPI must update the URL/query state and navigate to a filtered list, not merely filter client-side memory.
- KPI responses must include `value`, `as_of`, `scope`, and `data_freshness`.
- Aggregation queries must use indexed dimensions and must not scan raw GPS points for every page request.
- Cached values may be used for overview cards, but drill-down results must identify the last refresh time.

### 2.4 Global Filters and Cascading Behavior

The filter order is:

`Region -> State -> LGA -> Territory -> VSR -> Route`

Requirements:

1. Selecting a parent filter limits the available options in all descendants.
2. A child selection is cleared when it becomes invalid after a parent change.
3. Every filter is represented in a shareable URL/query state.
4. Server-side query parameters are authoritative; the client must not fetch all operational data and filter it locally.
5. Search must support staff name, Staff ID, van ID, route code, and territory.
6. Empty states must distinguish “no records” from “not authorized.”
7. Filter option endpoints must enforce the same RBAC scope as data endpoints.

## 3. Data Model

The following normalized entities are the minimum production model.

### 3.1 `staff_profiles`

- `id` UUID primary key
- `staff_id` varchar unique not null
- `role` enum: `VSR`, `ASSISTANT_VSR`
- `full_name` varchar not null
- `email`, `phone` protected fields
- `work_status` enum: `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `ARCHIVED`
- `region_id`, `state_id`, `lga_id`, `territory_id` foreign keys
- `created_at`, `updated_at`, `archived_at`
- `created_by`, `updated_by`
- `version` integer for optimistic concurrency

### 3.2 `fleet_assets`

- `id` UUID primary key
- `van_id` varchar unique not null
- `registration_number` protected/unique where applicable
- `asset_status` enum: `ACTIVE`, `IDLE`, `MAINTENANCE`, `RETIRED`
- `current_latitude`, `current_longitude` optional operational cache
- `last_gps_at`, `gps_accuracy_meters`
- `created_at`, `updated_at`, `retired_at`

### 3.3 `staff_fleet_assignments`

Effective-dated join table for staff-to-van history:

- `id`, `staff_profile_id`, `fleet_asset_id`
- `assignment_type`: `PRIMARY`, `ASSISTANT`
- `starts_at`, `ends_at`
- `is_current`
- Unique constraint preventing overlapping current assignments for the same staff member.

### 3.4 `geographies`

Canonical hierarchy for filtering:

- `id`, `type` (`REGION`, `STATE`, `LGA`, `TERRITORY`)
- `name`, `code`, `parent_id`
- `boundary_geom` spatial geometry for territory records
- `boundary_version`, `status`, `created_at`, `updated_at`

### 3.5 `routes`

- `id` UUID primary key
- `route_code` unique not null
- `route_name`
- `territory_id`, `region_id`
- `route_status`: `DRAFT`, `PUBLISHED`, `SUSPENDED`, `ARCHIVED`
- `route_geom` `LineString(4326)`
- `geometry_source`, `source_file_id`, `geometry_hash`
- `published_at`, `effective_from`, `effective_to`
- `created_by`, `updated_by`

### 3.6 `vsr_route_assignments`

- `id`, `staff_profile_id`, `route_id`, `fleet_asset_id`
- `assignment_status`: `PLANNED`, `ACTIVE`, `COMPLETED`, `CANCELLED`
- `starts_at`, `ends_at`
- `assigned_by`, `created_at`
- Unique constraint preventing conflicting active assignments for the same staff member and time window.

### 3.7 `assistant_pairs`

- `id`, `primary_vsr_id`, `assistant_vsr_id`
- `route_id` nullable when the pairing is fleet-wide
- `starts_at`, `ends_at`, `status`
- `created_by`, `ended_by`
- Check constraint preventing a staff profile from pairing with itself.

### 3.8 `gps_positions`

Append-only telemetry stream:

- `id`, `staff_profile_id`, `fleet_asset_id`, `route_assignment_id`
- `captured_at`, `ingested_at`
- `latitude`, `longitude`, `position_geom`
- `accuracy_meters`, `speed_kph`, `heading_degrees`
- `source`, `device_id`, `ingestion_batch_id`
- Retention/partition key by event date.

### 3.9 `field_activities`

- `id`, `staff_profile_id`, `assistant_vsr_id`, `route_id`, `fleet_asset_id`
- `activity_type`, `status` (`PLANNED`, `IN_PROGRESS`, `COMPLETED`, `VALIDATION_FAILED`, `CANCELLED`)
- `started_at`, `completed_at`
- `validation_latitude`, `validation_longitude`, `validation_geom`
- `validation_accuracy_meters`, `notes`, `evidence_uri`
- `created_at`, `updated_at`

### 3.10 `audit_events`

Immutable administrative audit ledger:

- `id`, `actor_user_id`, `actor_role`, `action`
- `entity_type`, `entity_id`, `before_json`, `after_json`
- `request_id`, `ip_hash`, `user_agent_hash`, `created_at`
- Never expose raw secrets or unnecessary personal data in audit payloads.

## 4. API and Service Contract

All endpoints require an authenticated internal session and server-side authorization.

### Workforce

- `GET /api/admin/vsr` with hierarchy filters, role, status, pagination, and search.
- `POST /api/admin/vsr` creates a profile and emits `staff.created`.
- `GET /api/admin/vsr/:id` returns profile, current assignment, route summary, and access-scoped activity summary.
- `PATCH /api/admin/vsr/:id` updates allowed mutable fields and emits an audit event.
- `DELETE /api/admin/vsr/:id` archives the profile; hard delete is prohibited by default.
- `POST /api/admin/vsr/:id/assistant-pairings` creates an effective-dated pairing.
- `DELETE /api/admin/vsr/:id/assistant-pairings/:pairingId` ends a pairing.

### Geography and routes

- `GET /api/admin/geographies/options` returns cascading options for the authorized scope.
- `POST /api/admin/geographies` creates a territory or boundary version.
- `POST /api/admin/routes/import` accepts GeoJSON/CSV and returns validation results.
- `GET /api/admin/routes` lists routes with publication and assignment status.
- `POST /api/admin/routes` creates a route.
- `PATCH /api/admin/routes/:id` updates metadata or creates a new geometry version.
- `POST /api/admin/routes/:id/publish` publishes a validated route.
- `POST /api/admin/routes/:id/assignments` assigns a route to a VSR/van.

### Map and KPI

- `GET /api/admin/map/overview` returns authorized fleet pins, route lines, boundaries, freshness, and layer metadata.
- `GET /api/admin/map/vsr/:id` returns the selected VSR route, latest position, completed stops, and trace summary.
- `GET /api/admin/kpis` returns scoped KPI values and freshness metadata.
- `GET /api/admin/activities` lists validated field activities for drill-down.

API rules:

- Use cursor pagination for roster, telemetry, and activity endpoints.
- Return RFC 7807-style errors with stable error codes.
- Require an idempotency key for imports, assignments, and bulk writes.
- Use optimistic concurrency (`version` or `If-Match`) for profile and route edits.
- Do not return raw GPS histories by default; return generalized or time-bounded data unless the role and purpose permit it.

## 5. RBAC and Data Isolation

Authorization must be enforced at the API/service and database query layers. Hiding navigation or controls in React is not a security boundary.

| Capability | Super Admin | KEA Management | Operations | External Client |
|---|---:|---:|---:|---:|
| View workforce | Yes | Yes | Scoped | No |
| Create/update workforce | Yes | Delegated | Scoped | No |
| Archive workforce | Yes | Delegated | Scoped approval | No |
| Manage territories/routes | Yes | Read / delegated | Scoped write | No |
| View live GPS/map | Yes | Yes | Scoped | No |
| View raw GPS trace | Yes | Approved scope | Approved scope | No |
| View KPI cards | Yes | Yes | Scoped | No |
| Export operational data | Yes | Approved | Approved | No |
| View audit events | Yes | Read | Scoped read | No |

Security requirements:

1. Every request carries an internal principal, role, and data scope.
2. Scope is evaluated against region, state, LGA, territory, and explicit resource permissions.
3. External client tokens must fail closed for all `/api/admin/*` and map/telemetry endpoints.
4. Database row-level security or an equivalent policy layer must enforce scope even if a service bug omits a filter.
5. Sensitive fields such as phone, registration number, device ID, and raw coordinates require field-level authorization.
6. Exports are permissioned, watermarked, logged, time-limited, and contain only fields needed for the declared purpose.
7. Every failed authorization attempt is logged without revealing protected data.

## 6. Data Management and Governance

### Validation

- Validate all foreign-key hierarchy relationships server-side.
- Reject duplicate Staff IDs, van IDs, route codes, and overlapping active assignments.
- Reject invalid or out-of-bounds geometry.
- Normalize timestamps to UTC and render in WAT or the user's authorized timezone.
- Preserve source values and normalized values for imported geography data.

### Lifecycle

- Workforce and route records are soft-deleted/archive-only.
- GPS positions are append-only and partitioned by capture date.
- Retention for raw GPS should be configurable by policy; aggregated route summaries may be retained longer.
- Activities and audit events are immutable after finalization.
- Every import creates a batch record with checksum, uploader, row counts, rejected rows, and validation report.

### Quality monitoring

Track:

- Missing or stale GPS percentage by fleet and region.
- Activities with invalid validation coordinates.
- Routes without active assignments.
- Active staff without fleet assignments.
- Overlapping route assignments.
- Orphaned assistants or assistants paired to inactive VSRs.
- KPI reconciliation between activity ledger and aggregated tables.

### Performance indexes

At minimum:

- Unique indexes on `staff_id`, `van_id`, and `route_code`.
- Composite index on `(work_status, role, region_id, state_id, lga_id, territory_id)`.
- Composite index on route assignments `(staff_profile_id, starts_at, ends_at)`.
- Spatial indexes on `boundary_geom`, `route_geom`, and `position_geom`.
- Time/partition indexes on `gps_positions.captured_at` and `field_activities.completed_at`.

## 7. Acceptance Criteria

1. A Super Admin can create a VSR with all required fields and cannot save invalid geography hierarchy values.
2. A Super Admin can create an Assistant VSR and pair it with a primary VSR for a defined effective period.
3. The system rejects an active staff profile without a valid fleet assignment.
4. An administrator can upload a GeoJSON route, see validation errors, preview it, and publish it only after validation succeeds.
5. The overview map shows only authorized fleet pins, active route lines, and territory boundaries.
6. Selecting a VSR updates profile details, route geometry, current van marker, completed stops, and timestamps together.
7. KPI card clicks navigate to server-filtered lists with shareable URL state.
8. Region-to-route filters cascade and never present invalid child options.
9. An Operations user cannot read or mutate records outside their assigned scope.
10. An external client token receives a consistent authorization failure for all VSR endpoints and cannot infer record existence.
11. Workforce, route, assignment, import, publish, export, and authorization events are auditable.
12. Archived records remain available to authorized historical reports and do not count as active KPIs.

## 8. Delivery Plan

### Phase 1: Secure foundation

- Introduce the API and database schema.
- Implement internal authentication, RBAC, scope evaluation, audit events, and soft-delete semantics.
- Replace the current in-component crew array with a read-only API-backed roster.

### Phase 2: Workforce and assignments

- Build Super Admin CRUD screens.
- Add fleet assignment, assistant pairing, effective dates, validation, and history.
- Add cascading filter endpoints and URL state.

### Phase 3: Routes and spatial data

- Add GeoJSON import and validation pipeline.
- Add route/territory versioning and publish workflow.
- Replace the current illustrative SVG route view with an approved map provider or spatial tile layer backed by authoritative geometry.

### Phase 4: KPI and operations intelligence

- Add materialized KPI aggregates and freshness metadata.
- Add click-to-drill-down navigation.
- Add activity validation, reconciliation monitoring, exports, and operational alerts.

### Phase 5: Hardening

- Run role and scope penetration tests.
- Load-test map and KPI endpoints.
- Validate retention, backup/restore, import replay, audit completeness, and external-role isolation.
