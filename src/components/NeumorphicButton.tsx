import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface NeumorphicButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'success' | 'alert' | 'neutral';
  size?: 'default' | 'large' | 'hero';
  className?: string;
  disabled?: boolean;
  glowing?: boolean;
}

// Neumorphic/Soft-UI button that feels like a carved physical object
export function NeumorphicButton({
  children,
  onClick,
  variant = 'primary',
  size = 'default',
  className,
  disabled = false,
  glowing = false,
}: NeumorphicButtonProps) {
  const baseStyles = cn(
    'relative overflow-hidden rounded-2xl font-semibold',
    'transition-all duration-150 ease-out',
    'flex flex-col items-center justify-center text-center',
    'select-none cursor-pointer',
    disabled && 'opacity-50 cursor-not-allowed'
  );

  const variantStyles = {
    primary: cn(
      'bg-gradient-to-br from-[hsl(30,100%,55%)] to-[hsl(30,100%,45%)]',
      'text-primary-foreground',
      'shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1),0_8px_20px_rgba(255,158,68,0.3)]',
      glowing && 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_0_30px_hsl(30,100%,50%,0.5),0_8px_20px_rgba(255,158,68,0.4)]'
    ),
    success: cn(
      'bg-gradient-to-br from-[hsl(122,47%,40%)] to-[hsl(122,47%,28%)]',
      'text-success-foreground',
      'shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.1),0_8px_20px_rgba(46,125,50,0.3)]',
      glowing && 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_0_30px_hsl(122,47%,33%,0.5),0_8px_20px_rgba(46,125,50,0.4)]'
    ),
    alert: cn(
      'bg-gradient-to-br from-[hsl(0,75%,55%)] to-[hsl(0,75%,45%)]',
      'text-destructive-foreground',
      'shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.1),0_8px_20px_rgba(211,47,47,0.3)]',
      glowing && 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_0_30px_hsl(0,75%,50%,0.5),0_8px_20px_rgba(211,47,47,0.4)]'
    ),
    neutral: cn(
      'bg-gradient-to-br from-[hsl(30,20%,92%)] to-[hsl(30,20%,85%)]',
      'text-muted-foreground',
      'shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.1)]'
    ),
  };

  const sizeStyles = {
    default: 'min-h-[80px] min-w-[160px] px-6 py-4 text-xl',
    large: 'min-h-[100px] min-w-[200px] px-8 py-5 text-2xl',
    hero: 'min-h-[120px] min-w-full px-8 py-6 text-2xl',
  };

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Inner highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.button>
  );
}
