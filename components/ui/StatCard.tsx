import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  variant?: 'blue' | 'green' | 'purple' | 'yellow';
  icon: React.ReactNode;
  linkText?: string;
  onLinkClick?: () => void;
  trendText?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  variant = 'blue',
  icon,
  linkText,
  onLinkClick,
  trendText,
  className = '',
}: StatCardProps) {
  const variantStyles = {
    blue: {
      cardBg:
        'bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 border-blue-100/70 hover:border-blue-200 hover:shadow-blue-500/5',
      iconBox: 'bg-blue-600 text-white shadow-sm shadow-blue-500/20',
      valueColor: 'text-slate-900',
      labelColor: 'text-slate-600',
      linkColor: 'text-blue-600 hover:text-blue-700',
    },
    green: {
      cardBg:
        'bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 border-emerald-100/70 hover:border-emerald-200 hover:shadow-emerald-500/5',
      iconBox: 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20',
      valueColor: 'text-slate-900',
      labelColor: 'text-slate-600',
      linkColor: 'text-emerald-700 hover:text-emerald-800',
    },
    purple: {
      cardBg:
        'bg-gradient-to-br from-purple-50/70 via-white to-violet-50/30 border-purple-100/70 hover:border-purple-200 hover:shadow-purple-500/5',
      iconBox: 'bg-purple-600 text-white shadow-sm shadow-purple-500/20',
      valueColor: 'text-slate-900',
      labelColor: 'text-slate-600',
      linkColor: 'text-purple-600 hover:text-purple-700',
    },
    yellow: {
      cardBg:
        'bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/30 border-amber-100/70 hover:border-amber-200 hover:shadow-amber-500/5',
      iconBox: 'bg-amber-500 text-white shadow-sm shadow-amber-500/20',
      valueColor: 'text-slate-900',
      labelColor: 'text-slate-600',
      linkColor: 'text-amber-700 hover:text-amber-800',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl md:rounded-3xl border p-6 md:p-7 shadow-[0_4px_24px_rgba(15,23,42,0.03)] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 ${style.cardBg} ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${style.iconBox}`}
          >
            {icon}
          </div>
          <div className="pt-2">
            <p className={`text-3xl md:text-4xl font-bold tracking-tight ${style.valueColor}`}>
              {value}
            </p>
            <p className={`text-xs md:text-sm font-medium mt-1 ${style.labelColor}`}>
              {label}
            </p>
          </div>
        </div>

        {trendText && (
          <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs border border-slate-100">
            {trendText}
          </span>
        )}
      </div>

      {linkText && (
        <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onLinkClick}
            className={`group inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold transition-colors cursor-pointer ${style.linkColor}`}
          >
            <span>{linkText}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  );
}

export default StatCard;
