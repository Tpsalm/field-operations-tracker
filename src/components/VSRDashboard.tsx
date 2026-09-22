import React from 'react';
import { AuthUser } from '../types';

interface VSRDashboardProps {
  user: AuthUser;
  onSignOut: () => void;
}

export const VSRDashboard: React.FC<VSRDashboardProps> = ({ user, onSignOut }) => {
  const loginMeta = user.sessionMeta;
  const formattedSignedIn = loginMeta
    ? new Date(loginMeta.signedInAt).toLocaleString('en-NG', {
        timeZone: loginMeta.timezone,
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Not captured';

  const routeChecklist = [
    { label: 'Mile 2 Retail Route', status: 'checked-in', time: '08:10 WAT' },
    { label: 'Sabo POS Verification', status: 'in-progress', time: '10:25 WAT' },
    { label: 'Eko Atlantic Merchandising', status: 'pending', time: '14:00 WAT' }
  ];

  const teamToday = [
    { title: 'Assigned Retail Outlets', value: '18', note: '+3 new route visits' },
    { title: 'Stock Reconciliation', value: '96%', note: 'Above target' },
    { title: 'POS Uptime', value: '99.1%', note: 'Healthy' },
    { title: 'Pending Disbursement', value: '₦142k', note: '2 approvals due' }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <header className="border-b border-[#1e2d4d] bg-[#090e1c] px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#92C842]">VSR Portal</div>
            <h1 className="mt-1 text-2xl font-bold text-white">{user.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#1e2d4d] bg-[#0e1628] px-3 py-2 text-right">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Signed in</div>
              <div className="text-xs font-mono text-slate-200">{formattedSignedIn}</div>
            </div>
            <button
              onClick={onSignOut}
              className="rounded-lg border border-[#1e2d4d] bg-[#151f38] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-[#1a2745]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-5 py-8">
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-[#1e2d4d] bg-[#0e1628] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Access status</div>
                <h2 className="mt-2 text-2xl font-bold text-white">Field rep dashboard</h2>
              </div>
              <div className="rounded-full border border-[#92C842]/40 bg-[#92C842]/10 px-3 py-1 text-xs font-bold text-[#92C842]">
                ONLINE
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {teamToday.map((item) => (
                <div key={item.title} className="rounded-xl border border-[#1e2d4d] bg-[#090e1c] p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{item.title}</div>
                  <div className="mt-3 text-2xl font-bold text-white">{item.value}</div>
                  <div className="mt-2 text-[11px] text-slate-300">{item.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1e2d4d] bg-[#0e1628] p-6 shadow-2xl">
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Session metadata</div>
            <div className="mt-4 space-y-4 text-sm">
              <div className="rounded-xl border border-[#1e2d4d] bg-[#090e1c] p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Location</div>
                <div className="mt-2 font-semibold text-white">{loginMeta?.location.label ?? 'Location unavailable'}</div>
                <div className="text-xs text-slate-400">{loginMeta?.location.city ?? 'Unknown city'}</div>
              </div>

              <div className="rounded-xl border border-[#1e2d4d] bg-[#090e1c] p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Timezone</div>
                <div className="mt-2 font-mono text-white">{loginMeta?.timezone ?? 'UTC'}</div>
              </div>

              <div className="rounded-xl border border-[#1e2d4d] bg-[#090e1c] p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Role</div>
                <div className="mt-2 text-white">{user.roleTitle}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-[#1e2d4d] bg-[#0e1628] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Today’s route checklist</h3>
              <span className="rounded-full border border-[#92C842]/30 bg-[#92C842]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#92C842]">
                Active route
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {routeChecklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#1e2d4d] bg-[#090e1c] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        item.status === 'checked-in'
                          ? 'bg-[#92C842]'
                          : item.status === 'in-progress'
                          ? 'bg-[#F17F31]'
                          : 'bg-slate-500'
                      }`}
                    />
                    <div>
                      <div className="text-sm font-semibold text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.time}</div>
                    </div>
                  </div>
                  <span className="rounded-full border border-[#1e2d4d] bg-[#151f38] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1e2d4d] bg-[#0e1628] p-6 shadow-2xl">
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Quick actions</div>
            <div className="mt-5 space-y-3">
              {['Check in location', 'Submit stock count', 'Update route notes', 'Request aid / support'].map((action) => (
                <button
                  key={action}
                  className="flex w-full items-center justify-between rounded-xl border border-[#1e2d4d] bg-[#090e1c] p-3 text-left text-sm text-slate-200 transition hover:border-[#92C842]/50"
                >
                  <span>{action}</span>
                  <span className="text-[#92C842]">→</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
