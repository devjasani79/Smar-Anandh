import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, X, Pause } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TactileButton } from '@/components/TactileButton';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface YouTubeVideo {
  id: string;
  title: string;
  emoji: string;
  videoId: string;
  duration?: string;
}

const getTimeSlot = () => {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
};

const morningContent: YouTubeVideo[] = [
  { id: '1', title: 'Gayatri Mantra', emoji: '🕉️', videoId: 'HxTM6YPYj7Q', duration: '60 min' },
  { id: '2', title: 'Hanuman Chalisa', emoji: '🙏', videoId: 'AETFvQonfV8', duration: '9 min' },
  { id: '3', title: 'Peaceful Morning Ragas', emoji: '🌅', videoId: 'Z8V2qnVj0HA', duration: '45 min' },
];

const eveningContent: YouTubeVideo[] = [
  { id: '1', title: 'Ramayan - Full Episode', emoji: '📺', videoId: 'qb1LtFczYs4', duration: 'Serial' },
  { id: '2', title: 'Shri Krishna Serial', emoji: '🦚', videoId: 'u8bPZgGP5rk', duration: 'Serial' },
  { id: '3', title: 'Old Hindi Classics', emoji: '🎤', videoId: 'xrYx5Tl7yiM', duration: '60 min' },
];

const afternoonContent: YouTubeVideo[] = [
  { id: '1', title: 'Nature Relaxation', emoji: '🌿', videoId: 'lM02vNMRRB0', duration: 'Relaxing' },
  { id: '2', title: 'Om Jai Jagdish Hare', emoji: '🪔', videoId: 'DfxNlI5x5FQ', duration: '6 min' },
  { id: '3', title: 'Shri Krishna Bhajan', emoji: '🦚', videoId: 'kfJIFoYkj8o', duration: '30 min' },
];

const nightContent: YouTubeVideo[] = [
  { id: '1', title: 'Peaceful Sleep Music', emoji: '🌙', videoId: 'Z8V2qnVj0HA', duration: '45 min' },
  { id: '2', title: 'Om Chanting', emoji: '🕉️', videoId: 'HxTM6YPYj7Q', duration: '60 min' },
];

const contentMap: Record<string, { title: string; subtitle: string; icon: string; videos: YouTubeVideo[] }> = {
  morning: { title: 'Subah ki Prarthana', subtitle: 'Bhajans aur yoga ke liye', icon: '🌅', videos: morningContent },
  afternoon: { title: 'Dopahar ka Aaram', subtitle: 'Relaxing content', icon: '☀️', videos: afternoonContent },
  evening: { title: 'Shaam ka Maza', subtitle: 'Serials aur gaane', icon: '🌇', videos: eveningContent },
  night: { title: 'Raat ki Shanti', subtitle: 'Neend ke liye', icon: '🌙', videos: nightContent },
};

interface FamilyPhoto {
  id: string;
  name: string;
  relationship: string;
  photo_url: string;
}

function SeniorSantoshContent() {
  const navigate = useNavigate();
  const { seniorSession } = useAuth();
  const [playingVideo, setPlayingVideo] = useState<YouTubeVideo | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [familyPhotos, setFamilyPhotos] = useState<FamilyPhoto[]>([]);

  useEffect(() => {
    if (!seniorSession) { navigate('/senior/auth'); return; }
    // Fetch family photos
    supabase
      .from('family_members')
      .select('id, name, relationship, photo_url')
      .eq('senior_id', seniorSession.seniorId)
      .not('photo_url', 'is', null)
      .then(({ data }) => {
        if (data) setFamilyPhotos(data.filter(m => m.photo_url) as FamilyPhoto[]);
      });
  }, [seniorSession]);

  if (!seniorSession) return null;

  const displayName = seniorSession.preferredName || seniorSession.seniorName;
  const slot = getTimeSlot();
  const content = contentMap[slot];

  const handleMoodSelect = (selectedMood: string) => {
    setMood(selectedMood);
    if (seniorSession) {
      supabase.from('activity_logs').insert({
        senior_id: seniorSession.seniorId,
        activity_type: 'mood_check',
        activity_data: { mood: selectedMood },
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Video Player */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/95 flex flex-col"
          >
            <div className="absolute top-4 right-4 z-10">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPlayingVideo(null)} className="w-14 h-14 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center">
                <X className="w-8 h-8 text-background" />
              </motion.button>
            </div>
            <div className="p-6 text-center">
              <p className="text-xl text-background" style={{ fontFamily: 'Nunito, sans-serif' }}>{playingVideo.emoji} {playingVideo.title}</p>
            </div>
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <iframe src={`https://www.youtube.com/embed/${playingVideo.videoId}?autoplay=1&rel=0`} title={playingVideo.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            </div>
            <div className="p-6">
              <TactileButton variant="neutral" size="large" onClick={() => setPlayingVideo(null)} className="w-full">
                <Pause className="w-6 h-6 mr-2" /> Band Karein
              </TactileButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-6 py-8 bg-gradient-to-b from-success/10 to-transparent">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/app')} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Nunito, sans-serif' }}>Wapas</span>
        </motion.button>
        <h1 className="text-3xl text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>😊 Khushi Ka Samay</h1>
        <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{displayName}, aaj kya karna hai?</p>
      </header>

      <main className="px-6 space-y-8">
        {/* Time-based content */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{content.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>{content.title}</h2>
              <p className="text-muted-foreground">{content.subtitle}</p>
            </div>
          </div>
          <div className="space-y-3">
            {content.videos.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPlayingVideo(item)}
                className="w-full p-5 bg-card rounded-2xl border border-border flex items-center gap-4 text-left"
                style={{ boxShadow: "0 2px 12px -4px hsl(30 50% 20% / 0.1)" }}
              >
                <span className="text-4xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-foreground">{item.title}</p>
                  <p className="text-muted-foreground">{item.duration}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary-foreground" />
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Family Photo Carousel */}
        {familyPhotos.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              📸 Parivaar ki Yaadein
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory">
              {familyPhotos.map(photo => (
                <div key={photo.id} className="snap-center shrink-0">
                  <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-border">
                    <img src={photo.photo_url} alt={photo.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-2">{photo.name} - {photo.relationship}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mood check */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-card rounded-2xl border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Aaj kaisa lag raha hai?
          </h3>
          <div className="flex justify-around">
            {[
              { emoji: '😊', label: 'Khush' },
              { emoji: '😐', label: 'Theek' },
              { emoji: '😔', label: 'Udaas' },
            ].map(item => (
              <motion.button
                key={item.emoji}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleMoodSelect(item.emoji)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${mood === item.emoji ? 'bg-primary/20' : ''}`}
              >
                <span className="text-5xl">{item.emoji}</span>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </motion.button>
            ))}
          </div>
          {mood && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-primary mt-4 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
              ✓ Aapka mood record ho gaya!
            </motion.p>
          )}
        </motion.section>
      </main>
    </div>
  );
}

export default function SeniorSantosh() {
  return (
    <ErrorBoundary>
      <SeniorSantoshContent />
    </ErrorBoundary>
  );
}
