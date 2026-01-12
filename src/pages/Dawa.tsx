import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { MedicineCard } from "@/components/MedicineCard";
import { TactileButton } from "@/components/TactileButton";
import { SuccessOverlay } from "@/components/SuccessOverlay";

export default function Dawa() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  // Demo medicine data
  const currentMedicine = {
    name: "Metformin",
    dosage: "1 Blue Capsule",
    time: "10:00 AM",
  };

  const handleTakeMedicine = () => {
    setShowSuccess(true);
  };

  const handleRemindLater = () => {
    // In real app: schedule reminder for 10 mins later
    navigate("/");
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-safe-bottom">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 px-6 py-4"
      >
        <button
          onClick={() => navigate("/")}
          className="p-3 -ml-3 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>
        <h1 className="text-display text-foreground">💊 Dawa</h1>
      </motion.header>

      {/* Question */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-6"
      >
        <div className="card-warm text-center py-6">
          <p className="text-heading text-foreground">
            Kya aapne yeh dawa le li?
          </p>
          <p className="text-body text-muted-foreground mt-2">
            Did you take this medicine?
          </p>
        </div>
      </motion.section>

      {/* Medicine Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-6 mb-8"
      >
        <MedicineCard
          name={currentMedicine.name}
          dosage={currentMedicine.dosage}
          time={currentMedicine.time}
        />
      </motion.section>

      {/* Action Buttons */}
      <section className="flex-1 px-6 flex flex-col justify-center gap-6 pb-8">
        {/* Primary Action: Yes, I took it */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <TactileButton
            variant="success"
            size="hero"
            onClick={handleTakeMedicine}
            className="w-full"
          >
            ✅ HAAN, LE LIYA
          </TactileButton>
          <p className="text-center text-label text-muted-foreground mt-2">
            Yes, I took it
          </p>
        </motion.div>

        {/* Secondary Action: Remind later */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={handleRemindLater}
            className="inline-flex items-center gap-2 text-body text-muted-foreground hover:text-foreground transition-colors py-3 px-6"
          >
            <Clock className="w-5 h-5" />
            <span>10 Minute Baad Yaad Dilaye</span>
          </button>
          <p className="text-label text-muted-foreground/70">
            Remind me in 10 minutes
          </p>
        </motion.div>
      </section>

      {/* Success Overlay */}
      <SuccessOverlay
        isVisible={showSuccess}
        message="Shandaar!"
        subMessage="Dawa le li. Parivar ko bata diya."
        onClose={handleSuccessClose}
      />
    </div>
  );
}
