import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "font-nunito font-bold transition-all duration-200 rounded-full flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#d58f99] text-white hover:bg-[#c07a84] shadow-md hover:shadow-lg",
    secondary: "bg-[#917c71] text-white hover:bg-[#7a665c] shadow-md",
    outline: "border-2 border-[#d58f99] text-[#d58f99] hover:bg-[#d58f99] hover:text-white",
    ghost: "text-[#917c71] hover:bg-[#eae2e8]"
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-5 py-2 text-base",
    lg: "px-8 py-3 text-lg"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};