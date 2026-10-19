import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  borderVariant?: 'default' | 'accent' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  borderVariant = 'default',
  className = '',
  ...props
}) => {
  const borderStyles = {
    default: 'border border-sage-200/80',
    accent: 'border-l-4 border-l-terracotta-400 border-y border-r border-sage-200',
    none: 'border-0',
  };

  return (
    <div
      className={`bg-parchment-50 rounded-xl p-5 shadow-[0_2px_8px_-2px_rgba(73,55,43,0.06)] ${borderStyles[borderVariant]} ${
        hoverEffect ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_-4px_rgba(73,55,43,0.12)] hover:border-sage-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
