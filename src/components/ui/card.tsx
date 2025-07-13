import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  shadow?: 'soft' | 'medium' | 'strong' | 'extra';
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  background?: 'white' | 'light' | 'dark';
  border?: boolean;
  interactive?: boolean;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  shadow = 'medium',
  rounded = 'xl',
  padding = 'md',
  background = 'white',
  border = true,
  interactive = false,
  glass = false,
}) => {
  const baseClasses = `
    ${background === 'white' ? (glass ? 'glass-effect' : 'bg-white') : background === 'light' ? 'bg-background-light' : 'bg-background-dark'}
    ${shadow === 'soft' ? 'shadow-soft' : shadow === 'medium' ? 'shadow-medium' : shadow === 'strong' ? 'shadow-strong' : 'shadow-extra'}
    ${rounded === 'md' ? 'rounded-md' : rounded === 'lg' ? 'rounded-lg' : rounded === 'xl' ? 'rounded-xl' : rounded === '2xl' ? 'rounded-2xl' : 'rounded-3xl'}
    ${padding === 'none' ? 'p-0' : padding === 'sm' ? 'p-4' : padding === 'md' ? 'p-6' : padding === 'lg' ? 'p-8' : 'p-10'}
    ${border ? 'border border-secondary-200' : ''}
    ${interactive ? 'interactive-element' : ''}
    ${hover ? 'hover:shadow-strong hover:scale-105 transition-all duration-300' : ''}
    ${className}
  `;

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

export default Card;
