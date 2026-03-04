import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Heart, Shield, Bell, Users, Sparkles, Phone, Calendar, 
  Star, Menu, X, ArrowRight, CheckCircle, Clock, Zap, Globe,
  Quote, ChevronDown, Eye, Pill, HandHeart
} from 'lucide-react';
import { HeroCarousel } from '@/components/landing/HeroCarousel';
import { useState, useRef } from 'react';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

function CountUp({ target, suffix = '' }: { target: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <span ref={ref} className="tabular-nums">
      {isInView ? target : '0'}{suffix}
    </span>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const navBg = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  const features = [
    {
      icon: Pill,
      title: 'Dawa Yaad',
      subtitle: 'Smart Medicine Reminders',
      description: 'Never miss a dose. Visual pill identification, automated schedules, and gentle nudges in Hindi/Hinglish your loved ones understand.',
      gradient: 'from-primary/15 to-primary/5',
      iconBg: 'bg-primary/15 text-primary',
      stat: '95%',
      statLabel: 'adherence rate'
    },
    {
      icon: Heart,
      title: 'Khushi Corner',
      subtitle: 'Joy & Entertainment',
      description: 'Morning bhajans, Ramayan episodes, photo albums, brain games — curated for Indian seniors. Zero confusion, pure joy.',
      gradient: 'from-success/15 to-success/5',
      iconBg: 'bg-success/15 text-success',
      stat: '30+',
      statLabel: 'daily activities'
    },
    {
      icon: Users,
      title: 'Parivaar Connect',
      subtitle: 'One-Tap Family Calls',
      description: 'Giant photo tiles of family members. One tap to call Beti, Beta, or Pota. No searching through contacts.',
      gradient: 'from-blue-500/15 to-blue-500/5',
      iconBg: 'bg-blue-500/15 text-blue-500',
      stat: '1-tap',
      statLabel: 'to connect'
    },
    {
      icon: Eye,
      title: 'Guardian Dashboard',
      subtitle: 'Real-Time Peace of Mind',
      description: 'Live medication logs, activity feed, health vitals — everything at a glance. Know they\'re okay without calling.',
      gradient: 'from-purple-500/15 to-purple-500/5',
      iconBg: 'bg-purple-500/15 text-purple-500',
      stat: '24/7',
      statLabel: 'monitoring'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Daughter · Mumbai',
      text: 'Mummy was forgetting her BP medicines daily. Within a week of SmarAnandh, she takes them on time. The big buttons and Hindi text make it so easy for her.',
      avatar: '👩‍💼',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      role: 'Son · Bangalore',
      text: 'Papa lives alone in Lucknow. I used to worry constantly. Now I see his medication logs in real-time. It\'s like being there without being there.',
      avatar: '👨‍💼',
      rating: 5
    },
    {
      name: 'Anita Verma',
      role: 'Granddaughter · Delhi',
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
      description: 'Sign up with email & phone. Takes 30 seconds.',
      detail: 'Your phone number becomes the key for senior login.'
    },
    { 
      number: '02', 
      icon: Calendar,
      title: 'Set Up Senior Profile', 
      description: 'Add name, photo, medicines, and preferences.',
      detail: 'Upload their photo — they see themselves on the home screen.'
    },
    { 
      number: '03', 
      icon: Shield,
      title: 'Share the PIN', 
      description: 'Create a 4-digit Family PIN. That\'s it — they\'re in.',
      detail: 'Phone number + PIN. No email or password needed for seniors.'
    }
  ];

  const stats = [
    { value: '140M+', label: 'Seniors in India', icon: Globe },
    { value: '65%', label: 'Miss medicines daily', icon: Clock },
    { value: '< 2min', label: 'Setup time', icon: Zap },
    { value: '100%', label: 'Free to start', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-18">
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                SmarAnandh
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-6">
              {['Features', 'How It Works', 'Reviews'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                   className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                   style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2.5">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/senior/auth')}
                className="px-4 py-2 rounded-xl border border-border text-foreground font-medium hover:bg-muted/50 transition-all text-sm"
                style={{ fontFamily: 'Nunito, sans-serif' }}>
                Senior Login
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/auth')}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:shadow-lg transition-all text-sm"
                style={{ fontFamily: 'Nunito, sans-serif' }}>
                Get Started
              </motion.button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden py-4 border-t border-border/50">
              <div className="flex flex-col gap-3">
                {['Features', 'How It Works', 'Reviews'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                     className="text-foreground py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>{item}</a>
                ))}
                <div className="flex flex-col gap-2 pt-3">
                  <button onClick={() => { navigate('/senior/auth'); setMobileMenuOpen(false); }} className="py-3 rounded-xl border border-border text-foreground font-medium text-sm">Senior Login</button>
                  <button onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }} className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Get Started Free</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="pt-16 md:pt-18 relative">
        {/* Carousel — responsive heights */}
        <div className="w-full h-[45vh] md:h-[55vh] lg:h-[65vh] xl:h-[70vh] min-h-[280px] max-h-[700px] relative overflow-hidden">
          <HeroCarousel fullWidth />
          {/* Bottom fade into content */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Hero copy */}
        <div className="container mx-auto px-4 md:px-6 -mt-12 md:-mt-16 relative z-10">
          <motion.div 
            initial="hidden" animate="visible" variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-5 border border-primary/20 text-sm font-medium"
              style={{ fontFamily: 'Nunito, sans-serif' }}>
              <HandHeart className="w-4 h-4" />
              Built for Indian families, by Indian families
            </motion.div>
            
            <motion.h1 variants={fadeUp}
              className="text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem] text-foreground mb-5 leading-[1.15] font-bold"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Your parents deserve{' '}
              <span className="text-primary relative inline-block">
                care that feels
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M1 5.5C40 2 80 2 100 4C120 6 160 3 199 5" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                </svg>
              </span>
              {' '}like family
            </motion.h1>
            
            <motion.p variants={fadeUp}
              className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto"
              style={{ fontFamily: 'Nunito, sans-serif' }}>
              Medicine reminders in Hindi. Bhajans on tap. Family calls with one touch. 
              SmarAnandh is the digital companion your elders actually enjoy using.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button 
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }} 
                onClick={() => navigate('/auth')}
                className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl transition-all flex items-center justify-center gap-2 group"
                style={{ fontFamily: 'Nunito, sans-serif' }}>
                Start Caring — It's Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 rounded-2xl bg-card text-foreground text-base font-medium border border-border hover:border-primary/30 transition-all"
                style={{ fontFamily: 'Nunito, sans-serif' }}>
                See How It Works
              </motion.button>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              className="mt-10 flex justify-center"
            >
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <ChevronDown className="w-5 h-5 text-muted-foreground/50" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="py-10 md:py-14 bg-card/60 border-y border-border/30">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center group">
                <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-0.5" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <CountUp target={stat.value} />
                </p>
                <p className="text-xs text-muted-foreground tracking-wide" style={{ fontFamily: 'Nunito, sans-serif' }}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-primary font-semibold text-xs mb-3 uppercase tracking-[0.15em]" style={{ fontFamily: 'Nunito, sans-serif' }}>Features</motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl lg:text-4xl text-foreground mb-4 font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Everything they need, <span className="text-primary">nothing they don't</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto" style={{ fontFamily: 'Nunito, sans-serif' }}>
              80px touch targets. Hindi labels. No menus. Just tap and go.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}
            className="grid sm:grid-cols-2 gap-5"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}
                className={`bg-gradient-to-br ${feature.gradient} rounded-2xl p-6 md:p-7 border border-border/40 hover:border-border transition-all group relative overflow-hidden`}>
                {/* Decorative circle */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.iconBg} group-hover:scale-105 transition-transform`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>{feature.stat}</p>
                    <p className="text-[11px] text-muted-foreground">{feature.statLabel}</p>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-0.5" style={{ fontFamily: 'Playfair Display, serif' }}>{feature.title}</h3>
                <p className="text-xs text-primary font-semibold mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>{feature.subtitle}</p>
                <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: 'Nunito, sans-serif' }}>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-16 md:py-24 px-4 md:px-6 bg-card/40">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-primary font-semibold text-xs mb-3 uppercase tracking-[0.15em]" style={{ fontFamily: 'Nunito, sans-serif' }}>Setup</motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl lg:text-4xl text-foreground mb-4 font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ready in <span className="text-primary">under 2 minutes</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              If you can use WhatsApp, you can set up SmarAnandh.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}
            className="grid md:grid-cols-3 gap-6 relative"
          >
            {/* Connecting line */}
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
            
            {steps.map((step, index) => (
              <motion.div key={step.number} variants={fadeUp}
                className="relative bg-background rounded-2xl p-6 border border-border/40 text-center hover:shadow-lg hover:shadow-primary/5 transition-shadow">
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md shadow-primary/20 relative z-10"
                     style={{ fontFamily: 'Playfair Display, serif' }}>
                  {step.number}
                </div>
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary/8 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5" style={{ fontFamily: 'Nunito, sans-serif' }}>{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>{step.description}</p>
                <p className="text-xs text-primary/80 bg-primary/5 rounded-lg px-3 py-2" style={{ fontFamily: 'Nunito, sans-serif' }}>{step.detail}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="reviews" className="py-16 md:py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-primary font-semibold text-xs mb-3 uppercase tracking-[0.15em]" style={{ fontFamily: 'Nunito, sans-serif' }}>Real Stories</motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl lg:text-4xl text-foreground mb-4 font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Families who <span className="text-primary">found peace</span>
            </motion.h2>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}
            className="grid md:grid-cols-3 gap-5"
          >
            {testimonials.map((testimonial) => (
              <motion.div key={testimonial.name} variants={fadeUp}
                className="bg-card rounded-2xl p-6 border border-border/40 relative group hover:border-primary/20 transition-colors">
                <Quote className="w-8 h-8 text-primary/10 absolute top-5 right-5" />
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-primary via-primary/95 to-primary/85 rounded-3xl p-8 md:p-14 text-center relative overflow-hidden"
          >
            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl text-primary-foreground mb-4 font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Don't wait for a missed dose to remind you.
              </h2>
              <p className="text-primary-foreground/75 mb-8 max-w-xl mx-auto" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Set up SmarAnandh today. Your parents will feel cared for — and you'll finally sleep peacefully.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/auth')}
                  className="px-8 py-4 rounded-2xl bg-background text-primary text-lg font-semibold shadow-xl hover:shadow-2xl transition-all group"
                  style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Start Free Today 🙏
                  <ArrowRight className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/senior/auth')}
                  className="px-8 py-4 rounded-2xl bg-primary-foreground/10 text-primary-foreground text-lg font-medium border border-primary-foreground/25 hover:bg-primary-foreground/15 transition-all"
                  style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Senior Access
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 md:py-10 px-4 md:px-6 border-t border-border/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-bold text-foreground text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>SmarAnandh</span>
            </div>
            <p className="text-xs text-muted-foreground text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Made with ❤️ in India · Privacy-first · No ads, ever
            </p>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              © 2026 SmarAnandh
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
