import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'terracotta';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantStyles = {
    primary: 'bg-forest-700 hover:bg-forest-800 text-parchment-50 shadow-sm focus-visible:ring-forest-600',
    terracotta: 'bg-terracotta-400 hover:bg-terracotta-500 text-white shadow-sm focus-visible:ring-terracotta-400',
    secondary: 'bg-sage-200 hover:bg-sage-300 text-bark-800 focus-visible:ring-sage-400',
    outline: 'border border-bark-400/40 hover:bg-parchment-200 text-bark-800 focus-visible:ring-bark-600',
    ghost: 'hover:bg-parchment-200/70 text-bark-700 focus-visible:ring-bark-500',
    danger: 'bg-red-700 hover:bg-red-800 text-white shadow-sm focus-visible:ring-red-600',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5 font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
