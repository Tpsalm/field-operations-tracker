import React from 'react';

export const DashboardSkeleton: React.FC<{ title?: string }> = ({ title = 'Loading dashboard data' }) => (
  <div className="space-y-4 animate-pulse" aria-live="polite" aria-busy="true">
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-4">
      <div className="h-3.5 w-36 rounded bg-slate-700/70" />
      <div className="h-3.5 w-24 rounded bg-slate-700/70" />
    </div>

    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-4">
          <div className="h-3 w-20 rounded bg-slate-700/70 mb-4" />
          <div className="h-8 w-20 rounded bg-slate-700/70 mb-2" />
          <div className="h-3 w-28 rounded bg-slate-700/70" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-8 space-y-3 rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-4">
        <div className="h-4 w-48 rounded bg-slate-700/70" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-[#1e2d4d] bg-[#111c32] p-3">
            <div className="h-4 w-52 rounded bg-slate-700/70 mb-3" />
            <div className="h-3 w-full rounded bg-slate-700/70 mb-2" />
            <div className="h-3 w-3/4 rounded bg-slate-700/70" />
          </div>
        ))}
      </div>

      <div className="xl:col-span-4 rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-4">
        <div className="h-4 w-32 rounded bg-slate-700/70 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 rounded-lg bg-[#111c32] border border-[#1e2d4d]" />
          ))}
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-4 text-sm text-slate-400">{title}</div>
  </div>
);

export const ErrorBanner: React.FC<{ title?: string; message?: string }> = ({
  title = 'Data warning',
  message = 'Some dashboard content could not be loaded. Showing the safe fallback view.'
}) => (
  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100 shadow-inner shadow-amber-500/10">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-full bg-amber-500/20 p-1 text-amber-300">!</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-amber-100/90 mt-1">{message}</div>
      </div>
    </div>
  </div>
);
