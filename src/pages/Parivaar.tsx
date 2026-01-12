import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Video, MessageCircle } from "lucide-react";
import { TactileButton } from "@/components/TactileButton";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatar: string;
}

export default function Parivaar() {
  const navigate = useNavigate();

  // Demo family data
  const familyMembers: FamilyMember[] = [
    { id: "1", name: "Shravan", relation: "Beta", avatar: "👨" },
    { id: "2", name: "Meera", relation: "Bahu", avatar: "👩" },
    { id: "3", name: "Rohan", relation: "Pota", avatar: "👦" },
  ];

  const handleCall = (member: FamilyMember) => {
    console.log("Calling:", member.name);
    // In real app: initiate call
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
        <h1 className="text-display text-foreground">📞 Parivaar</h1>
      </motion.header>

      {/* Family Members */}
      <section className="flex-1 px-6 pb-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-body text-muted-foreground text-center mb-6"
        >
          Kisko call karna chahenge?
          <br />
          <span className="text-label">Who would you like to call?</span>
        </motion.p>

        <div className="space-y-4">
          {familyMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="card-warm flex items-center gap-4 p-4"
            >
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
                {member.avatar}
              </div>

              {/* Name & Relation */}
              <div className="flex-1">
                <p className="text-heading text-foreground">{member.name}</p>
                <p className="text-body text-muted-foreground">{member.relation}</p>
              </div>

              {/* Call Button */}
              <button
                onClick={() => handleCall(member)}
                className="w-14 h-14 rounded-full bg-success text-success-foreground flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                aria-label={`Call ${member.name}`}
              >
                <Phone className="w-7 h-7" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 space-y-4"
        >
          <TactileButton
            variant="primary"
            size="large"
            icon={<Video className="w-6 h-6" />}
            className="w-full"
          >
            Video Call Shuru Kare
          </TactileButton>
          <p className="text-center text-label text-muted-foreground">
            Start Video Call
          </p>
        </motion.div>
      </section>
    </div>
  );
}
