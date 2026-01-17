import { motion } from 'framer-motion';
import { Heart, LayoutDashboard } from 'lucide-react';

interface RoleSwitcherProps {
  preferredName: string | null;
  seniorName: string;
  onSelectSenior: () => void;
  onSelectGuardian: () => void;
}

export function RoleSwitcher({ 
  preferredName, 
  seniorName, 
  onSelectSenior, 
  onSelectGuardian 
}: RoleSwitcherProps) {
  const displayName = preferredName || seniorName;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 
          className="text-3xl text-foreground mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Welcome!
        </h1>
        <p 
          className="text-muted-foreground text-lg"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          How would you like to continue?
        </p>
      </motion.div>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        {/* Companion Mode Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSelectSenior}
          className="w-full p-6 rounded-3xl bg-success text-success-foreground
                     shadow-[8px_8px_24px_hsl(var(--success)/0.3),-4px_-4px_12px_hsl(var(--background))]
                     active:shadow-[inset_4px_4px_12px_hsl(var(--foreground)/0.1)]
                     transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
            <div className="text-left flex-1">
              <h2 
                className="text-xl font-bold mb-1"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Companion Mode
              </h2>
              <p 
                className="text-sm opacity-90"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Continue as {displayName}
              </p>
            </div>
          </div>
        </motion.button>

        {/* Guardian Dashboard Button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSelectGuardian}
          className="w-full p-6 rounded-3xl bg-primary text-primary-foreground
                     shadow-[8px_8px_24px_hsl(var(--primary)/0.3),-4px_-4px_12px_hsl(var(--background))]
                     active:shadow-[inset_4px_4px_12px_hsl(var(--foreground)/0.1)]
                     transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div className="text-left flex-1">
              <h2 
                className="text-xl font-bold mb-1"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Guardian Dashboard
              </h2>
              <p 
                className="text-sm opacity-90"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Manage care settings
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-muted-foreground text-sm text-center"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        "Because being away doesn't mean being disconnected."
      </motion.p>
    </div>
  );
}
