import React from 'react';
import { cn } from '../utils/cn';

const Input = ({ label, error, className, 'data-testid': dataTestId, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="uppercase text-xs font-bold text-slate-500 mb-1 block font-general">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-slate-50 border-b-2 border-slate-200 focus:border-slate-900 rounded-t-sm px-4 py-3 outline-none font-general text-base placeholder:text-slate-400',
          error && 'border-red-500 focus:border-red-500',
          className
        )}
        data-testid={dataTestId}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1 font-general">{error}</p>}
    </div>
  );
};

export default Input;