import React from 'react';

export const Table = ({ children, className = '' }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full text-left border-collapse text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '' }) => {
  return (
    <thead className={`bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '' }) => {
  return <tbody className={`divide-y divide-slate-100 bg-white ${className}`}>{children}</tbody>;
};

export const TableRow = ({ children, className = '', onClick }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors ${onClick ? 'hover:bg-slate-50/80 cursor-pointer' : 'hover:bg-slate-50/50'} ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '' }) => {
  return <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>;
};

export const TableCell = ({ children, className = '' }) => {
  return <td className={`px-4 py-3.5 text-slate-700 ${className}`}>{children}</td>;
};
