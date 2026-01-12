import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { TactileButton } from "@/components/TactileButton";
import { SuccessOverlay } from "@/components/SuccessOverlay";

type Step = "confirm" | "action";

export default function Madad() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("confirm");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCallFamily = () => {
    setShowSuccess(true);
  };

  const handleImOkay = () => {
    navigate("/");
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-safe-bottom">
      <AnimatePresence mode="wait">
        {step === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-12"
          >
            {/* Large SOS Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mb-8"
            >
              <div className="w-40 h-40 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse-soft">
                <span className="text-8xl">🆘</span>
              </div>
            </motion.div>

            {/* Question */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <h1 className="text-display text-foreground mb-3">
                Kya aapko madad chahiye?
              </h1>
              <p className="text-body-lg text-muted-foreground">
                Do you need help?
              </p>
              <p className="text-body text-muted-foreground mt-4">
                Apne parivar ko bulaye?
              </p>
              <p className="text-label text-muted-foreground">
                Alert your family?
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-sm space-y-4"
            >
              <TactileButton
                variant="alert"
                size="hero"
                onClick={handleCallFamily}
                icon={<Phone className="w-8 h-8" />}
                className="w-full"
              >
                HAAN, BULAO
              </TactileButton>
              <p className="text-center text-label text-muted-foreground">
                Yes, call them
              </p>

              <TactileButton
                variant="neutral"
                size="large"
                onClick={handleImOkay}
                className="w-full mt-6"
              >
                NAHI, THEEK HUN
              </TactileButton>
              <p className="text-center text-label text-muted-foreground">
                No, I'm okay
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Overlay - Family Alerted */}
      <SuccessOverlay
        isVisible={showSuccess}
        message="Parivar ko bata diya!"
        subMessage="Aapka beta jaldi aayega."
        onClose={handleSuccessClose}
        autoCloseMs={3000}
      />
    </div>
  );
}
