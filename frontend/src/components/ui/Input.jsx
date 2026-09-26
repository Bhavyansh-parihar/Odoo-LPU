import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  icon: Icon,
  helperText,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-2xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`block w-full rounded-lg border text-sm transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2 ${
            Icon ? 'pl-9' : 'pl-3'
          } pr-3 ${
            error
              ? 'border-rose-300 text-rose-900 placeholder-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
              : 'border-slate-300 text-slate-900 bg-white placeholder-slate-400'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
