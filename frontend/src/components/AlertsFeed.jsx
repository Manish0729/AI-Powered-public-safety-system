import React from 'react';
import { AlertOctagon, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function AlertsFeed({ alerts = [] }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 opacity-50">
        <ShieldAlert size={48} />
        <p className="text-xs font-mono">NO ACTIVE THREATS</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <div key={idx} className="bg-slate-800/50 border border-white/5 p-3 rounded-lg flex items-start gap-3 hover:bg-white/5 transition-colors animate-fade-in">
          <div className="bg-red-500/20 p-2 rounded-md shrink-0">
            <AlertOctagon size={16} className="text-red-500" />
          </div>
          <div className="min-w-0">
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="text-sm font-bold text-white truncate pr-2">{alert.type}</h4>
              <span className="text-[10px] font-mono text-cyan-400 shrink-0">{alert.time}</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">LOC: {alert.location}</p>
          </div>
        </div>
      ))}
    </div>
  );
}