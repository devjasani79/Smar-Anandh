import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Music, Tv, Image, Gamepad2 } from 'lucide-react';
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

export default function SeniorSantosh() {
  const navigate = useNavigate();
  const { seniorSession } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  // Content categories
  const sunoContent = [
    { id: '1', title: 'Morning Bhajans', emoji: '🌅', duration: '30 min' },
    { id: '2', title: 'Hanuman Chalisa', emoji: '🙏', duration: '15 min' },
    { id: '3', title: 'Classical Ragas', emoji: '🎶', duration: '45 min' },
    { id: '4', title: 'Old Hindi Songs', emoji: '🎤', duration: '60 min' },
  ];

  const dekhoContent = [
    { id: '1', title: 'Ramayan', emoji: '📺', type: 'Serial' },
    { id: '2', title: 'News', emoji: '📰', type: 'Live' },
    { id: '3', title: 'Cooking Shows', emoji: '🍳', type: 'Show' },
    { id: '4', title: 'Nature Videos', emoji: '🌿', type: 'Relaxing' },
  ];

  const gameContent = [
    { id: '1', title: 'Memory Match', emoji: '🧠', difficulty: 'Easy' },
    { id: '2', title: 'Number Puzzle', emoji: '🔢', difficulty: 'Medium' },
    { id: '3', title: 'Word Game', emoji: '📝', difficulty: 'Easy' },
  ];

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
              {sunoContent.map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-5 bg-card rounded-2xl border border-border flex items-center gap-4 text-left shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-4xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground">{item.title}</p>
                    <p className="text-muted-foreground">{item.duration}</p>
                  </div>
                  <Play className="w-8 h-8 text-primary" />
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
              {dekhoContent.map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-5 bg-card rounded-2xl border border-border flex items-center gap-4 text-left shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-4xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground">{item.title}</p>
                    <p className="text-muted-foreground">{item.type}</p>
                  </div>
                  <Play className="w-8 h-8 text-primary" />
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
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    whileTap={{ scale: 0.98 }}
                    className="aspect-square bg-muted rounded-2xl flex items-center justify-center cursor-pointer"
                  >
                    <div className="text-center">
                      <span className="text-4xl">📷</span>
                      <p className="text-sm text-muted-foreground mt-2">Album {i}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-center text-muted-foreground text-sm">
                Guardian photos add kar sakte hain Settings mein
              </p>
            </div>
          );

        case 'khelo':
          return (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                🎮 Game Khelen
              </h3>
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
                  <Play className="w-8 h-8 text-primary" />
                </motion.button>
              ))}
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
              {['😊', '😐', '😔'].map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.9 }}
                  className="text-5xl hover:scale-110 transition-transform"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
