import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface StatCardProps {
  number: string | number;
  title?: string;
  linkText?: string;
  onLinkClick?: () => void;
  icon: React.ReactNode;
  variant: 'blue' | 'green' | 'purple';
  className?: string;
}

export function StatCard({
  number,
  title,
  linkText,
  onLinkClick,
  icon,
  variant,
  className = '',
}: StatCardProps) {
  const variantStyles = {
    blue: {
      card: 'bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-white/95 border-blue-200/80 shadow-[0_4px_24px_rgba(37,99,235,0.06)] hover:border-blue-300 hover:shadow-[0_8px_30px_rgba(37,99,235,0.12)]',
      iconWrapper: 'bg-blue-100/70 text-blue-600 border border-blue-200/60 shadow-xs',
      text: 'text-slate-600',
      link: 'text-blue-600 hover:text-blue-700',
    },
    green: {
      card: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white/95 border-emerald-200/80 shadow-[0_4px_24px_rgba(16,185,129,0.06)] hover:border-emerald-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]',
      iconWrapper: 'bg-emerald-100/70 text-emerald-600 border border-emerald-200/60 shadow-xs',
      text: 'text-slate-600',
      link: 'text-emerald-700 hover:text-emerald-800',
    },
    purple: {
      card: 'bg-gradient-to-br from-purple-50/90 via-violet-50/50 to-white/95 border-purple-200/80 shadow-[0_4px_24px_rgba(139,92,246,0.06)] hover:border-purple-300 hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)]',
      iconWrapper: 'bg-purple-100/70 text-purple-600 border border-purple-200/60 shadow-xs',
      text: 'text-slate-600',
      link: 'text-purple-600 hover:text-purple-700',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`h-full flex flex-col justify-between rounded-2xl md:rounded-3xl border p-6 md:p-7 transition-all duration-200 hover:-translate-y-0.5 cursor-default ${style.card} ${className}`}
    >
      {/* Top: Icon */}
      <div>
        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${style.iconWrapper}`}
        >
          {icon}
        </div>
      </div>

      {/* Bottom: Large Number and Title / Action */}
      <div className="mt-5 space-y-1">
        <p className="text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-none">
          {number}
        </p>

        {title && (
          <p className={`text-sm md:text-[15px] font-semibold tracking-tight pt-1 ${style.text}`}>
            {title}
          </p>
        )}

        {linkText && (
          <button
            type="button"
            onClick={onLinkClick}
            className={`group inline-flex items-center gap-1.5 text-sm md:text-[15px] font-semibold tracking-tight pt-1 transition-colors cursor-pointer ${style.link}`}
          >
            <span>{linkText}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
          </button>
        )}
      </div>
    </div>
  );
}

export default StatCard;
