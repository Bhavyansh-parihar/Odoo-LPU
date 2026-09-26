import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ label = 'Loading inventory data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
};
