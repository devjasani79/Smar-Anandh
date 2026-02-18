import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Heart, Shield, Bell, Users, ChevronRight, Sparkles, Phone, Calendar, 
  Star, Menu, X, ArrowRight, CheckCircle, Clock, Zap, Globe
} from 'lucide-react';
import { HeroCarousel } from '@/components/landing/HeroCarousel';
import { useState, useRef } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.8]);

  const features = [
    {
      icon: Bell,
      title: 'Dawa Yaad',
      subtitle: 'Smart Medicine Reminders',
      description: 'Never miss a dose. Visual pill identification, automated schedules, and gentle nudges for your loved ones.',
      color: 'bg-primary/10 text-primary',
      stat: '95%',
      statLabel: 'adherence rate'
    },
    {
      icon: Heart,
      title: 'Khushi Corner',
      subtitle: 'Curated Joy Activities', 
      description: 'Bhajans, Ramayan episodes, memory games — all handpicked for Indian seniors. Zero setup needed.',
      color: 'bg-success/10 text-success',
      stat: '30+',
      statLabel: 'activities daily'
    },
    {
      icon: Users,
      title: 'Parivaar Connect',
      subtitle: 'One-Tap Family Calls',
      description: 'Giant photo tiles of family members. One tap to call. No searching contacts, no confusion.',
      color: 'bg-blue-500/10 text-blue-500',
      stat: '1-tap',
      statLabel: 'to connect'
    },
    {
      icon: Shield,
      title: 'Guardian Dashboard',
      subtitle: 'Real-Time Peace of Mind',
      description: 'Live activity feed, medication logs, health vitals — all in one dashboard. Know they are safe, always.',
      color: 'bg-purple-500/10 text-purple-500',
      stat: '24/7',
      statLabel: 'monitoring'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Daughter, Mumbai',
      text: 'Mummy was forgetting her BP medicines daily. Within a week of using SmarAnandh, she takes them on time every day. The big buttons and Hindi text make it so easy for her.',
      avatar: '👩‍💼',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      role: 'Son, Bangalore',
      text: 'Papa lives alone in Lucknow. I used to worry constantly. Now I can see his medication logs and activity in real-time. It\'s like being there without being there.',
      avatar: '👨‍💼',
      rating: 5
    },
    {
      name: 'Anita Verma',
      role: 'Granddaughter, Delhi',
      text: 'Nani loves the bhajans section! She plays Hanuman Chalisa every morning. The memory games keep her mind sharp. She actually asks for the phone now!',
      avatar: '👩',
      rating: 5
    }
  ];

  const steps = [
    { 
      number: '01', 
      icon: Phone,
      title: 'Guardian Registers', 
      description: 'Sign up with your email and phone. Takes 30 seconds.',
      detail: 'Your phone number becomes the key for senior login.'
    },
    { 
      number: '02', 
      icon: Calendar,
      title: 'Set Up Senior', 
      description: 'Add your loved one\'s name, preferences, and medicines.',
      detail: 'Upload their photo so they see themselves on the home screen.'
    },
    { 
      number: '03', 
      icon: Shield,
      title: 'Share the PIN', 
      description: 'Create a 4-digit Family PIN. That\'s it — they\'re in.',
      detail: 'Senior uses your phone + PIN. No email or password needed.'
    }
  ];

  const stats = [
    { value: '140M+', label: 'Seniors in India', icon: Globe },
    { value: '65%', label: 'Miss medicines daily', icon: Clock },
    { value: '< 2min', label: 'To set up care', icon: Zap },
    { value: '100%', label: 'Free to start', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
                SmarAnandh
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How It Works', 'Reviews'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                   className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                   style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/senior/auth')}
                className="px-4 py-2.5 rounded-xl border-2 border-primary/30 text-primary font-medium hover:bg-primary/5 transition-all text-sm"
                style={{ fontFamily: 'Nunito, sans-serif' }}>
                Senior Login
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/auth')}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all text-sm"
                style={{ fontFamily: 'Nunito, sans-serif' }}>
                Guardian Login
              </motion.button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-4">
                {['Features', 'How It Works', 'Reviews'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                     className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>{item}</a>
                ))}
                <div className="flex flex-col gap-2 pt-2">
                  <button onClick={() => { navigate('/senior/auth'); setMobileMenuOpen(false); }} className="py-3 rounded-xl border-2 border-primary text-primary font-medium">Senior Login</button>
                  <button onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }} className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold">Guardian Login</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-16 md:pt-20 relative">
        <motion.div style={{ opacity: heroOpacity }} className="w-full h-[45vh] md:h-[50vh] lg:h-[55vh] xl:h-[60vh] min-h-[280px] relative overflow-hidden">
          <HeroCarousel fullWidth />
        </motion.div>

        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium" style={{ fontFamily: 'Nunito, sans-serif' }}>India's #1 Elder Care Companion</span>
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Your parents deserve <br className="hidden sm:block" />
              <span className="text-primary">care that feels</span> like <span className="text-success">family</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: 'Nunito, sans-serif' }}>
              SmarAnandh is the digital bahu/beta your parents always had — reminding medicines, playing bhajans, connecting family, and keeping them safe. All with one simple PIN.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/auth')}
                className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-lg font-semibold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group"
                style={{ fontFamily: 'Nunito, sans-serif' }}>
                Start Caring — It's Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 rounded-2xl bg-card text-foreground text-lg font-medium border-2 border-border hover:border-primary/30 transition-all"
                style={{ fontFamily: 'Nunito, sans-serif' }}>
                See How It Works
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 md:py-12 bg-card border-y border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>{stat.value}</p>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
            <p className="text-primary font-medium text-sm mb-3 uppercase tracking-wider" style={{ fontFamily: 'Nunito, sans-serif' }}>Features</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-foreground mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Everything your elders need, <span className="text-primary">nothing they don't</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto" style={{ fontFamily: 'Nunito, sans-serif' }}>
              80px touch targets. Hindi text. No scrolling through menus. Just tap and go.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' }}
                className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>{feature.stat}</p>
                    <p className="text-xs text-muted-foreground">{feature.statLabel}</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{feature.title}</h3>
                <p className="text-sm text-primary font-medium mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>{feature.subtitle}</p>
                <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: 'Nunito, sans-serif' }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 px-4 md:px-6 bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
            <p className="text-primary font-medium text-sm mb-3 uppercase tracking-wider" style={{ fontFamily: 'Nunito, sans-serif' }}>Setup</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-foreground mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Set up in <span className="text-primary">under 2 minutes</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              No tech skills needed. If you can use WhatsApp, you can use SmarAnandh.
            </p>
          </motion.div>

          <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            
            {steps.map((step, index) => (
              <motion.div key={step.number} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.15 }}
                className="relative bg-background rounded-2xl p-6 md:p-8 border border-border/50 text-center">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-lg shadow-primary/20 relative z-10"
                     style={{ fontFamily: 'Playfair Display, serif' }}>
                  {step.number}
                </div>
                <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>{step.description}</p>
                <p className="text-xs text-primary/70 bg-primary/5 rounded-lg px-3 py-2" style={{ fontFamily: 'Nunito, sans-serif' }}>{step.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-16 md:py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
            <p className="text-primary font-medium text-sm mb-3 uppercase tracking-wider" style={{ fontFamily: 'Nunito, sans-serif' }}>Testimonials</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-foreground mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Trusted by <span className="text-primary">real Indian families</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border/50 relative">
                {/* Quote mark */}
                <div className="text-5xl text-primary/20 absolute top-4 right-6 leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>"</div>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl text-primary-foreground mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Don't wait for a missed medicine to remind you.
              </h2>
              <p className="text-base md:text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Set up SmarAnandh today. Your parents will thank you — and you'll sleep better at night.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/auth')}
                  className="px-8 md:px-10 py-4 md:py-5 rounded-2xl bg-white text-primary text-lg md:text-xl font-semibold shadow-xl hover:shadow-2xl transition-all group"
                  style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Start Free Today 🙏
                  <ArrowRight className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/senior/auth')}
                  className="px-8 md:px-10 py-4 md:py-5 rounded-2xl bg-primary-foreground/10 text-primary-foreground text-lg md:text-xl font-medium border-2 border-primary-foreground/30 hover:bg-primary-foreground/20 transition-all"
                  style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Senior Access
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 md:px-6 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>SmarAnandh</span>
            </div>
            <p className="text-sm text-muted-foreground text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Made with ❤️ in India for Indian families · Privacy-first · No ads, ever.
            </p>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              © 2026 SmarAnandh
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
