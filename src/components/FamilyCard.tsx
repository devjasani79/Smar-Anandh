import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Video, MessageCircle, Heart } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  photo_url: string | null;
  is_emergency_contact: boolean;
}

interface FamilyCardProps {
  member: FamilyMember;
  onCall: () => void;
  onVideoCall: () => void;
  onMessage: () => void;
}

const getRelationshipEmoji = (relationship: string) => {
  const map: Record<string, string> = {
    son: '👨', daughter: '👩', grandson: '👦', granddaughter: '👧',
    spouse: '💑', brother: '👨', sister: '👩', friend: '🤝',
    guardian: '🛡️', doctor: '🩺',
  };
  return map[relationship.toLowerCase()] || '👤';
};

export function FamilyCard({ member, onCall, onVideoCall, onMessage }: FamilyCardProps) {
  const [imageError, setImageError] = useState(false);
  const reduced = useReducedMotion();

  const handleCall = () => {
    // Use native tel: protocol for real calls
    window.location.href = `tel:${member.phone}`;
    onCall();
  };

  const handleMessage = () => {
    // Try WhatsApp first, fallback to SMS
    const cleanPhone = member.phone.replace(/[^0-9+]/g, '');
    const waUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Namaste ${member.name}! 🙏`)}`;
    window.open(waUrl, '_blank');
    onMessage();
  };

  const handleVideoCall = () => {
    // Open WhatsApp video call as fallback
    const cleanPhone = member.phone.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanPhone}`;
    onVideoCall();
  };

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 border border-border"
      style={{ boxShadow: "0 4px 20px -4px hsl(30 50% 20% / 0.12)" }}
      role="article"
      aria-label={`${member.name}, ${member.relationship}`}
    >
      <div className="flex items-center gap-4 mb-4">
        {/* Photo */}
        <div className="w-24 h-24 rounded-full border-4 border-primary/30 overflow-hidden bg-muted flex items-center justify-center shrink-0">
          {member.photo_url && !imageError ? (
            <img
              src={member.photo_url}
              alt={`${member.name} ki photo`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-4xl" aria-hidden="true">{getRelationshipEmoji(member.relationship)}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-foreground truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {member.name}
          </h3>
          <p className="text-lg text-muted-foreground capitalize">{member.relationship}</p>
          {member.is_emergency_contact && (
            <span className="inline-flex items-center gap-1 text-sm bg-destructive/10 text-destructive px-2 py-0.5 rounded-full mt-1">
              <Heart className="w-3 h-3" aria-hidden="true" /> Emergency
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2" role="group" aria-label={`${member.name} ke liye actions`}>
        <ActionBtn
          icon={<Phone className="w-6 h-6" />}
          label="Call"
          onClick={handleCall}
          className="bg-primary text-primary-foreground"
          ariaLabel={`${member.name} ko call karein`}
        />
        <ActionBtn
          icon={<Video className="w-6 h-6" />}
          label="Video"
          onClick={handleVideoCall}
          className="bg-success text-success-foreground"
          ariaLabel={`${member.name} se video call`}
        />
        <ActionBtn
          icon={<MessageCircle className="w-6 h-6" />}
          label="Message"
          onClick={handleMessage}
          className="bg-muted text-muted-foreground"
          ariaLabel={`${member.name} ko message bhejein`}
        />
      </div>
    </motion.div>
  );
}

function ActionBtn({ icon, label, onClick, className, ariaLabel }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className: string;
  ariaLabel: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl min-h-[64px] font-semibold transition-colors ${className}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </motion.button>
  );
}
