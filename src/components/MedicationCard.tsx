import { useState } from "react";
import { motion } from "framer-motion";
import { MedicationWithStatus } from "./TimeSlotCard";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MedicationCardProps {
  med: MedicationWithStatus;
  taken: boolean;
  onToggle: () => void;
}

export function MedicationCard({ med, taken, onToggle }: MedicationCardProps) {
  const [imageError, setImageError] = useState(false);
  const reduced = useReducedMotion();

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border"
      role="listitem"
      aria-label={`${med.name} ${med.dosage}${taken ? ', li ja chuki hai' : ', abhi leni hai'}`}
    >
      {/* Pill visual */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
        style={{ backgroundColor: med.color || 'hsl(var(--muted))' }}
        aria-hidden="true"
      >
        {med.pill_image_url && !imageError ? (
          <img
            src={med.pill_image_url}
            alt={med.name}
            className="w-full h-full object-cover rounded-2xl"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        ) : (
          '💊'
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold text-foreground truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {med.name}
        </p>
        <p className="text-lg text-muted-foreground">{med.dosage}</p>
        {med.instructions && (
          <p className="text-base text-primary">{med.instructions}</p>
        )}
      </div>

      {/* Action */}
      <motion.button
        whileTap={reduced ? {} : { scale: 0.92 }}
        onClick={onToggle}
        disabled={taken}
        aria-label={taken ? `${med.name} le li` : `${med.name} le lein, tap karein`}
        aria-pressed={taken}
        className={`
          w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0
          font-bold transition-colors
          ${taken
            ? 'bg-success text-success-foreground'
            : 'bg-primary text-primary-foreground active:bg-primary/90'
          }
        `}
      >
        {taken ? '✅' : '👆'}
      </motion.button>
    </div>
  );
}
