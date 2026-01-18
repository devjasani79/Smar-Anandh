import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { HeroImage } from '@/components/HeroImage';
import { StatusPulse } from '@/components/StatusPulse';
import { NavTile } from '@/components/NavTile';
import { SettingsGatekeeper } from '@/components/SettingsGatekeeper';
import heroImage from '@/assets/hero-morning.jpg';

export default function SeniorHome() {
  const navigate = useNavigate();
  const { seniorSession, sessionMode, exitSeniorMode, user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettingsGate, setShowSettingsGate] = useState(false);

  // Redirect if not in senior mode
  useEffect(() => {
    if (!seniorSession) {
      navigate('/senior/auth');
    }
  }, [seniorSession, navigate]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!seniorSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = seniorSession.preferredName || seniorSession.seniorName;

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

  const handleExitSeniorMode = () => {
    exitSeniorMode();
    // If guardian is logged in, go to guardian dashboard
    if (user) {
      navigate('/guardian');
    } else {
      navigate('/');
    }
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
          <div className="flex gap-2">
            {/* Exit senior mode (only if guardian is logged in) */}
            {user && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleExitSeniorMode}
                className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"
                title="Exit to Guardian Dashboard"
              >
                <LogOut className="w-6 h-6 text-muted-foreground" />
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettingsGate(true)}
              className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"
            >
              <Settings className="w-6 h-6 text-muted-foreground" />
            </motion.button>
          </div>
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
          imageUrl={seniorSession.photoUrl || heroImage}
          alt="Senior photo"
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
            onClick={() => navigate('/senior/dawa')}
            delay={1}
          />
          <NavTile
            icon="😊"
            label="KHUSHI"
            sublabel="Joy"
            onClick={() => navigate('/senior/santosh')}
            delay={2}
          />
          <NavTile
            icon="🆘"
            label="MADAD"
            sublabel="Help"
            onClick={() => navigate('/senior/madad')}
            delay={3}
          />
          <NavTile
            icon="📞"
            label="PARIVAAR"
            sublabel="Family"
            onClick={() => navigate('/senior/parivaar')}
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
