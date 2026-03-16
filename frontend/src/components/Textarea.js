import React from 'react';
import { cn } from '../utils/cn';

const Textarea = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="uppercase text-xs font-bold text-slate-500 mb-1 block font-general">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full bg-slate-50 border-2 border-slate-200 focus:border-slate-900 rounded-sm px-4 py-3 outline-none font-general text-base placeholder:text-slate-400 min-h-[200px]',
          error && 'border-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1 font-general">{error}</p>}
    </div>
  );
};

export default Textarea;