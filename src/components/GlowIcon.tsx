import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlowIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
  glowColor?: string;
}

// Custom wrapper for Lucide icons with 2px stroke and soft glow
export function GlowIcon({ icon: Icon, className, size = 24, glowColor = 'primary' }: GlowIconProps) {
  const glowClasses = {
    primary: 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]',
    success: 'drop-shadow-[0_0_8px_hsl(var(--success)/0.5)]',
    destructive: 'drop-shadow-[0_0_8px_hsl(var(--destructive)/0.5)]',
    muted: 'drop-shadow-[0_0_6px_hsl(var(--muted-foreground)/0.3)]',
  };

  return (
    <Icon 
      size={size} 
      strokeWidth={2.5}
      className={cn(
        'transition-all duration-200',
        glowClasses[glowColor as keyof typeof glowClasses] || glowClasses.primary,
        className
      )} 
    />
  );
}
