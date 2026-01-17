import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Check } from 'lucide-react';

interface PinPadProps {
  onSubmit: (pin: string) => void;
  isLoading?: boolean;
  error?: string;
  title?: string;
  subtitle?: string;
}

export function PinPad({ 
  onSubmit, 
  isLoading = false, 
  error,
  title = "Family PIN",
  subtitle = "Enter your 4-digit Family PIN"
}: PinPadProps) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4 && !isLoading) {
      const newPin = pin + digit;
      setPin(newPin);
      
      // Auto-submit when 4 digits entered
      if (newPin.length === 4) {
        onSubmit(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (!isLoading) {
      setPin(pin.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!isLoading) {
      setPin('');
    }
  };

  // Shake animation on error
  const handleError = () => {
    setShake(true);
    setPin('');
    setTimeout(() => setShake(false), 500);
  };

  // Watch for error changes
  if (error && !shake && pin.length === 0) {
    // Error state is handled by parent
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-3xl text-foreground mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {title}
        </h1>
        <p className="text-muted-foreground text-lg" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {subtitle}
        </p>
      </motion.div>

      {/* PIN Dots */}
      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex gap-4 mb-8"
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
              pin.length > i
                ? 'bg-primary border-primary scale-110'
                : 'bg-transparent border-muted-foreground/40'
            }`}
            animate={pin.length > i ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.15 }}
          />
        ))}
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-destructive text-center mb-4 font-medium"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* PIN Pad Grid */}
      <div className="grid grid-cols-3 gap-4 max-w-xs">
        {digits.map((digit, index) => {
          if (digit === '') {
            return <div key={index} className="w-20 h-20" />;
          }

          if (digit === 'del') {
            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                disabled={isLoading || pin.length === 0}
                className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center
                           shadow-[4px_4px_12px_hsl(var(--foreground)/0.08),-4px_-4px_12px_hsl(var(--background))]
                           active:shadow-[inset_2px_2px_6px_hsl(var(--foreground)/0.08),inset_-2px_-2px_6px_hsl(var(--background))]
                           disabled:opacity-50 transition-all"
              >
                <Delete className="w-6 h-6 text-muted-foreground" />
              </motion.button>
            );
          }

          return (
            <motion.button
              key={index}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDigit(digit)}
              disabled={isLoading}
              className="w-20 h-20 rounded-2xl bg-card text-foreground text-2xl font-semibold
                         shadow-[6px_6px_16px_hsl(var(--foreground)/0.1),-6px_-6px_16px_hsl(var(--background))]
                         active:shadow-[inset_3px_3px_8px_hsl(var(--foreground)/0.1),inset_-3px_-3px_8px_hsl(var(--background))]
                         disabled:opacity-50 transition-all"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {digit}
            </motion.button>
          );
        })}
      </div>

      {/* Loading Indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 flex items-center gap-2 text-primary"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
            />
            <span style={{ fontFamily: 'Nunito, sans-serif' }}>Verifying...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot PIN Link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-muted-foreground underline text-sm"
        style={{ fontFamily: 'Nunito, sans-serif' }}
        onClick={() => {
          // TODO: Implement forgot PIN flow
          alert('A reset link will be sent to the Guardian\'s email.');
        }}
      >
        Forgot PIN?
      </motion.button>
    </div>
  );
}
