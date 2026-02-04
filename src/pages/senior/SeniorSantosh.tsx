import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Music, Tv, Image, Gamepad2, X, Pause } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TactileButton } from '@/components/TactileButton';

interface JoyOption {
  id: string;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  action: () => void;
}

interface YouTubeVideo {
  id: string;
  title: string;
  emoji: string;
  videoId: string;
  duration?: string;
}

export default function SeniorSantosh() {
  const navigate = useNavigate();
  const { seniorSession } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<YouTubeVideo | null>(null);
  const [mood, setMood] = useState<string | null>(null);

  useEffect(() => {
    if (!seniorSession) {
      navigate('/senior/auth');
    }
  }, [seniorSession, navigate]);

  if (!seniorSession) return null;

  const displayName = seniorSession.preferredName || seniorSession.seniorName;

  const joyOptions: JoyOption[] = [
    {
      id: 'suno',
      icon: <Music className="w-8 h-8" />,
      emoji: '🎵',
      title: 'SUNO',
      subtitle: 'Bhajans & Music',
      color: 'from-amber-500 to-orange-600',
      action: () => setActiveCategory('suno')
    },
    {
      id: 'dekho',
      icon: <Tv className="w-8 h-8" />,
      emoji: '📺',
      title: 'DEKHO',
      subtitle: 'Videos & TV',
      color: 'from-blue-500 to-indigo-600',
      action: () => setActiveCategory('dekho')
    },
    {
      id: 'yaadein',
      icon: <Image className="w-8 h-8" />,
      emoji: '📸',
      title: 'YAADEIN',
      subtitle: 'Photo Album',
      color: 'from-pink-500 to-rose-600',
      action: () => setActiveCategory('yaadein')
    },
    {
      id: 'khelo',
      icon: <Gamepad2 className="w-8 h-8" />,
      emoji: '🎮',
      title: 'KHELO',
      subtitle: 'Simple Games',
      color: 'from-green-500 to-emerald-600',
      action: () => setActiveCategory('khelo')
    }
  ];

  // YouTube Content - Curated bhajans and devotional content
  const sunoContent: YouTubeVideo[] = [
    { id: '1', title: 'Hanuman Chalisa', emoji: '🙏', videoId: 'AETFvQonfV8', duration: '9 min' },
    { id: '2', title: 'Gayatri Mantra', emoji: '🕉️', videoId: 'HxTM6YPYj7Q', duration: '60 min' },
    { id: '3', title: 'Om Jai Jagdish Hare', emoji: '🪔', videoId: 'DfxNlI5x5FQ', duration: '6 min' },
    { id: '4', title: 'Shri Krishna Bhajan', emoji: '🦚', videoId: 'kfJIFoYkj8o', duration: '30 min' },
    { id: '5', title: 'Peaceful Morning Ragas', emoji: '🌅', videoId: 'Z8V2qnVj0HA', duration: '45 min' },
    { id: '6', title: 'Old Hindi Classics', emoji: '🎤', videoId: 'xrYx5Tl7yiM', duration: '60 min' },
  ];

  const dekhoContent: YouTubeVideo[] = [
    { id: '1', title: 'Ramayan - Full Episode', emoji: '📺', videoId: 'qb1LtFczYs4', duration: 'Serial' },
    { id: '2', title: 'Nature Relaxation', emoji: '🌿', videoId: 'lM02vNMRRB0', duration: 'Relaxing' },
    { id: '3', title: 'Shri Krishna Serial', emoji: '🦚', videoId: 'u8bPZgGP5rk', duration: 'Serial' },
    { id: '4', title: 'Wildlife Documentary', emoji: '🦁', videoId: 'nlYlNF30bVg', duration: 'Documentary' },
  ];

  const gameContent = [
    { id: '1', title: 'Memory Match', emoji: '🧠', difficulty: 'Easy', url: 'memory' },
    { id: '2', title: 'Number Puzzle', emoji: '🔢', difficulty: 'Medium', url: 'numbers' },
    { id: '3', title: 'Word Game', emoji: '📝', difficulty: 'Easy', url: 'words' },
  ];

  const handleMoodSelect = (selectedMood: string) => {
    setMood(selectedMood);
    // Could save this to activity_logs via API
  };

  // Video Player Modal
  const VideoPlayer = () => {
    if (!playingVideo) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setPlayingVideo(null)}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <X className="w-8 h-8 text-white" />
          </motion.button>
        </div>

        {/* Video Title */}
        <div className="p-6 text-center text-white">
          <p className="text-xl" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {playingVideo.emoji} {playingVideo.title}
          </p>
        </div>

        {/* YouTube Player */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src={`https://www.youtube.com/embed/${playingVideo.videoId}?autoplay=1&rel=0`}
              title={playingVideo.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Bottom controls */}
        <div className="p-6">
          <TactileButton
            variant="neutral"
            size="large"
            onClick={() => setPlayingVideo(null)}
            className="w-full bg-white/20 text-white border-white/30"
          >
            <Pause className="w-6 h-6 mr-2" />
            Band Karein (Stop)
          </TactileButton>
        </div>
      </motion.div>
    );
  };

  const renderCategoryContent = () => {
    if (!activeCategory) return null;

    const getContent = () => {
      switch (activeCategory) {
        case 'suno':
          return (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                🎵 Sunne ke liye chunein
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Tap to play devotional music and bhajans
              </p>
              {sunoContent.map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPlayingVideo(item)}
                  className="w-full p-5 bg-card rounded-2xl border border-border flex items-center gap-4 text-left shadow-sm hover:shadow-md transition-shadow"
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
          );
        
        case 'dekho':
          return (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                📺 Dekhne ke liye chunein
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Tap to watch serials and nature videos
              </p>
              {dekhoContent.map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPlayingVideo(item)}
                  className="w-full p-5 bg-card rounded-2xl border border-border flex items-center gap-4 text-left shadow-sm hover:shadow-md transition-shadow"
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
          );

        case 'yaadein':
          return (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                📸 Aapki Yaadein
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Your family photos will appear here
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    whileTap={{ scale: 0.98 }}
                    className="aspect-square bg-muted rounded-2xl flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-4xl">📷</span>
                      <p className="text-sm text-muted-foreground mt-2">Album {i}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-center text-amber-800 dark:text-amber-200 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  💡 Guardian aapke photos Settings mein add kar sakte hain
                </p>
              </div>
            </div>
          );

        case 'khelo':
          return (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                🎮 Game Khelen
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Simple games to keep your mind active
              </p>
              {gameContent.map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-5 bg-card rounded-2xl border border-border flex items-center gap-4 text-left shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-4xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground">{item.title}</p>
                    <p className="text-muted-foreground">{item.difficulty}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
                    <Play className="w-6 h-6 text-success-foreground" />
                  </div>
                </motion.button>
              ))}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-center text-green-800 dark:text-green-200 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  🧠 Games aapke dimag ko active rakhte hain!
                </p>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <button
          onClick={() => setActiveCategory(null)}
          className="flex items-center gap-2 text-primary mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Nunito, sans-serif' }}>Wapas</span>
        </button>
        {getContent()}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Video Player Modal */}
      {playingVideo && <VideoPlayer />}

      {/* Header */}
      <header className="px-6 py-8 bg-gradient-to-b from-success/10 to-transparent">
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
          😊 Khushi Ka Samay
        </h1>
        <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {displayName}, aaj kya karna hai?
        </p>
      </header>

      {/* Content */}
      <main className="px-6">
        {!activeCategory ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-4"
          >
            {joyOptions.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={option.action}
                className={`aspect-square rounded-3xl bg-gradient-to-br ${option.color} p-6 flex flex-col items-center justify-center text-white shadow-lg`}
              >
                <span className="text-5xl mb-3">{option.emoji}</span>
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {option.title}
                </h3>
                <p className="text-sm opacity-90">{option.subtitle}</p>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          renderCategoryContent()
        )}

        {/* Mood check */}
        {!activeCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 bg-card rounded-2xl border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Aaj kaisa lag raha hai?
            </h3>
            <div className="flex justify-around">
              {[
                { emoji: '😊', label: 'Khush' },
                { emoji: '😐', label: 'Theek' },
                { emoji: '😔', label: 'Udaas' }
              ].map((item) => (
                <motion.button
                  key={item.emoji}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleMoodSelect(item.emoji)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                    mood === item.emoji ? 'bg-primary/20' : 'hover:bg-muted'
                  }`}
                >
                  <span className="text-5xl">{item.emoji}</span>
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </motion.button>
              ))}
            </div>
            {mood && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-primary mt-4 text-sm"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                ✓ Aapka mood record ho gaya!
              </motion.p>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
