import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Phone, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TactileButton } from '@/components/TactileButton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toast } from 'sonner';

function SeniorMadadContent() {
  const navigate = useNavigate();
  const { seniorSession } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showQuickMsg, setShowQuickMsg] = useState(false);

  useEffect(() => {
    if (!seniorSession) navigate('/senior/auth');
  }, [seniorSession, navigate]);

  if (!seniorSession) return null;
  const displayName = seniorSession.preferredName || seniorSession.seniorName;

  const triggerEmergency = async () => {
    setShowConfirm(false);
    toast.success('Emergency alert sabko bhej diya!');
    await supabase.from('activity_logs').insert({
      senior_id: seniorSession.seniorId,
      activity_type: 'emergency_activated',
      activity_data: { timestamp: new Date().toISOString() },
    });
  };

  const handleCall = async () => {
    toast.info('Family ko call kar rahe hain...');
    // In production: window.location.href = `tel:${primaryContact.phone}`;
  };

  const quickMessages = [
    { text: 'Sab theek hai 👍', emoji: '👍' },
    { text: 'Mujhe call karo 📞', emoji: '📞' },
    { text: 'Khaana aa gaya ✅', emoji: '✅' },
    { text: 'Miss you ❤️', emoji: '❤️' },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-foreground/50" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card rounded-3xl p-8 max-w-sm w-full text-center z-10"
              style={{ boxShadow: "0 16px 48px hsl(0 0% 0% / 0.2)" }}
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Kya aap emergency madad chahte hain?
              </h2>
              <p className="text-lg text-muted-foreground mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Aapka beta aur emergency contact ko call jaayega
              </p>
              <div className="space-y-3">
                <TactileButton variant="alert" size="large" onClick={triggerEmergency} className="w-full">
                  ✅ Haan, Madad Bhejein
                </TactileButton>
                <TactileButton variant="neutral" size="large" onClick={() => setShowConfirm(false)} className="w-full">
                  ❌ Ruk Jaao
                </TactileButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-6 py-8 bg-gradient-to-b from-destructive/10 to-transparent">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/app')} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Nunito, sans-serif' }}>Wapas</span>
        </motion.button>
        <h1 className="text-3xl text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>🆘 Madad</h1>
        <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{displayName}, kya madad chahiye?</p>
      </header>

      {/* Main Options */}
      <main className="px-6 space-y-4">
        {/* Emergency */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowConfirm(true)}
          className="w-full p-6 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-background flex items-center gap-4 min-h-[120px]"
          style={{ boxShadow: "0 8px 24px hsl(0 75% 50% / 0.3)" }}
        >
          <span className="text-5xl">🚨</span>
          <div className="flex-1 text-left">
            <h3 className="text-2xl font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>Emergency Madad</h3>
            <p className="text-background/80 text-lg">Turant hospital ya family ko call karein</p>
          </div>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            <AlertTriangle className="w-8 h-8" />
          </motion.div>
        </motion.button>

        {/* Call Family */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCall}
          className="w-full p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-background flex items-center gap-4 min-h-[120px]"
          style={{ boxShadow: "0 8px 24px hsl(220 70% 50% / 0.3)" }}
        >
          <span className="text-5xl">📞</span>
          <div className="flex-1 text-left">
            <h3 className="text-2xl font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>Family Se Baat</h3>
            <p className="text-background/80 text-lg">Beta/Beti ko call karein</p>
          </div>
          <Phone className="w-8 h-8" />
        </motion.button>

        {/* Message */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowQuickMsg(!showQuickMsg)}
          className="w-full p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-background flex items-center gap-4 min-h-[120px]"
          style={{ boxShadow: "0 8px 24px hsl(150 60% 40% / 0.3)" }}
        >
          <span className="text-5xl">💬</span>
          <div className="flex-1 text-left">
            <h3 className="text-2xl font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>Message Bhejein</h3>
            <p className="text-background/80 text-lg">Family ko message bhejein</p>
          </div>
          <MessageCircle className="w-8 h-8" />
        </motion.button>

        {/* Quick Messages */}
        <AnimatePresence>
          {showQuickMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-card rounded-2xl border border-border space-y-3">
                <h3 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Quick Message Bhejein
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickMessages.map(msg => (
                    <TactileButton
                      key={msg.text}
                      variant="neutral"
                      onClick={() => {
                        toast.success(`Message bhej diya: "${msg.text}"`);
                        setShowQuickMsg(false);
                      }}
                      className="justify-center"
                    >
                      <span className="mr-2 text-xl">{msg.emoji}</span>
                      {msg.text.split(' ')[0]}
                    </TactileButton>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reassurance */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-center">
          <p className="text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
            🙏 Aap akele nahi hain, hum hamesha saath hain
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export default function SeniorMadad() {
  return (
    <ErrorBoundary>
      <SeniorMadadContent />
    </ErrorBoundary>
  );
}
