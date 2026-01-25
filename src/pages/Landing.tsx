import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Heart, Shield, Bell, Users, ChevronRight, 
  Music, PhoneCall, Sparkles, Sun, 
  CloudSun, HandsPraying
} from 'lucide-react';

// Custom Diya Logo with a glowing animation
const BrandedLogo = () => (
  <motion.div 
    whileHover={{ rotate: 5 }}
    className="relative flex items-center justify-center"
  >
    <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-lg border border-white/20">
      <Heart className="w-7 h-7 text-white fill-white" />
    </div>
  </motion.div>
);

export default function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  const features = [
    {
      icon: Bell,
      title: 'Smart Dawa alerts',
      color: 'bg-orange-100 text-orange-600',
      description: 'Audio-visual reminders in local languages to ensure health stays a priority.'
    },
    {
      icon: Music,
      title: 'Sanskriti & Joy',
      color: 'bg-emerald-100 text-emerald-600',
      description: 'Hand-picked Bhajans, old movie classics, and guided meditation for peace.'
    },
    {
      icon: PhoneCall,
      title: 'Sparsh Connect',
      color: 'bg-blue-100 text-blue-600',
      description: 'Zero-dial technology. One tap on a family photo starts a crystal-clear video call.'
    },
    {
      icon: Shield,
      title: 'Nirmaan Dashboard',
      color: 'bg-purple-100 text-purple-600',
      description: 'Manage schedules, track vitals, and upload memories remotely from your phone.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-hidden selection:bg-primary/30 text-slate-900">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="container mx-auto max-w-7xl flex items-center justify-between p-3 px-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <BrandedLogo />
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600" style={{ fontFamily: 'Playfair Display, serif' }}>
              SmarAnandh
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 font-medium text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#vision" className="hover:text-primary transition-colors">Our Vision</a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="px-8 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all"
            >
              Sign In
            </motion.button>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-bold mb-8 border border-orange-100/50">
                <Sparkles className="w-4 h-4 animate-spin-slow" /> Care with Modernity & Tradition
              </div>
              <h1 className="text-6xl md:text-8xl font-bold leading-[0.95] tracking-tight mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Dignified care for your <span className="text-primary italic">Elderly.</span>
              </h1>
              <p className="text-xl text-slate-500 mb-10 max-w-lg leading-relaxed">
                A bridge between generations. We combine high-tech health monitoring with a soul-soothing interface for our seniors.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/auth')}
                  className="group px-10 py-5 rounded-2xl bg-primary text-white text-lg font-bold shadow-[0_20px_40px_-15px_rgba(255,159,28,0.4)] flex items-center justify-center gap-3"
                >
                  Start Journey <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>

            <motion.div className="relative">
              {/* Main Visual Image/Card */}
              <motion.div 
                style={{ y: y1 }}
                className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white bg-white aspect-[4/5] md:aspect-square flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="text-center p-10"
                >
                  <div className="relative w-48 h-48 mx-auto mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <img 
                      src="https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?auto=format&fit=crop&q=80&w=400" 
                      alt="Senior Joy"
                      className="relative w-full h-full object-cover rounded-[2rem] shadow-inner"
                    />
                  </div>
                  <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>"SmarAnandh"</h3>
                  <p className="text-slate-400">Smriti. Anandh. Santosh.</p>
                </motion.div>
              </motion.div>

              {/* Floating Hero Icons */}
              <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-10 -right-10 p-6 bg-white rounded-3xl shadow-2xl z-20 border border-slate-100">
                <HandsPraying className="w-10 h-10 text-primary" />
              </motion.div>
              <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute bottom-10 -left-16 p-6 bg-white rounded-3xl shadow-2xl z-20 border border-slate-100">
                <CloudSun className="w-10 h-10 text-blue-400" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Crafted for their <span className="text-primary">comfort</span>
            </h2>
            <p className="text-slate-500 text-lg">We stripped away the complexity of modern apps to focus on what matters: clarity, connection, and health.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
              >
                <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Vision Section */}
      <section id="vision" className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/10 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <Sun className="w-16 h-16 text-primary mx-auto mb-10" />
            <h2 className="text-5xl md:text-6xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
              A new dawn for elder care in India.
            </h2>
            <p className="text-slate-400 text-xl mb-12 max-w-3xl mx-auto">
              "SmarAnandh is not just an app. It is a promise that no parent will feel lonely, and no child will feel guilty about the miles between them."
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="px-12 py-5 rounded-2xl bg-white text-slate-900 text-xl font-bold shadow-2xl"
            >
              Join the Family
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SmarAnandh</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 SmarAnandh. Built with reverence for our elders. 🇮🇳</p>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
