import { motion } from "framer-motion";
import { ReactNode } from "react";

interface NavTileProps {
  icon: ReactNode;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  delay?: number;
  size?: 'normal' | 'full';
  variant?: 'default' | 'urgent' | 'danger';
  pulse?: boolean;
}

const variantClasses = {
  default: "card-warm",
  urgent: "bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-400/50 rounded-2xl p-6",
  danger: "bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-destructive/40 rounded-2xl p-6",
};

export function NavTile({ icon, label, sublabel, onClick, delay = 0, size = 'normal', variant = 'default', pulse = false }: NavTileProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, type: "spring", stiffness: 300, damping: 25 }}
      whileTap={{ scale: 0.97 }}
      className={`
        flex flex-col items-center justify-center gap-3
        ${size === 'full' ? 'col-span-2 min-h-[120px]' : 'min-h-[140px]'}
        w-full transition-all duration-150
        active:shadow-[0_2px_8px_-2px_hsl(30_50%_20%/0.2)]
        focus:outline-none focus:ring-4 focus:ring-primary/40
        ${variantClasses[variant]}
      `}
    >
      <motion.span
        className="text-4xl"
        animate={pulse ? { scale: [1, 1.15, 1] } : {}}
        transition={pulse ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
      >
        {icon}
      </motion.span>
      <div className="text-center">
        <p className="text-heading text-foreground">{label}</p>
        {sublabel && <p className="text-label text-muted-foreground">{sublabel}</p>}
      </div>
    </motion.button>
  );
}
