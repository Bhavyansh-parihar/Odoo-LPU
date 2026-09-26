import React from 'react';
import { Filter } from 'lucide-react';

export const FilterDropdown = ({ label, value, onChange, options = [], className = '' }) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
      >
        <option value="ALL">All {label}s</option>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      <Filter className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-slate-400" />
    </div>
  );
};
