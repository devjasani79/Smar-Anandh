import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EntertainmentTileProps {
  icon: ReactNode;
  label: string;
  sublabel: string;
  backgroundImage?: string;
  onClick?: () => void;
  delay?: number;
}

export function EntertainmentTile({
  icon,
  label,
  sublabel,
  backgroundImage,
  onClick,
  delay = 0,
}: EntertainmentTileProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.1, type: "spring", stiffness: 300, damping: 25 }}
      whileTap={{ scale: 0.97 }}
      className="
        relative overflow-hidden rounded-2xl min-h-[160px] w-full
        flex flex-col items-center justify-center gap-2 p-6
        text-center transition-all duration-150
        shadow-[0_8px_32px_-8px_hsl(30_50%_20%/0.2)]
        active:shadow-[0_2px_8px_-2px_hsl(30_50%_20%/0.2)]
        focus:outline-none focus:ring-4 focus:ring-primary/40
      "
    >
      {/* Background image with overlay */}
      {backgroundImage ? (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/20" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent to-secondary" />
      )}

      {/* Content */}
      <span className="relative z-10 text-4xl">{icon}</span>
      <div className="relative z-10">
        <p className={`text-heading font-bold ${backgroundImage ? 'text-white' : 'text-foreground'}`}>
          {label}
        </p>
        <p className={`text-label ${backgroundImage ? 'text-white/80' : 'text-muted-foreground'}`}>
          {sublabel}
        </p>
      </div>
    </motion.button>
  );
}
