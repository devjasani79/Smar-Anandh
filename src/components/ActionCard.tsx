import { motion } from "framer-motion";
import { TactileButton } from "./TactileButton";

interface ActionCardProps {
  variant: 'urgent' | 'calm' | 'info';
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  pulse?: boolean;
}

const variantStyles = {
  urgent: {
    bg: "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30",
    border: "border-l-4 border-l-amber-500",
    button: "primary" as const,
  },
  calm: {
    bg: "bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
    border: "border-l-4 border-l-success",
    button: "success" as const,
  },
  info: {
    bg: "bg-gradient-to-r from-blue-50 to-sky-100 dark:from-blue-900/20 dark:to-sky-900/20",
    border: "border-l-4 border-l-blue-500",
    button: "neutral" as const,
  },
};

export function ActionCard({ variant, icon, title, description, actionLabel, onAction, pulse }: ActionCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`rounded-2xl p-6 ${styles.bg} ${styles.border}`}
    >
      <div className="flex items-start gap-4 mb-4">
        <span className="text-4xl">{icon}</span>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {title}
          </h2>
          <p className="text-lg text-muted-foreground mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {description}
          </p>
        </div>
      </div>
      <motion.div
        animate={pulse ? { scale: [1, 1.02, 1] } : {}}
        transition={pulse ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
      >
        <TactileButton
          variant={styles.button}
          size="large"
          onClick={onAction}
          className="w-full"
        >
          {actionLabel}
        </TactileButton>
      </motion.div>
    </motion.div>
  );
}
