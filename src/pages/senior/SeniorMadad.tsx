import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, AlertTriangle, Heart, MessageCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TactileButton } from '@/components/TactileButton';
import { toast } from 'sonner';

interface HelpOption {
  id: string;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  urgent: boolean;
}

export default function SeniorMadad() {
  const navigate = useNavigate();
  const { seniorSession } = useAuth();
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState(5);
  const [emergencyActive, setEmergencyActive] = useState(false);

  useEffect(() => {
    if (!seniorSession) {
      navigate('/senior/auth');
    }
  }, [seniorSession, navigate]);

  // Emergency countdown
  useEffect(() => {
    if (emergencyActive && emergencyCountdown > 0) {
      const timer = setTimeout(() => {
        setEmergencyCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (emergencyActive && emergencyCountdown === 0) {
      // Trigger emergency call
      toast.success('Emergency alert sent to all contacts!');
      setEmergencyActive(false);
      setShowEmergency(false);
      setEmergencyCountdown(5);
    }
  }, [emergencyActive, emergencyCountdown]);

  if (!seniorSession) return null;

  const displayName = seniorSession.preferredName || seniorSession.seniorName;

  const helpOptions: HelpOption[] = [
    {
      id: 'emergency',
      icon: <AlertTriangle className="w-10 h-10" />,
      emoji: '🚨',
      title: 'EMERGENCY',
      subtitle: 'Urgent help needed',
      color: 'bg-destructive',
      urgent: true
    },
    {
      id: 'call-family',
      icon: <Phone className="w-10 h-10" />,
      emoji: '📞',
      title: 'FAMILY KO BULAO',
      subtitle: 'Call guardian',
      color: 'bg-primary',
      urgent: false
    },
    {
      id: 'feeling-unwell',
      icon: <Heart className="w-10 h-10" />,
      emoji: '💊',
      title: 'TABIYAT THEEK NAHI',
      subtitle: 'Not feeling well',
      color: 'bg-amber-500',
      urgent: false
    },
    {
      id: 'need-help',
      icon: <HelpCircle className="w-10 h-10" />,
      emoji: '❓',
      title: 'HELP CHAHIYE',
      subtitle: 'Need assistance',
      color: 'bg-blue-500',
      urgent: false
    }
  ];

  const handleHelpOption = (option: HelpOption) => {
    if (option.id === 'emergency') {
      setShowEmergency(true);
      setEmergencyActive(true);
    } else if (option.id === 'call-family') {
      // In a real app, this would initiate a call
      toast.info('Guardian ko call kar rahe hain...');
    } else if (option.id === 'feeling-unwell') {
      toast.info('Guardian ko message bhej rahe hain...');
    } else if (option.id === 'need-help') {
      toast.info('Help request bhej diya gaya!');
    }
  };

  const cancelEmergency = () => {
    setEmergencyActive(false);
    setShowEmergency(false);
    setEmergencyCountdown(5);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="px-6 py-8 bg-gradient-to-b from-destructive/10 to-transparent">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 text-muted-foreground mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Nunito, sans-serif' }}>Wapas</span>
        </motion.button>
        
        <h1 
          className="text-3xl text-foreground"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          🆘 Madad
        </h1>
        <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {displayName}, kya madad chahiye?
        </p>
      </header>

      {/* Content */}
      <main className="px-6">
        {/* Emergency Alert */}
        {showEmergency && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-destructive/95 z-50 flex flex-col items-center justify-center p-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-8xl mb-8"
            >
              🚨
            </motion.div>
            
            <h2 className="text-4xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              EMERGENCY ALERT
            </h2>
            
            <p className="text-2xl text-white/90 text-center mb-8">
              {emergencyCountdown} seconds mein sab ko call jayegi
            </p>
            
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-8">
              <span className="text-6xl font-bold text-white">{emergencyCountdown}</span>
            </div>
            
            <TactileButton
              variant="neutral"
              size="large"
              onClick={cancelEmergency}
              className="bg-white text-destructive hover:bg-white/90"
            >
              ❌ CANCEL - Galti Ho Gayi
            </TactileButton>
          </motion.div>
        )}

        {/* Help Options */}
        <div className="space-y-4">
          {helpOptions.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleHelpOption(option)}
              className={`w-full p-6 rounded-2xl ${option.color} text-white flex items-center gap-4 shadow-lg`}
            >
              <span className="text-5xl">{option.emoji}</span>
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {option.title}
                </h3>
                <p className="text-white/80">{option.subtitle}</p>
              </div>
              {option.urgent && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <AlertTriangle className="w-8 h-8" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Quick Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-card rounded-2xl border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <MessageCircle className="w-5 h-5 text-primary" />
            Quick Message Bhejein
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { text: 'Sab theek hai 👍', emoji: '👍' },
              { text: 'Mujhe call karo 📞', emoji: '📞' },
              { text: 'Khaana aa gaya ✅', emoji: '✅' },
              { text: 'Miss you ❤️', emoji: '❤️' },
            ].map((msg) => (
              <TactileButton
                key={msg.text}
                variant="neutral"
                onClick={() => toast.success(`Message bhej diya: "${msg.text}"`)}
                className="justify-center"
              >
                <span className="mr-2">{msg.emoji}</span>
                {msg.text.split(' ')[0]}...
              </TactileButton>
            ))}
          </div>
        </motion.div>

        {/* Reassurance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <p className="text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
            🙏 Aap akele nahi hain, hum hamesha saath hain
          </p>
        </motion.div>
      </main>
    </div>
  );
}
