import React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  borderHeader?: boolean;
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
  borderHeader = false,
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
        <div
          className={`flex items-center justify-between px-6 pt-6 pb-2 md:px-7 md:pt-7 md:pb-3 ${
            borderHeader ? 'border-b border-slate-100/70 pb-4 md:pb-5' : ''
          }`}
        >
          <div className="flex items-center gap-2.5">
            {icon && (
              <div className="flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
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
      <div className={`p-6 md:p-7 ${title || icon || action ? 'pt-3 md:pt-4' : ''} ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}

export default Card;
