import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default Card;