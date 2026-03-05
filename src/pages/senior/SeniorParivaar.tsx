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

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="px-6 py-8 bg-gradient-to-b from-primary/10 to-transparent">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/app')} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Nunito, sans-serif' }}>Wapas</span>
        </motion.button>
        <h1 className="text-3xl text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>👨‍👩‍👧‍👦 Apna Parivaar</h1>
        <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{displayName}, kisko contact karna hai?</p>
      </header>

      <main className="px-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-40 w-full" />
              </div>
            ))}
          </div>
        ) : familyMembers.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">👨‍👩‍👧‍👦</span>
            <p className="text-xl text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Abhi koi contact nahi hai</p>
            <p className="text-muted-foreground mt-2">Guardian ko batayein family members add karne ke liye</p>
          </div>
        ) : (
          <div className="space-y-4">
            {familyMembers.map(member => (
              <FamilyCard
                key={member.id}
                member={member}
                onCall={() => {
                  toast.info(`${member.name} ko call kar rahe hain...`);
                  // window.location.href = `tel:${member.phone}`;
                }}
                onVideoCall={() => toast.info(`${member.name} se video call connect kar rahe hain...`)}
                onMessage={() => toast.success(`${member.name} ko "Miss you" bhej diya!`)}
              />
            ))}
          </div>
        )}

        {/* Quick Love Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
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
                onClick={() => toast.success(`Sabko "${msg.text} ${msg.emoji}" bhej diya!`)}
                className="justify-center"
              >
                <span className="text-2xl mr-2">{msg.emoji}</span>
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
