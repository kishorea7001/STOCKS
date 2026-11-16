import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'soft-blue'
    | 'soft-green'
    | 'soft-purple'
    | 'soft-yellow'
    | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 border border-transparent rounded-xl md:rounded-2xl',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs rounded-xl md:rounded-2xl',
    'soft-blue':
      'bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 border border-blue-100 rounded-xl md:rounded-2xl',
    'soft-green':
      'bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-100 rounded-xl md:rounded-2xl',
    'soft-purple':
      'bg-purple-50/80 hover:bg-purple-100/80 text-purple-700 border border-purple-100 rounded-xl md:rounded-2xl',
    'soft-yellow':
      'bg-amber-50/80 hover:bg-amber-100/80 text-amber-800 border border-amber-100 rounded-xl md:rounded-2xl',
    ghost:
      'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 rounded-xl',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2 font-medium',
    lg: 'text-base px-6 py-3 min-h-[50px] gap-2.5 font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
}

export default Button;
