import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatusPulseEnhancedProps {
  status: 'ok' | 'action';
  message: string;
  subMessage?: string;
  onClick?: () => void;
  className?: string;
}

// Giant glowing status button - the heart of the Darshani screen
export function StatusPulseEnhanced({
  status,
  message,
  subMessage,
  onClick,
  className,
}: StatusPulseEnhancedProps) {
  const isOk = status === 'ok';

  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative w-full rounded-3xl overflow-hidden',
        'min-h-[140px] p-6',
        'flex flex-col items-center justify-center text-center',
        'transition-all duration-300',
        className
      )}
    >
      {/* Background gradient */}
      <div 
        className={cn(
          'absolute inset-0 transition-all duration-500',
          isOk 
            ? 'bg-gradient-to-br from-success/90 to-success' 
            : 'bg-gradient-to-br from-primary/90 to-primary'
        )}
      />

      {/* Glow effect */}
      <div 
        className={cn(
          'absolute inset-0 opacity-50',
          isOk 
            ? 'shadow-[inset_0_0_60px_hsl(122,47%,50%,0.5)]' 
            : 'shadow-[inset_0_0_60px_hsl(30,100%,60%,0.5)]'
        )}
      />

      {/* Animated pulse rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1.5],
            opacity: [0.3, 0, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
          className={cn(
            'absolute w-32 h-32 rounded-full',
            isOk ? 'bg-success-foreground/20' : 'bg-primary-foreground/20'
          )}
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1.3],
            opacity: [0.2, 0, 0]
          }}
          transition={{ 
            duration: 2,
            delay: 0.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
          className={cn(
            'absolute w-24 h-24 rounded-full',
            isOk ? 'bg-success-foreground/20' : 'bg-primary-foreground/20'
          )}
        />
      </div>

      {/* Icon */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10 mb-3"
      >
        <span className="text-5xl">
          {isOk ? '✅' : '⏰'}
        </span>
      </motion.div>

      {/* Text */}
      <div className="relative z-10">
        <h2 className={cn(
          'text-heading font-bold',
          isOk ? 'text-success-foreground' : 'text-primary-foreground'
        )}>
          {message}
        </h2>
        {subMessage && (
          <p className={cn(
            'text-body mt-1 opacity-90',
            isOk ? 'text-success-foreground' : 'text-primary-foreground'
          )}>
            {subMessage}
          </p>
        )}
      </div>

      {/* Outer shadow */}
      <div 
        className={cn(
          'absolute inset-0 pointer-events-none rounded-3xl',
          isOk 
            ? 'shadow-[0_8px_32px_hsl(122,47%,33%,0.4)]' 
            : 'shadow-[0_8px_32px_hsl(30,100%,50%,0.4)]'
        )} 
      />
    </motion.button>
  );
}
