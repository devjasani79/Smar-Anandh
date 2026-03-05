import { motion } from "framer-motion";
import { MedicationCard } from "./MedicationCard";
import { TactileButton } from "./TactileButton";

export interface MedicationWithStatus {
  id: string;
  name: string;
  dosage: string;
  color: string | null;
  instructions: string | null;
  pill_image_url: string | null;
  taken: boolean;
  logId?: string;
  time: string;
}

interface TimeSlotCardProps {
  slot: string;
  icon: string;
  meds: MedicationWithStatus[];
  allTaken: boolean;
  onTakeMed: (med: MedicationWithStatus) => void;
  onTakeAll: () => void;
}

export function TimeSlotCard({ slot, icon, meds, allTaken, onTakeMed, onTakeAll }: TimeSlotCardProps) {
  if (meds.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 4px 20px -4px hsl(30 50% 20% / 0.12)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {slot}
          </h3>
        </div>
        {allTaken && (
          <span className="text-lg font-semibold text-success flex items-center gap-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Sab Ho Gaya ✅
          </span>
        )}
      </div>

      {/* Medication list */}
      <div className="p-4 space-y-3">
        {meds.map((med) => (
          <MedicationCard
            key={`${med.id}-${med.time}`}
            med={med}
            taken={med.taken}
            onToggle={() => onTakeMed(med)}
          />
        ))}
      </div>

      {/* Take All button */}
      {!allTaken && meds.some(m => !m.taken) && (
        <div className="px-4 pb-4">
          <TactileButton
            variant="primary"
            size="large"
            onClick={onTakeAll}
            className="w-full"
          >
            ✅ Sab Dawa Le Lein
          </TactileButton>
        </div>
      )}
    </motion.div>
  );
}
