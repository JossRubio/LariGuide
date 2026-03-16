import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  loading,
  disabled,
  className = '',
  fullWidth,
}: ButtonProps) {
  const base =
    'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 overflow-hidden';

  const variants = {
    primary:
      'bg-terracotta text-ivory px-6 py-3 text-sm hover:bg-terracotta/90 shadow-lg shadow-terracotta/30',
    secondary:
      'bg-gold/10 text-gold border border-gold/30 px-6 py-3 text-sm hover:bg-gold/20',
    ghost: 'text-ivory/60 hover:text-ivory px-4 py-2 text-sm',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          Generando...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
