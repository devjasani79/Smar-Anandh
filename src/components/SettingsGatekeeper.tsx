import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { usePinAuth } from '@/contexts/PinAuthContext';

interface SettingsGatekeeperProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SettingsGatekeeper({ isOpen, onClose, onSuccess }: SettingsGatekeeperProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { validatePin } = usePinAuth();

  const handleDigit = (digit: string) => {
    if (pin.length < 4 && !isLoading) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');

      if (newPin.length === 4) {
        handleSubmit(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleSubmit = async (pinToValidate: string) => {
    setIsLoading(true);
    setError('');

    const result = await validatePin(pinToValidate);

    if (result.success) {
      onSuccess();
      setPin('');
    } else {
      setError(result.error || 'Invalid PIN');
      setPin('');
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background rounded-3xl p-6 w-full max-w-sm shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 
                    className="text-lg font-bold text-foreground"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    Guardian Access
                  </h2>
                  <p 
                    className="text-sm text-muted-foreground"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    Enter Family PIN to continue
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* PIN Dots */}
            <div className="flex justify-center gap-3 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    pin.length > i
                      ? 'bg-primary border-primary'
                      : 'bg-transparent border-muted-foreground/40'
                  }`}
                  animate={pin.length > i ? { scale: [1, 1.2, 1] } : {}}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <p 
                className="text-destructive text-center text-sm mb-4"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {error}
              </p>
            )}

            {/* Mini PIN Pad */}
            <div className="grid grid-cols-3 gap-2">
              {digits.map((digit, index) => {
                if (digit === '') {
                  return <div key={index} className="w-16 h-14" />;
                }

                if (digit === 'del') {
                  return (
                    <motion.button
                      key={index}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDelete}
                      disabled={isLoading || pin.length === 0}
                      className="w-16 h-14 mx-auto rounded-xl bg-muted text-muted-foreground
                                 flex items-center justify-center disabled:opacity-50"
                    >
                      ←
                    </motion.button>
                  );
                }

                return (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDigit(digit)}
                    disabled={isLoading}
                    className="w-16 h-14 mx-auto rounded-xl bg-card text-foreground text-xl font-semibold
                               shadow-sm active:shadow-none disabled:opacity-50 transition-all"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {digit}
                  </motion.button>
                );
              })}
            </div>

            {isLoading && (
              <div className="mt-4 flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
