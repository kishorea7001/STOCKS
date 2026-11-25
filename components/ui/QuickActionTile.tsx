import React from 'react';

export interface QuickActionTileProps {
  label: string;
  icon: React.ReactNode;
  variant?: 'blue' | 'green' | 'purple';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function QuickActionTile({
  label,
  icon,
  variant = 'blue',
  onClick,
  disabled = false,
  className = '',
}: QuickActionTileProps) {
  const variantStyles = {
    blue: {
      button:
        'bg-[#EFF6FF] dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-[0_8px_20px_rgba(37,99,235,0.12)]',
      text: 'text-blue-600 dark:text-blue-400',
    },
    green: {
      button:
        'bg-[#ECFDF5] dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-[0_8px_20px_rgba(16,185,129,0.12)]',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    purple: {
      button:
        'bg-[#F5F3FF] dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100/70 dark:hover:bg-purple-900/50 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-[0_8px_20px_rgba(139,92,246,0.12)]',
      text: 'text-purple-600 dark:text-purple-400',
    },
  };

  const style = variantStyles[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-center justify-center py-6 px-4 rounded-2xl md:rounded-3xl border transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none ${style.button} ${className}`}
    >
      {/* Large centered icon with subtle hover animation */}
      <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>

      {/* Text underneath */}
      <span
        className={`mt-2.5 text-xs md:text-sm font-semibold tracking-tight text-center ${style.text}`}
      >
        {label}
      </span>
    </button>
  );
}

export default QuickActionTile;
