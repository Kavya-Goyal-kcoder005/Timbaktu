import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'sage' | 'forest' | 'terracotta' | 'gold' | 'bark' | 'draft';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'sage',
  size = 'sm',
  icon,
  className = '',
  ...props
}) => {
  const variantStyles = {
    sage: 'bg-sage-200 text-forest-800 border-sage-300',
    forest: 'bg-forest-100 text-forest-800 border-forest-200',
    terracotta: 'bg-terracotta-100 text-terracotta-500 border-terracotta-200',
    gold: 'bg-gold-200 text-bark-800 border-gold-300',
    bark: 'bg-bark-100 text-bark-800 border-bark-200',
    draft: 'bg-amber-100 text-amber-900 border-amber-300',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
