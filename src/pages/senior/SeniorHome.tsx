import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { HeroImage } from '@/components/HeroImage';
import { ActionCard } from '@/components/ActionCard';
import { NavTile } from '@/components/NavTile';
import { BottomSheet } from '@/components/BottomSheet';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ExitPinModal } from '@/components/senior/ExitPinModal';
import { usePendingMeds } from '@/hooks/useMedications';
import { useMedicationRealtime } from '@/hooks/useMedicationRealtime';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import heroImage from '@/assets/hero-morning.jpg';

function SeniorHomeContent() {
  const navigate = useNavigate();
  const { seniorSession, user, exitSeniorMode } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSheet, setShowSheet] = useState(false);
  const [showExitPin, setShowExitPin] = useState(false);
  const [exitAction, setExitAction] = useState<'logout' | 'guardian' | null>(null);
  const reduced = useReducedMotion();

  const seniorId = seniorSession?.seniorId || '';
  const { data: pendingData } = usePendingMeds(seniorId);
  const { connectionStatus } = useMedicationRealtime(seniorId);

  useEffect(() => {
    if (!seniorSession) navigate('/senior/auth');
  }, [seniorSession, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!seniorSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading" />
      </div>
    );
  }

  const displayName = seniorSession.preferredName || seniorSession.seniorName;
  const hasPendingMeds = (pendingData?.overdueCount || 0) > 0;
  const dateStr = currentTime.toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const handleLogout = () => { exitSeniorMode(); navigate('/'); };
  const handleGuardianMode = () => { exitSeniorMode(); navigate(user ? '/guardian' : '/'); };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-safe-bottom">
      {/* Connection indicator */}
      <div className="absolute top-2 right-2 z-10">
        <span className={`text-xs px-2 py-0.5 rounded-full ${connectionStatus === 'connected' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`} aria-label={connectionStatus === 'connected' ? 'Live updates active' : 'Offline'}>
          {connectionStatus === 'connected' ? '🟢' : '🔴'}
        </span>
      </div>

      {/* Header */}
      <motion.header
        initial={reduced ? {} : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-8 pb-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl text-foreground mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              Namaste, {displayName}!
            </h1>
            <p className="text-lg text-muted-foreground capitalize" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {dateStr}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSheet(true)}
            className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"
            aria-label="More options"
          >
            <MoreHorizontal className="w-8 h-8 text-primary" />
          </motion.button>
        </div>
      </motion.header>

      {/* Hero Image */}
      <motion.section
        initial={reduced ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-6 mb-6"
      >
        <HeroImage imageUrl={seniorSession.photoUrl || heroImage} alt={`${displayName} ki photo`} />
      </motion.section>

      {/* Action Card */}
      <section className="px-6 mb-6" aria-label="Status">
        {hasPendingMeds ? (
          <ActionCard
            variant="urgent"
            icon="💊"
            title="Dawa ka Samay"
            description={pendingData?.nextMedTime ? `Abhi ${pendingData.nextMedTime} ki dawa lene ka samay hai` : `${pendingData?.overdueCount} dawa baaki hai aaj`}
            actionLabel="Dawa Lein"
            onAction={() => navigate('/senior/dawa')}
            pulse
          />
        ) : (
          <ActionCard
            variant="calm"
            icon="✅"
            title="Sab Theek"
            description="Aaj ki saari dawa ho gayi hai"
            actionLabel="Khushi Mein Kuch Karein?"
            onAction={() => navigate('/senior/santosh')}
          />
        )}
      </section>

      {/* Nav Tiles */}
      <section className="flex-1 px-6 pb-8" aria-label="Main navigation">
        <div className="grid grid-cols-2 gap-4">
          <NavTile
            icon="💊"
            label="DAWA"
            sublabel="Medicine"
            onClick={() => navigate('/senior/dawa')}
            delay={1}
            size={hasPendingMeds ? 'full' : 'normal'}
            variant={hasPendingMeds ? 'urgent' : 'default'}
            pulse={hasPendingMeds}
          />
          <NavTile icon="😊" label="KHUSHI" sublabel="Joy" onClick={() => navigate('/senior/santosh')} delay={2} />
          <NavTile icon="📞" label="PARIVAAR" sublabel="Family" onClick={() => navigate('/senior/parivaar')} delay={3} />
          <NavTile icon="🆘" label="MADAD" sublabel="Help" onClick={() => navigate('/senior/madad')} delay={4} variant="danger" />
        </div>
      </section>

      <BottomSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        onLogout={handleLogout}
        onGuardianMode={handleGuardianMode}
        showGuardianMode={!!user}
      />
    </div>
  );
}

export default function SeniorHome() {
  return (
    <ErrorBoundary>
      <SeniorHomeContent />
    </ErrorBoundary>
  );
}
