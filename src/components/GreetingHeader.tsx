import { motion } from "framer-motion";
import { Settings } from "lucide-react";

interface GreetingHeaderProps {
  name: string;
  dateString: string;
  timeString: string;
  onSettingsClick?: () => void;
}

export function GreetingHeader({ name, dateString, timeString, onSettingsClick }: GreetingHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative px-6 py-4"
    >
      {/* Settings button - low contrast for guardian access */}
      <button
        onClick={onSettingsClick}
        className="absolute top-4 right-4 p-3 rounded-full text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-6 h-6" />
      </button>

      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="text-display text-foreground mb-2"
        >
          🙏 Namaste, {name}!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-body text-muted-foreground"
        >
          {dateString}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-body-lg font-semibold text-foreground"
        >
          {timeString}
        </motion.p>
      </div>
    </motion.header>
  );
}
