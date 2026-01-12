import { motion } from "framer-motion";
import { ReactNode } from "react";

interface NavTileProps {
  icon: ReactNode;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  delay?: number;
}

export function NavTile({ icon, label, sublabel, onClick, delay = 0 }: NavTileProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, type: "spring", stiffness: 300, damping: 25 }}
      whileTap={{ scale: 0.97 }}
      className="
        card-warm flex flex-col items-center justify-center gap-3
        min-h-[140px] w-full
        transition-all duration-150
        active:shadow-[0_2px_8px_-2px_hsl(30_50%_20%/0.2)]
        focus:outline-none focus:ring-4 focus:ring-primary/40
      "
    >
      <span className="text-4xl">{icon}</span>
      <div className="text-center">
        <p className="text-heading text-foreground">{label}</p>
        {sublabel && <p className="text-label text-muted-foreground">{sublabel}</p>}
      </div>
    </motion.button>
  );
}
