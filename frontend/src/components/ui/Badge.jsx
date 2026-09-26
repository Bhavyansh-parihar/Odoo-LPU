import React from 'react';

const statusStyles = {
  // Document / Order Statuses
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Ready: 'bg-blue-50 text-blue-700 border-blue-200',
  Waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  Picked: 'bg-purple-50 text-purple-700 border-purple-200',
  Packed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Applied: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  
  // Stock Statuses
  'In Stock': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200',
  'Out of Stock': 'bg-rose-50 text-rose-700 border-rose-200',

  // Roles / Misc
  Admin: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Manager: 'bg-sky-100 text-sky-800 border-sky-200'
};

export const Badge = ({ children, variant, className = '' }) => {
  const matchedStyle = statusStyles[children] || statusStyles[variant] || 'bg-slate-100 text-slate-700 border-slate-200';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${matchedStyle} ${className}`}>
      {children}
    </span>
  );
};
