import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { usePinAuth } from '@/contexts/PinAuthContext';
import { SettingsGatekeeper } from '@/components/SettingsGatekeeper';
import { HeroImage } from '@/components/HeroImage';
import { StatusPulse } from '@/components/StatusPulse';
import { NavTile } from '@/components/NavTile';
import heroImage from '@/assets/hero-morning.jpg';

export default function SeniorApp() {
  const navigate = useNavigate();
  const { session, isLoading } = usePinAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettingsGate, setShowSettingsGate] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = session.preferredName || session.seniorName;

  // Format time in Hinglish
  const getTimeOfDay = () => {
    const hours = currentTime.getHours();
    if (hours < 12) return 'Subah';
    if (hours < 17) return 'Dopahar';
    if (hours < 20) return 'Shaam';
    return 'Raat';
  };

  const formatDate = () => {
    const days = ['Ravivaar', 'Somvaar', 'Mangalvaar', 'Budhvaar', 'Guruvaar', 'Shukravaar', 'Shanivaar'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `Aaj ${days[currentTime.getDay()]}, ${currentTime.getDate()} ${months[currentTime.getMonth()]} hai`;
  };

  // Demo: Check if there's a pending action
  const hasPendingAction = false;
  const statusMessage = hasPendingAction 
    ? 'Dawa ka samay ho gaya' 
    : 'Sab Kuch Theek Hai';

  const handleSettingsSuccess = () => {
    setShowSettingsGate(false);
    navigate('/guardian');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-safe-bottom">
      {/* Header with greeting */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-8 pb-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 
              className="text-3xl text-foreground mb-1"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {getTimeOfDay()} ki Namaste, {displayName}!
            </h1>
            <p 
              className="text-muted-foreground text-lg"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {formatDate()}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettingsGate(true)}
            className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"
          >
            <Settings className="w-6 h-6 text-muted-foreground" />
          </motion.button>
        </div>
      </motion.header>

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
          status={hasPendingAction ? 'action' : 'ok'}
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
            onClick={() => navigate('/dawa')}
            delay={1}
          />
          <NavTile
            icon="😊"
            label="KHUSHI"
            sublabel="Joy"
            onClick={() => navigate('/santosh')}
            delay={2}
          />
          <NavTile
            icon="🆘"
            label="MADAD"
            sublabel="Help"
            onClick={() => navigate('/madad')}
            delay={3}
          />
          <NavTile
            icon="📞"
            label="PARIVAAR"
            sublabel="Family"
            onClick={() => navigate('/parivaar')}
            delay={4}
          />
        </div>
      </section>

      {/* Settings Gatekeeper Modal */}
      <SettingsGatekeeper
        isOpen={showSettingsGate}
        onClose={() => setShowSettingsGate(false)}
        onSuccess={handleSettingsSuccess}
      />
    </div>
  );
}
