import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GreetingHeader } from "@/components/GreetingHeader";
import { HeroImage } from "@/components/HeroImage";
import { StatusPulse } from "@/components/StatusPulse";
import { NavTile } from "@/components/NavTile";
import heroImage from "@/assets/hero-morning.jpg";

export default function Darshani() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Format date in Hindi style
  const formatDate = (date: Date) => {
    const days = ["Ravivaar", "Somvaar", "Mangalvaar", "Budhvaar", "Guruvaar", "Shukravaar", "Shanivaar"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `Aaj ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} hai`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours < 12 ? "Subah" : hours < 17 ? "Dopahar" : hours < 20 ? "Shaam" : "Raat";
    const displayHour = hours % 12 || 12;
    return `${period} ${displayHour}:${minutes}`;
  };

  // Demo: Check if there's a pending action (e.g., medicine reminder)
  const hasPendingAction = false;
  const statusMessage = hasPendingAction 
    ? "Dawa ka samay ho gaya" 
    : "Sab Kuch Theek Hai";

  return (
    <div className="min-h-screen bg-background flex flex-col pb-safe-bottom">
      {/* Header with greeting */}
      <GreetingHeader
        name="Dadi"
        dateString={formatDate(currentTime)}
        timeString={formatTime(currentTime)}
        onSettingsClick={() => navigate("/settings")}
      />

      {/* Hero Image Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-6 mb-6"
      >
        <HeroImage
          imageUrl={heroImage}
          alt="Peaceful morning scene"
        />
      </motion.section>

      {/* Status Pulse */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-6 mb-8"
      >
        <StatusPulse
          status={hasPendingAction ? "action" : "ok"}
          message={statusMessage}
        />
      </motion.section>

      {/* Navigation Tiles */}
      <section className="flex-1 px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          <NavTile
            icon="💊"
            label="DAWA"
            sublabel="Medicine"
            onClick={() => navigate("/dawa")}
            delay={1}
          />
          <NavTile
            icon="😊"
            label="KHUSHI"
            sublabel="Joy"
            onClick={() => navigate("/santosh")}
            delay={2}
          />
          <NavTile
            icon="🆘"
            label="MADAD"
            sublabel="Help"
            onClick={() => navigate("/madad")}
            delay={3}
          />
          <NavTile
            icon="📞"
            label="PARIVAAR"
            sublabel="Family"
            onClick={() => navigate("/parivaar")}
            delay={4}
          />
        </div>
      </section>
    </div>
  );
}
