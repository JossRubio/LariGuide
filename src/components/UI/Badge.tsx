import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'gold' | 'green' | 'yellow' | 'red' | 'terracotta';
}

export function Badge({ children, variant = 'gold' }: BadgeProps) {
  const variants = {
    gold: 'bg-gold/20 text-gold border border-gold/30',
    green: 'bg-green-500/20 text-green-400 border border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    red: 'bg-red-500/20 text-red-400 border border-red-500/30',
    terracotta: 'bg-terracotta/20 text-terracotta border border-terracotta/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
