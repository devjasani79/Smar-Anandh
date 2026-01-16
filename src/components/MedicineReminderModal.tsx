import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TactileButton } from './TactileButton';

interface MedicineReminderModalProps {
  isOpen: boolean;
  medicine: {
    id: string;
    name: string;
    dosage: string;
    color?: string;
    pillImageUrl?: string;
  };
  onConfirm: () => void;
  onSnooze: () => void;
  onClose: () => void;
}

export function MedicineReminderModal({
  isOpen,
  medicine,
  onConfirm,
  onSnooze,
  onClose,
}: MedicineReminderModalProps) {
  const [nudging, setNudging] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Start nudge timer when modal opens
  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => {
        setNudging(true);
      }, 30000); // 30 seconds
      setTimeoutId(id);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setNudging(false);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Pulsing border when nudging */}
        <div 
          className={`absolute inset-0 ${nudging ? 'animate-pulse' : ''}`}
          style={{
            boxShadow: nudging ? 'inset 0 0 0 8px hsl(var(--primary))' : 'none',
            transition: 'box-shadow 0.3s ease-in-out'
          }}
        />
        
        <div className="relative h-full flex flex-col items-center justify-center p-6">
          {/* Close button - small and subtle */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Medicine image */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-48 h-48 mb-8 rounded-3xl overflow-hidden bg-card shadow-lg flex items-center justify-center"
          >
            {medicine.pillImageUrl ? (
              <img
                src={medicine.pillImageUrl}
                alt={medicine.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-8xl">💊</span>
            )}
          </motion.div>

          {/* Medicine info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-display text-foreground mb-2">
              Kripya Apni Dawa Lein
            </h1>
            <p className="text-heading text-muted-foreground mb-4">
              Please take your medicine
            </p>
            <div className="bg-primary/10 rounded-2xl px-6 py-4">
              <p className="text-heading text-foreground">
                {medicine.name}
              </p>
              <p className="text-body text-muted-foreground">
                {medicine.dosage}
              </p>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-md space-y-4"
          >
            {/* Primary action - YES I TOOK IT */}
            <TactileButton
              variant="success"
              size="hero"
              onClick={onConfirm}
              className="w-full"
            >
              <span className="text-2xl font-bold">HAAN, LE LIYA</span>
              <span className="text-lg opacity-90 block">Yes, I took it</span>
            </TactileButton>

            {/* Snooze option */}
            <TactileButton
              variant="neutral"
              size="large"
              onClick={onSnooze}
              className="w-full"
            >
              <span className="text-lg">10 Minute Baad Yaad Dilaye</span>
              <span className="text-sm opacity-80 block">Remind me in 10 mins</span>
            </TactileButton>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
