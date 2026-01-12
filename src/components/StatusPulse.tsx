import { motion } from "framer-motion";
import { Check, Clock } from "lucide-react";

interface StatusPulseProps {
  status: "ok" | "action";
  message: string;
}

export function StatusPulse({ status, message }: StatusPulseProps) {
  const isOk = status === "ok";

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        relative flex items-center gap-4 px-6 py-4 rounded-2xl
        ${isOk 
          ? "bg-success/10 border-2 border-success/30" 
          : "bg-primary/10 border-2 border-primary/30"
        }
      `}
    >
      {/* Animated pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`
          absolute left-4 w-12 h-12 rounded-full
          ${isOk ? "bg-success" : "bg-primary"}
        `}
      />
      
      {/* Icon circle */}
      <div
        className={`
          relative z-10 flex items-center justify-center w-12 h-12 rounded-full
          ${isOk ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"}
        `}
      >
        {isOk ? <Check className="w-7 h-7" strokeWidth={3} /> : <Clock className="w-7 h-7" strokeWidth={2.5} />}
      </div>
      
      {/* Message */}
      <p className={`text-body-lg font-semibold ${isOk ? "text-success" : "text-primary"}`}>
        {message}
      </p>
    </motion.div>
  );
}
