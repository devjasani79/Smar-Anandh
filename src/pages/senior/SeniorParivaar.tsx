import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Video, MessageCircle, Heart, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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

export default function SeniorParivaar() {
  const navigate = useNavigate();
  const { seniorSession } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seniorSession) {
      navigate('/senior/auth');
      return;
    }
    fetchFamilyMembers();
  }, [seniorSession, navigate]);

  const fetchFamilyMembers = async () => {
    if (!seniorSession) return;
    
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('senior_id', seniorSession.seniorId)
      .order('display_order');

    if (!error && data) {
      setFamilyMembers(data);
    }
    setLoading(false);
  };

  if (!seniorSession) return null;

  const displayName = seniorSession.preferredName || seniorSession.seniorName;

  const handleCall = (member: FamilyMember) => {
    // In a real app, this would initiate a phone call
    toast.info(`${member.name} ko call kar rahe hain...`);
    // window.location.href = `tel:${member.phone}`;
  };

  const handleVideoCall = (member: FamilyMember) => {
    toast.info(`${member.name} se video call connect kar rahe hain...`);
  };

  const handleMessage = (member: FamilyMember) => {
    toast.success(`${member.name} ko "I miss you" message bhej diya!`);
  };

  // If no family members, show guardian contact
  const contactList = familyMembers.length > 0 ? familyMembers : [
    {
      id: 'guardian',
      name: 'Guardian',
      phone: '',
      relationship: 'Guardian',
      photo_url: null,
      is_emergency_contact: true
    }
  ];

  const getRelationshipEmoji = (relationship: string) => {
    const emojiMap: Record<string, string> = {
      'son': '👨',
      'daughter': '👩',
      'grandson': '👦',
      'granddaughter': '👧',
      'spouse': '💑',
      'brother': '👨',
      'sister': '👩',
      'friend': '🤝',
      'guardian': '🛡️',
      'default': '👤'
    };
    return emojiMap[relationship.toLowerCase()] || emojiMap.default;
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="px-6 py-8 bg-gradient-to-b from-primary/10 to-transparent">
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
          👨‍👩‍👧‍👦 Apna Parivaar
        </h1>
        <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {displayName}, kisko contact karna hai?
        </p>
      </header>

      {/* Content */}
      <main className="px-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {contactList.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-5 shadow-lg border border-border"
              >
                <div className="flex items-center gap-4 mb-4">
                  {/* Photo or Avatar */}
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {member.photo_url ? (
                      <img 
                        src={member.photo_url} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">{getRelationshipEmoji(member.relationship)}</span>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {member.name}
                    </h3>
                    <p className="text-muted-foreground capitalize">
                      {member.relationship}
                    </p>
                    {member.is_emergency_contact && (
                      <span className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full mt-1">
                        <Heart className="w-3 h-3" />
                        Emergency Contact
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <TactileButton
                    variant="primary"
                    onClick={() => handleCall(member)}
                    className="flex-col gap-1 py-4"
                  >
                    <Phone className="w-6 h-6" />
                    <span className="text-sm">Call</span>
                  </TactileButton>
                  
                  <TactileButton
                    variant="success"
                    onClick={() => handleVideoCall(member)}
                    className="flex-col gap-1 py-4"
                  >
                    <Video className="w-6 h-6" />
                    <span className="text-sm">Video</span>
                  </TactileButton>
                  
                  <TactileButton
                    variant="neutral"
                    onClick={() => handleMessage(member)}
                    className="flex-col gap-1 py-4"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm">Message</span>
                  </TactileButton>
                </div>
              </motion.div>
            ))}

            {/* No contacts message */}
            {familyMembers.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
                <p className="text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Guardian ko batayein family members add karne ke liye
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Quick Love Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-gradient-to-br from-destructive/5 to-destructive/10 rounded-2xl border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            ❤️ Pyaar Bhejein
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { text: 'I Love You ❤️', emoji: '❤️' },
              { text: 'Miss You 🤗', emoji: '🤗' },
              { text: 'Good Morning ☀️', emoji: '☀️' },
              { text: 'Good Night 🌙', emoji: '🌙' },
            ].map((msg) => (
              <TactileButton
                key={msg.text}
                variant="neutral"
                onClick={() => toast.success(`Sabko "${msg.text}" bhej diya!`)}
                className="justify-center bg-white dark:bg-card"
              >
                <span className="text-2xl mr-2">{msg.emoji}</span>
              </TactileButton>
            ))}
          </div>
        </motion.div>

        {/* Family status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <p className="text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
            🏠 Parivaar hamesha aapke saath hai
          </p>
        </motion.div>
      </main>
    </div>
  );
}
