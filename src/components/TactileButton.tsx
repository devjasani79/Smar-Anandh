import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TactileButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "success" | "alert" | "neutral";
  icon?: ReactNode;
  size?: "default" | "large" | "hero";
  className?: string;
  disabled?: boolean;
}

const variantStyles = {
  primary: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  alert: "bg-destructive text-destructive-foreground",
  neutral: "bg-muted text-muted-foreground",
};

const sizeStyles = {
  default: "min-h-touch px-6 py-4 text-body-lg",
  large: "min-h-touch-lg px-8 py-5 text-heading",
  hero: "min-h-[120px] px-8 py-6 text-heading",
};

export function TactileButton({
  children,
  onClick,
  variant = "primary",
  icon,
  size = "default",
  className = "",
  disabled = false,
}: TactileButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        relative overflow-hidden rounded-2xl font-semibold
        flex items-center justify-center gap-3
        transition-shadow duration-150 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-[0_8px_32px_-8px_hsl(30_50%_20%/0.2)]
        active:shadow-[0_2px_8px_-2px_hsl(30_50%_20%/0.2)]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon && <span className="text-[1.5em]">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}
