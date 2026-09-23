export const fallbackText = (value: unknown, fallback = 'N/A'): string => {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
};

export const fallbackNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

export const fallbackBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  return fallback;
};

export const safeArray = <T>(value: unknown, fallback: T[] = []): T[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== null && item !== undefined) as T[];
  }
  return fallback;
};

export const safeObject = <T extends Record<string, unknown>>(value: unknown, fallback: T): T => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...fallback, ...(value as Record<string, unknown>) } as T;
  }
  return fallback;
};

export const ensureObjectKeys = <T extends Record<string, unknown>>(value: unknown, fallback: T): T => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;
  const source = value as Record<string, unknown>;
  const merged = { ...fallback } as Record<string, unknown>;

  Object.keys(fallback).forEach((key) => {
    merged[key] = source[key] ?? fallback[key];
  });

  return merged as T;
};

export const resolveDisplayValue = (value: unknown, fallback = 'N/A'): string => {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value) && value.length === 0) return 'None';
  if (typeof value === 'string' && value.trim() === '') return fallback;
  return String(value);
};
