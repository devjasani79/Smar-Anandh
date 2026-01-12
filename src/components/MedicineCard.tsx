import { motion } from "framer-motion";
import { Pill } from "lucide-react";

interface MedicineCardProps {
  name: string;
  dosage: string;
  imageUrl?: string;
  time: string;
}

export function MedicineCard({ name, dosage, imageUrl, time }: MedicineCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="card-warm flex items-center gap-5 p-5"
    >
      {/* Medicine image or icon */}
      <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <Pill className="w-10 h-10 text-primary" />
        )}
      </div>

      {/* Medicine details */}
      <div className="flex-1">
        <p className="text-heading text-foreground mb-1">{name}</p>
        <p className="text-body text-muted-foreground">{dosage}</p>
        <p className="text-label text-primary font-semibold mt-1">⏰ {time}</p>
      </div>
    </motion.div>
  );
}
