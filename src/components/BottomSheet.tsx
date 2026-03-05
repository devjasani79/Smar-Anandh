import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Settings, X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onGuardianMode?: () => void;
  showGuardianMode: boolean;
}

export function BottomSheet({ isOpen, onClose, onLogout, onGuardianMode, showGuardianMode }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-foreground/50 z-40"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 pb-safe-bottom"
            style={{ boxShadow: "0 -8px 32px hsl(0 0% 0% / 0.15)" }}
          >
            {/* Handle */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            <div className="space-y-3">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-destructive/10 active:bg-destructive/20 transition-colors min-h-[64px]"
              >
                <LogOut className="w-6 h-6 text-destructive" />
                <span className="text-xl font-semibold text-destructive" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Logout / Baahar Jaayein
                </span>
              </button>

              {showGuardianMode && onGuardianMode && (
                <button
                  onClick={onGuardianMode}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-muted active:bg-muted/80 transition-colors min-h-[64px]"
                >
                  <Settings className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xl font-semibold text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Guardian Mode
                  </span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-border active:bg-muted transition-colors min-h-[64px]"
              >
                <X className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Band Karein
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
