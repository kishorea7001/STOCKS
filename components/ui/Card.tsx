import React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  hoverEffect?: boolean;
}

export function Card({
  children,
  title,
  subtitle,
  icon,
  action,
  className = '',
  bodyClassName = '',
  hoverEffect = false,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl md:rounded-3xl border border-slate-100/90 shadow-[0_4px_24px_rgba(15,23,42,0.03)] ${
        hoverEffect ? 'transition-all duration-200 hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:border-blue-100' : ''
      } ${className}`}
    >
      {(title || icon || action) && (
        <div className="flex items-center justify-between border-b border-slate-100/70 px-6 py-4 md:px-7 md:py-5">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex items-center justify-center text-slate-700">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base md:text-lg font-semibold text-slate-800 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-6 md:p-7 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

export default Card;
