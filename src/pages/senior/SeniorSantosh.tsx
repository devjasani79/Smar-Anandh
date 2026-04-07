import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, X, Pause, Dice5, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TactileButton } from '@/components/TactileButton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getTimeBasedActivities, getShuffledActivities, type SeniorActivity } from '@/constants/seniorActivities';

interface YouTubeVideo {
  id: string;
  title: string;
  emoji: string;
  videoId: string;
  duration?: string;
}

interface JoyPreferences {
  suno_config: { enabled: boolean; type: string; playlist_url?: string };
  dekho_config: { enabled: boolean; channel_url?: string };
  yaadein_config: { enabled: boolean; album_url?: string };
  khel_config: { enabled: boolean };
  ai_suggestions_enabled: boolean;
}

interface FamilyPhoto {
  id: string;
  name: string;
  relationship: string;
  photo_url: string;
}

interface ActivityCompletion {
  activity_id: string;
  completion_date: string;
}

const getTimeSlot = () => {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
};

// Default hardcoded content as fallback
const defaultContent: Record<string, { title: string; subtitle: string; icon: string; videos: YouTubeVideo[] }> = {
  morning: {
    title: 'Subah ki Prarthana', subtitle: 'Bhajans aur yoga ke liye', icon: '🌅',
    videos: [
      { id: '1', title: 'Gayatri Mantra', emoji: '🕉️', videoId: 'HxTM6YPYj7Q', duration: '60 min' },
      { id: '2', title: 'Hanuman Chalisa', emoji: '🙏', videoId: 'AETFvQonfV8', duration: '9 min' },
      { id: '3', title: 'Peaceful Morning Ragas', emoji: '🌅', videoId: 'Z8V2qnVj0HA', duration: '45 min' },
    ],
  },
  afternoon: {
    title: 'Dopahar ka Aaram', subtitle: 'Relaxing content', icon: '☀️',
    videos: [
      { id: '1', title: 'Nature Relaxation', emoji: '🌿', videoId: 'lM02vNMRRB0', duration: 'Relaxing' },
      { id: '2', title: 'Om Jai Jagdish Hare', emoji: '🪔', videoId: 'DfxNlI5x5FQ', duration: '6 min' },
      { id: '3', title: 'Shri Krishna Bhajan', emoji: '🦚', videoId: 'kfJIFoYkj8o', duration: '30 min' },
    ],
  },
  evening: {
    title: 'Shaam ka Maza', subtitle: 'Serials aur gaane', icon: '🌇',
    videos: [
      { id: '1', title: 'Ramayan - Full Episode', emoji: '📺', videoId: 'qb1LtFczYs4', duration: 'Serial' },
      { id: '2', title: 'Shri Krishna Serial', emoji: '🦚', videoId: 'u8bPZgGP5rk', duration: 'Serial' },
      { id: '3', title: 'Old Hindi Classics', emoji: '🎤', videoId: 'xrYx5Tl7yiM', duration: '60 min' },
    ],
  },
  night: {
    title: 'Raat ki Shanti', subtitle: 'Neend ke liye', icon: '🌙',
    videos: [
      { id: '1', title: 'Peaceful Sleep Music', emoji: '🌙', videoId: 'Z8V2qnVj0HA', duration: '45 min' },
      { id: '2', title: 'Om Chanting', emoji: '🕉️', videoId: 'HxTM6YPYj7Q', duration: '60 min' },
    ],
  },
};

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|playlist\?list=))([a-zA-Z0-9_-]+)/);
  return match?.[1] || null;
}

function SeniorSantoshContent() {
  const navigate = useNavigate();
  const { seniorSession } = useAuth();
  const [playingVideo, setPlayingVideo] = useState<YouTubeVideo | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [familyPhotos, setFamilyPhotos] = useState<FamilyPhoto[]>([]);
  const [joyPrefs, setJoyPrefs] = useState<JoyPreferences | null>(null);
  const [activities, setActivities] = useState<SeniorActivity[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<SeniorActivity | null>(null);
  const [shuffleCount, setShuffleCount] = useState(0);
  const reduced = useReducedMotion();

  const seniorId = seniorSession?.seniorId || '';
  const today = new Date().toISOString().split('T')[0];

  // Load joy preferences from guardian settings
  useEffect(() => {
    if (!seniorId) return;
    
    // Fetch joy preferences
    supabase
      .from('joy_preferences')
      .select('*')
      .eq('senior_id', seniorId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setJoyPrefs({
            suno_config: data.suno_config as JoyPreferences['suno_config'] || { enabled: true, type: 'bhajans' },
            dekho_config: data.dekho_config as JoyPreferences['dekho_config'] || { enabled: true },
            yaadein_config: data.yaadein_config as JoyPreferences['yaadein_config'] || { enabled: true },
            khel_config: data.khel_config as JoyPreferences['khel_config'] || { enabled: true },
            ai_suggestions_enabled: data.ai_suggestions_enabled ?? true,
          });
        }
      });

    // Fetch family photos
    supabase
      .from('family_members')
      .select('id, name, relationship, photo_url')
      .eq('senior_id', seniorId)
      .not('photo_url', 'is', null)
      .then(({ data }) => {
        if (data) setFamilyPhotos(data.filter(m => m.photo_url) as FamilyPhoto[]);
      });

    // Fetch today's completions
    fetchCompletions();

    // Set initial activities
    setActivities(getTimeBasedActivities().slice(0, 4));
  }, [seniorId]);

  const fetchCompletions = async () => {
    const { data } = await supabase
      .from('activity_completions' as any)
      .select('activity_id, completion_date')
      .eq('senior_id', seniorId)
      .eq('completion_date', today);

    if (data) {
      setCompletedToday(new Set((data as any[]).map((d: any) => d.activity_id)));
    }
  };

  const completedCount = completedToday.size;
  const canShuffle = completedCount >= 2;

  const handleShuffle = () => {
    if (!canShuffle) return;
    const currentIds = activities.map(a => a.id);
    const newActivities = getShuffledActivities(currentIds);
    setActivities(newActivities.slice(0, 4));
    setShuffleCount(prev => prev + 1);
  };

  const handleStartActivity = (activity: SeniorActivity) => {
    setSelectedActivity(activity);
    setShowActivityDetail(true);
    if (seniorId) {
      supabase.from('activity_logs').insert({
        senior_id: seniorId,
        activity_type: 'activity_started',
        activity_data: { activity_id: activity.id, activity_name: activity.name },
      });
    }
  };

  const handleCompleteActivity = async (activity: SeniorActivity) => {
    if (!seniorId || completedToday.has(activity.id)) return;

    const { error } = await supabase
      .from('activity_completions' as any)
      .insert({
        senior_id: seniorId,
        activity_id: activity.id,
        activity_name: activity.name,
        activity_icon: activity.icon,
        completion_date: today,
      } as any);

    if (!error) {
      setCompletedToday(prev => new Set([...prev, activity.id]));
      setShowActivityDetail(false);
    }
  };

  const handleMoodSelect = (selectedMood: string) => {
    setMood(selectedMood);
    if (seniorId) {
      supabase.from('activity_logs').insert({
        senior_id: seniorId,
        activity_type: 'mood_check',
        activity_data: { mood: selectedMood },
      });
    }
  };

  if (!seniorSession) { navigate('/senior/auth'); return null; }

  const displayName = seniorSession.preferredName || seniorSession.seniorName;
  const slot = getTimeSlot();

  // Build content from joy preferences or use defaults
  let videoContent = defaultContent[slot];

  // If guardian added a playlist URL, add it as a featured video
  if (joyPrefs?.suno_config?.enabled && joyPrefs.suno_config.playlist_url) {
    const ytId = extractYouTubeId(joyPrefs.suno_config.playlist_url);
    if (ytId) {
      videoContent = {
        ...videoContent,
        videos: [
          { id: 'custom-playlist', title: '🎵 Guardian\'s Playlist', emoji: '⭐', videoId: ytId, duration: 'Playlist' },
          ...videoContent.videos,
        ],
      };
    }
  }

  // If guardian added a YouTube channel URL for Dekho
  if (joyPrefs?.dekho_config?.enabled && joyPrefs.dekho_config.channel_url) {
    const ytId = extractYouTubeId(joyPrefs.dekho_config.channel_url);
    if (ytId) {
      videoContent = {
        ...videoContent,
        videos: [
          { id: 'custom-channel', title: '📺 Guardian\'s Channel', emoji: '⭐', videoId: ytId, duration: 'Video' },
          ...videoContent.videos,
        ],
      };
    }
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Video Player */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/95 flex flex-col"
            role="dialog" aria-label={`Playing ${playingVideo.title}`}
          >
            <div className="absolute top-4 right-4 z-10">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPlayingVideo(null)} className="w-14 h-14 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center" aria-label="Video band karein">
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

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {showActivityDetail && selectedActivity && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-foreground/50" onClick={() => setShowActivityDetail(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card rounded-3xl p-8 max-w-sm w-full text-center z-10"
              style={{ boxShadow: "0 16px 48px hsl(0 0% 0% / 0.2)" }}
              role="dialog" aria-label={selectedActivity.name}
            >
              <span className="text-6xl block mb-4" aria-hidden="true">{selectedActivity.icon}</span>
              <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {selectedActivity.name}
              </h2>
              <p className="text-lg text-muted-foreground mb-4">{selectedActivity.description}</p>
              <p className="text-sm text-primary mb-4">⏱️ {selectedActivity.duration} minute</p>

              {selectedActivity.instructions && (
                <div className="text-left mb-6 space-y-2">
                  {selectedActivity.instructions.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-2">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      <p className="text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {completedToday.has(selectedActivity.id) ? (
                  <div className="flex items-center justify-center gap-2 text-success py-3">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-semibold text-lg">Ho Gaya! ✅</span>
                  </div>
                ) : (
                  <TactileButton variant="success" size="large" onClick={() => handleCompleteActivity(selectedActivity)} className="w-full">
                    ✅ Ho Gaya! Mark Done
                  </TactileButton>
                )}
                <TactileButton variant="neutral" size="default" onClick={() => setShowActivityDetail(false)} className="w-full">
                  Baad Mein Karenge
                </TactileButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-6 py-8 bg-gradient-to-b from-success/10 to-transparent">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/app')} className="flex items-center gap-2 text-muted-foreground mb-4" aria-label="Wapas jaayein">
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Nunito, sans-serif' }}>Wapas</span>
        </motion.button>
        <h1 className="text-3xl text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>😊 Khushi Ka Samay</h1>
        <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{displayName}, aaj kya karna hai?</p>
      </header>

      <main className="px-6 space-y-8">
        {/* Activities with Dice Shuffle */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              🎯 Aaj Ye Karein
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{completedCount}/4 done</span>
              <motion.button
                whileTap={canShuffle ? { scale: 0.9, rotate: 180 } : {}}
                onClick={handleShuffle}
                disabled={!canShuffle}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  canShuffle
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground'
                }`}
                aria-label={canShuffle ? 'Shuffle activities' : `Complete ${2 - completedCount} more to shuffle`}
                title={canShuffle ? 'Naye activities lao!' : `Pehle ${2 - completedCount} aur complete karo`}
              >
                {canShuffle ? (
                  <Dice5 className="w-5 h-5" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>
          
          {!canShuffle && (
            <p className="text-xs text-muted-foreground mb-3 bg-muted/50 rounded-lg px-3 py-2">
              🎲 {2 - completedCount} aur activities complete karein naye suggestions ke liye!
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {activities.slice(0, 4).map((activity, i) => {
              const isCompleted = completedToday.has(activity.id);
              return (
                <motion.button
                  key={`${activity.id}-${shuffleCount}`}
                  initial={reduced ? {} : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleStartActivity(activity)}
                  className={`p-4 rounded-2xl border text-center min-h-[100px] flex flex-col items-center justify-center gap-2 relative ${
                    isCompleted
                      ? 'bg-success/10 border-success'
                      : 'bg-card border-border'
                  }`}
                  style={{ boxShadow: "0 2px 12px -4px hsl(30 50% 20% / 0.1)" }}
                >
                  {isCompleted && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                  )}
                  <span className="text-3xl" aria-hidden="true">{activity.icon}</span>
                  <p className="text-sm font-semibold text-foreground">{activity.name}</p>
                  <p className="text-xs text-muted-foreground">{activity.duration} min</p>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Guardian's Custom Content - Suno (Listen) */}
        {joyPrefs?.suno_config?.enabled && joyPrefs.suno_config.playlist_url && (
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              🎵 Guardian ne Aapke Liye Rakha
            </h2>
            <a
              href={joyPrefs.suno_config.playlist_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-card rounded-2xl border border-border"
              style={{ boxShadow: "0 2px 12px -4px hsl(30 50% 20% / 0.1)" }}
            >
              <span className="text-4xl">🎶</span>
              <div className="flex-1">
                <p className="text-lg font-semibold text-foreground">Custom Playlist</p>
                <p className="text-muted-foreground text-sm">Guardian ka pasandeeda collection</p>
              </div>
              <ExternalLink className="w-5 h-5 text-primary" />
            </a>
          </section>
        )}

        {/* Guardian's Photos Album */}
        {joyPrefs?.yaadein_config?.enabled && joyPrefs.yaadein_config.album_url && (
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              🖼️ Yaadein Album
            </h2>
            <a
              href={joyPrefs.yaadein_config.album_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-card rounded-2xl border border-border"
              style={{ boxShadow: "0 2px 12px -4px hsl(30 50% 20% / 0.1)" }}
            >
              <span className="text-4xl">📸</span>
              <div className="flex-1">
                <p className="text-lg font-semibold text-foreground">Family Photos</p>
                <p className="text-muted-foreground text-sm">Google Photos album kholein</p>
              </div>
              <ExternalLink className="w-5 h-5 text-primary" />
            </a>
          </section>
        )}

        {/* Time-based video content */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl" aria-hidden="true">{videoContent.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>{videoContent.title}</h2>
              <p className="text-muted-foreground">{videoContent.subtitle}</p>
            </div>
          </div>
          <div className="space-y-3">
            {videoContent.videos.map((item, i) => (
              <motion.button
                key={item.id}
                initial={reduced ? {} : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPlayingVideo(item)}
                className="w-full p-5 bg-card rounded-2xl border border-border flex items-center gap-4 text-left"
                style={{ boxShadow: "0 2px 12px -4px hsl(30 50% 20% / 0.1)" }}
                aria-label={`${item.title} chalayein, ${item.duration}`}
              >
                <span className="text-4xl" aria-hidden="true">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-foreground">{item.title}</p>
                  <p className="text-muted-foreground">{item.duration}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center" aria-hidden="true">
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
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory" role="list">
              {familyPhotos.map(photo => (
                <div key={photo.id} className="snap-center shrink-0" role="listitem">
                  <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-border">
                    <img src={photo.photo_url} alt={`${photo.name} ki photo`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-2">{photo.name} - {photo.relationship}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mood check */}
        <motion.section
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-card rounded-2xl border border-border"
          aria-label="Mood check"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Aaj kaisa lag raha hai?
          </h3>
          <div className="flex justify-around" role="radiogroup" aria-label="Mood select karein">
            {[
              { emoji: '😊', label: 'Khush' },
              { emoji: '😐', label: 'Theek' },
              { emoji: '😔', label: 'Udaas' },
            ].map(item => (
              <motion.button
                key={item.emoji}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleMoodSelect(item.emoji)}
                role="radio"
                aria-checked={mood === item.emoji}
                aria-label={item.label}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${mood === item.emoji ? 'bg-primary/20 ring-2 ring-primary' : ''}`}
              >
                <span className="text-5xl">{item.emoji}</span>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </motion.button>
            ))}
          </div>
          {mood && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-primary mt-4 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }} role="status">
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
