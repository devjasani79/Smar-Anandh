import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Shield, Bell, Users, ChevronRight, Flower2, Music, PhoneCall } from 'lucide-react';

// Custom Diya Logo Component to match your favicon
const DiyaLogo = ({ className = "w-10 h-10" }) => (
  <div className={`${className} rounded-xl bg-primary flex items-center justify-center relative overflow-hidden shadow-inner`}>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-4 h-6 bg-white rounded-full blur-[2px] opacity-30" />
    <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
  </div>
);

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bell,
      title: 'Dawa Reminders',
      description: 'Clear, timely alerts for medicines with visual instructions that even children or elders can follow.'
    },
    {
      icon: Music,
      title: 'Khushi & Bhajans',
      description: 'A curated joy-center featuring old classics, spiritual music, and memory games.'
    },
    {
      icon: PhoneCall,
      title: 'Parivaar Connect',
      description: 'Zero-confusion video calling. Just tap the face of the family member to start a call.'
    },
    {
      icon: Shield,
      title: 'Guardian Dashboard',
      description: 'Complete peace of mind. Monitor health vitals and pill compliance from anywhere in the world.'
    }
  ];

  const steps = [
    { number: '1', title: 'Guardian Setup', description: 'Download the app and create a profile for your loved one.' },
    { number: '2', title: 'Set Family PIN', description: 'Create a simple 4-digit PIN that replaces complex passwords for the senior.' },
    { number: '3', title: 'Install & Enjoy', description: 'Log in on the senior’s tablet or phone. Care begins instantly.' }
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DiyaLogo className="w-10 h-10" />
            <span className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
              SmarAnandh
            </span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">Process</a>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all"
            >
              Login
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                <Flower2 className="w-4 h-4" /> Trusted by 1000+ Indian Families
              </div>
              <h1 className="text-5xl md:text-7xl text-foreground mb-8 leading-[1.1] font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Distance shouldn't mean <span className="text-primary italic">disconnection.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
                The first digital companion designed with the warmth of Indian values and the simplicity seniors deserve.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-xl hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  Start Caring Today <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-[2.5rem] border-8 border-card bg-card shadow-2xl overflow-hidden aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary">
                 <div className="text-center">
                    <motion.div 
                       animate={{ filter: ["drop-shadow(0 0 10px rgba(255,159,28,0.4))", "drop-shadow(0 0 20px rgba(255,159,28,0.2))"] }}
                       transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    >
                      <DiyaLogo className="w-32 h-32 mx-auto mb-6 scale-125" />
                    </motion.div>
                    <p className="text-3xl font-bold italic text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>
                      "SmarAnandh"
                    </p>
                    <p className="text-muted-foreground mt-2">Connecting Generations</p>
                 </div>
              </div>
              {/* Floating Stat Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-border"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">✓</div>
                <div>
                  <p className="text-xs text-muted-foreground">Morning Dawa</p>
                  <p className="text-sm font-bold">Taken at 8:30 AM</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/20">
        <div className="container mx-auto px-6 max-w-6xl text-center">
          <h2 className="text-4xl font-bold mb-16" style={{ fontFamily: 'Playfair Display, serif' }}>
            Built for <span className="underline decoration-primary/30">Accessibility</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-card p-8 rounded-3xl shadow-sm hover:shadow-md transition-all border border-border/50 text-left group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className="py-24">
         <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-20" style={{ fontFamily: 'Playfair Display, serif' }}>How it works</h2>
            <div className="relative">
               <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 hidden md:block" />
               <div className="grid md:grid-cols-3 gap-12">
                  {steps.map((s, i) => (
                    <div key={i} className="bg-background">
                       <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg ring-8 ring-background">
                          {s.number}
                       </div>
                       <h4 className="text-xl font-bold mb-2">{s.title}</h4>
                       <p className="text-muted-foreground text-sm">{s.description}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <DiyaLogo className="w-8 h-8" />
            <span className="font-bold text-lg">SmarAnandh</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 SmarAnandh. Crafted for Indian families. 🇮🇳</p>
        </div>
      </footer>
    </div>
  );
}
