import React from 'react';
import { Card } from '../ui/Card';

export const KpiCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', onClick }) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer hover:border-indigo-300' : ''}`}>
      <div className="p-5 flex items-start justify-between" onClick={onClick}>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color]} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};
