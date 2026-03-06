import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FamilyCard } from '@/components/FamilyCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { TactileButton } from '@/components/TactileButton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { toast } from 'sonner';

interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  photo_url: string | null;
  is_emergency_contact: boolean;
}

function SeniorParivaarContent() {
  const navigate = useNavigate();
  const { seniorSession } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!seniorSession) { navigate('/senior/auth'); return; }
    supabase
      .from('family_members')
      .select('*')
      .eq('senior_id', seniorSession.seniorId)
      .order('display_order')
      .then(({ data }) => {
        if (data) setFamilyMembers(data);
        setLoading(false);
      });
  }, [seniorSession]);

  if (!seniorSession) return null;
  const displayName = seniorSession.preferredName || seniorSession.seniorName;

  const logInteraction = (memberId: string, type: string) => {
    supabase.from('activity_logs').insert({
      senior_id: seniorSession.seniorId,
      activity_type: `family_${type}`,
      activity_data: { family_member_id: memberId, interaction_type: type },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="px-6 py-8 bg-gradient-to-b from-primary/10 to-transparent">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/app')} className="flex items-center gap-2 text-muted-foreground mb-4" aria-label="Wapas jaayein">
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Nunito, sans-serif' }}>Wapas</span>
        </motion.button>
        <h1 className="text-3xl text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>👨‍👩‍👧‍👦 Apna Parivaar</h1>
        <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{displayName}, kisko contact karna hai?</p>
      </header>

      <main className="px-6" role="main">
        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading contacts">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-40 w-full" />
              </div>
            ))}
          </div>
        ) : familyMembers.length === 0 ? (
          <div className="text-center py-12" role="status">
            <span className="text-6xl block mb-4" aria-hidden="true">👨‍👩‍👧‍👦</span>
            <p className="text-xl text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Abhi koi contact nahi hai</p>
            <p className="text-muted-foreground mt-2">Guardian ko batayein family members add karne ke liye</p>
          </div>
        ) : (
          <div className="space-y-4" role="list" aria-label="Family members">
            {familyMembers.map(member => (
              <FamilyCard
                key={member.id}
                member={member}
                onCall={() => {
                  toast.info(`${member.name} ko call kar rahe hain...`);
                  logInteraction(member.id, 'call');
                }}
                onVideoCall={() => {
                  toast.info(`${member.name} se video call...`);
                  logInteraction(member.id, 'video_call');
                }}
                onMessage={() => {
                  toast.success(`${member.name} ko message bheja!`);
                  logInteraction(member.id, 'message');
                }}
              />
            ))}
          </div>
        )}

        {/* Quick Love Messages */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-gradient-to-br from-destructive/5 to-destructive/10 rounded-2xl border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            ❤️ Pyaar Bhejein
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { text: 'I Love You', emoji: '❤️' },
              { text: 'Miss You', emoji: '🤗' },
              { text: 'Good Morning', emoji: '☀️' },
              { text: 'Good Night', emoji: '🌙' },
            ].map(msg => (
              <TactileButton
                key={msg.text}
                variant="neutral"
                onClick={() => {
                  // Send to all family via WhatsApp
                  if (familyMembers.length > 0) {
                    const cleanPhone = familyMembers[0].phone.replace(/[^0-9+]/g, '').replace('+', '');
                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`${msg.text} ${msg.emoji}`)}`, '_blank');
                  }
                  toast.success(`Sabko "${msg.text} ${msg.emoji}" bhej diya!`);
                }}
                className="justify-center"
              >
                <span className="text-2xl mr-2" aria-hidden="true">{msg.emoji}</span>
                <span className="text-sm">{msg.text}</span>
              </TactileButton>
            ))}
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-muted-foreground mt-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
          🏠 Parivaar hamesha aapke saath hai
        </motion.p>
      </main>
    </div>
  );
}

export default function SeniorParivaar() {
  return (
    <ErrorBoundary>
      <SeniorParivaarContent />
    </ErrorBoundary>
  );
}
