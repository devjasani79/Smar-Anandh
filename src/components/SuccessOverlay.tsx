import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect } from "react";

interface SuccessOverlayProps {
  isVisible: boolean;
  message: string;
  subMessage?: string;
  onClose: () => void;
  autoCloseMs?: number;
}

export function SuccessOverlay({
  isVisible,
  message,
  subMessage,
  onClose,
  autoCloseMs = 2500,
}: SuccessOverlayProps) {
  useEffect(() => {
    if (isVisible && autoCloseMs > 0) {
      const timer = setTimeout(onClose, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoCloseMs, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-success p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            {/* Animated checkmark circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center justify-center w-32 h-32 rounded-full bg-success-foreground/20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
              >
                <Check className="w-20 h-20 text-success-foreground" strokeWidth={3} />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-display text-success-foreground"
            >
              {message}
            </motion.h1>

            {subMessage && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-body-lg text-success-foreground/90"
              >
                {subMessage}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
