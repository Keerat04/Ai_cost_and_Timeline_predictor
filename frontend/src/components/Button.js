import React from 'react';
import { cn } from '../utils/cn';

const Button = ({ children, variant = 'primary', className, disabled, ...props }) => {
  const baseStyles = 'rounded-none px-8 py-3 font-general font-medium text-sm tracking-normal focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-[4px_4px_0px_0px_#0D9488] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
    secondary: 'bg-white border-2 border-slate-200 text-slate-900 hover:border-slate-900',
    accent: 'bg-orange-500 text-white hover:bg-orange-600 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;