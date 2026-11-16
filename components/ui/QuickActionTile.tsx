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
        'bg-[#EFF6FF] border-blue-200/80 text-blue-600 hover:bg-blue-100/70 hover:border-blue-300 hover:shadow-[0_8px_20px_rgba(37,99,235,0.12)]',
      text: 'text-blue-600',
    },
    green: {
      button:
        'bg-[#ECFDF5] border-emerald-200/80 text-emerald-600 hover:bg-emerald-100/70 hover:border-emerald-300 hover:shadow-[0_8px_20px_rgba(16,185,129,0.12)]',
      text: 'text-emerald-600',
    },
    purple: {
      button:
        'bg-[#F5F3FF] border-purple-200/80 text-purple-600 hover:bg-purple-100/70 hover:border-purple-300 hover:shadow-[0_8px_20px_rgba(139,92,246,0.12)]',
      text: 'text-purple-600',
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
