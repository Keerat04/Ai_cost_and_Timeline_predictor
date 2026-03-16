import React from 'react';
import { cn } from '../utils/cn';

const Card = ({ children, className, tracing = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 p-8 rounded-sm hover:border-slate-400 relative overflow-hidden',
        tracing && 'tracing-beam',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;