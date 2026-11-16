import React from 'react';

export interface QuickActionTileProps {
  label: string;
  icon: React.ReactNode;
  variant?: 'blue' | 'green' | 'purple' | 'yellow';
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
    blue: 'bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 border-blue-100/80 hover:border-blue-200',
    green: 'bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-700 border-emerald-100/80 hover:border-emerald-200',
    purple: 'bg-purple-50/70 hover:bg-purple-100/70 text-purple-700 border-purple-100/80 hover:border-purple-200',
    yellow: 'bg-amber-50/70 hover:bg-amber-100/70 text-amber-800 border-amber-100/80 hover:border-amber-200',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-center justify-center gap-2.5 rounded-2xl md:rounded-3xl border p-5 md:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantStyles[variant]} ${className}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-xs transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <span className="text-xs md:text-sm font-semibold tracking-tight text-center">
        {label}
      </span>
    </button>
  );
}

export default QuickActionTile;
