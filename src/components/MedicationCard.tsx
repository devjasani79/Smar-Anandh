import { motion } from "framer-motion";
import { MedicationWithStatus } from "./TimeSlotCard";

interface MedicationCardProps {
  med: MedicationWithStatus;
  taken: boolean;
  onToggle: () => void;
}

export function MedicationCard({ med, taken, onToggle }: MedicationCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border">
      {/* Pill visual */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
        style={{ backgroundColor: med.color || 'hsl(var(--muted))' }}
      >
        {med.pill_image_url ? (
          <img
            src={med.pill_image_url}
            alt={med.name}
            className="w-full h-full object-cover rounded-2xl"
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
        whileTap={{ scale: 0.92 }}
        onClick={onToggle}
        disabled={taken}
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
