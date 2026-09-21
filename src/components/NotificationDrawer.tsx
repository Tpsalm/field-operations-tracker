import React from 'react';

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: 'alert' | 'success' | 'info';
  unread: boolean;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#0e1628] border-l border-[#1e2d4d] h-full flex flex-col justify-between shadow-2xl p-6 text-slate-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#F17F31]/15 text-[#F17F31] border border-[#F17F31]/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <h3 className="font-bold text-sm text-white">Live Operations Alerts</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#151f38]"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between py-3 text-xs border-b border-[#1e2d4d]/60">
            <span className="text-slate-400 font-mono">{notifications.length} Alerts In Queue</span>
            <button
              onClick={onMarkAllRead}
              className="text-[#92C842] hover:underline text-[11px] font-semibold"
            >
              Mark All Read
            </button>
          </div>

          {/* List */}
          <div className="divide-y divide-[#1e2d4d]/60 overflow-y-auto max-h-[75vh] py-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`py-3 px-2 rounded-lg transition-colors ${
                  n.unread ? 'bg-[#151f38]/40' : 'hover:bg-[#151f38]/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`font-semibold text-xs ${
                      n.type === 'alert' ? 'text-[#F17F31]' : n.type === 'success' ? 'text-[#92C842]' : 'text-blue-400'
                    }`}
                  >
                    {n.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-[#151f38] hover:bg-[#1a2745] text-slate-300 rounded-lg text-xs font-semibold"
        >
          Dismiss Alerts Panel
        </button>
      </div>
    </div>
  );
};
