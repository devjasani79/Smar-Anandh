import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Shield, Bell, Users, ChevronRight, Sparkles, Phone, Calendar, Star } from 'lucide-react';
import { HeroCarousel } from '@/components/landing/HeroCarousel';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bell,
      title: 'Dawa Yaad',
      subtitle: 'Medicine Reminders',
      description: 'Gentle, loving reminders with easy visual identification of each medicine',
      color: 'bg-primary/10 text-primary'
    },
    {
      icon: Heart,
      title: 'Khushi Corner',
      subtitle: 'Joy Activities', 
      description: 'Bhajans, puzzles, and memory games tailored for joyful moments',
      color: 'bg-success/10 text-success'
    },
    {
      icon: Users,
      title: 'Parivaar Connect',
      subtitle: 'Family Calls',
      description: 'One-tap video calls with large, easy-to-see buttons for family members',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      icon: Shield,
      title: 'Guardian Sahara',
      subtitle: 'Care Dashboard',
      description: 'Real-time updates and complete care management for peace of mind',
      color: 'bg-purple-500/10 text-purple-500'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Daughter in Mumbai',
      text: 'Mummy no longer forgets her BP medicines. The reminders are so gentle and the app is so simple for her to use!',
      avatar: '👩‍💼'
    },
    {
      name: 'Rajesh Kumar',
      role: 'Son in Bangalore',
      text: 'Papa lives alone in Lucknow. Now I can see if he took his medicines and even do video calls with just one button.',
      avatar: '👨‍💼'
    },
    {
      name: 'Anita Verma',
      role: 'Granddaughter in Delhi',
      text: 'Nani loves playing the memory games! She says it reminds her of the old times. So happy to see her engaged.',
      avatar: '👩'
    }
  ];

  const steps = [
    { 
      number: '1', 
      icon: Phone,
      title: 'Guardian Signs Up', 
      description: 'Quick registration with phone number and email verification' 
    },
    { 
      number: '2', 
      icon: Calendar,
      title: 'Add Senior Details', 
      description: 'Set up your loved one\'s profile with their preferences and medicines' 
    },
    { 
      number: '3', 
      icon: Shield,
      title: 'Create Family PIN', 
      description: 'A simple 4-digit PIN for seniors to access their companion app' 
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span 
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              SmarAnandh
            </span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <a 
              href="#features" 
              className="hidden md:block text-muted-foreground hover:text-foreground transition-colors text-sm"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="hidden md:block text-muted-foreground hover:text-foreground transition-colors text-sm"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              How It Works
            </a>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/senior/auth')}
              className="px-4 py-2 rounded-xl border border-primary text-primary font-medium
                         hover:bg-primary/10 transition-all text-sm"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Senior Login
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/auth')}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold
                         shadow-lg hover:shadow-xl transition-all text-sm"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Guardian Login
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Carousel */}
      <section className="pt-24 pb-12 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  India's Loving Elder Care Companion
                </span>
              </div>
              
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground mb-6 leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Caring for elders with{' '}
                <span className="text-primary">dignity</span> and{' '}
                <span className="text-success">love</span>
              </h1>
              
              <p 
                className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                SmarAnandh brings peace of mind to families by keeping seniors connected, 
                entertained, and cared for — with the warmth of a devoted family companion.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-lg font-semibold
                             shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Start Caring Today
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-2xl bg-secondary text-secondary-foreground text-lg font-medium
                             transition-all hover:bg-secondary/80"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  See How It Works
                </motion.button>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success" />
                  <span>100% Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span>Made in India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Trusted by 1000+ families</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Carousel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <HeroCarousel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 
              className="text-3xl md:text-4xl text-foreground mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Designed with <span className="text-primary">Love</span> for Elders
            </h2>
            <p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Every feature is crafted with Indian seniors in mind — large buttons, clear Hindi/Hinglish text, 
              and a warm, familiar interface they'll love.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 
                  className="text-xl font-bold text-foreground mb-1"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm text-primary font-medium mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {feature.subtitle}
                </p>
                <p 
                  className="text-muted-foreground text-sm"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 
              className="text-3xl md:text-4xl text-foreground mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Get Started in <span className="text-primary">3 Simple Steps</span>
            </h2>
            <p 
              className="text-lg text-muted-foreground"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              It takes less than 5 minutes to set up care for your loved one
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2" />
            
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative bg-card rounded-2xl p-6 shadow-lg text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary text-primary-foreground 
                                  flex items-center justify-center text-2xl font-bold shadow-lg relative z-10"
                       style={{ fontFamily: 'Playfair Display, serif' }}>
                    {step.number}
                  </div>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 
                    className="text-lg font-bold text-foreground mb-2"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {step.title}
                  </h3>
                  <p 
                    className="text-sm text-muted-foreground"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/5 to-success/5">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 
              className="text-3xl md:text-4xl text-foreground mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Loved by <span className="text-primary">Indian Families</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  "{testimonial.text}"
                </p>
                <div className="mt-4 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-3xl md:text-4xl text-primary-foreground mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Ready to bring peace of mind to your family?
            </h2>
            <p 
              className="text-lg text-primary-foreground/80 mb-8"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Join thousands of Indian families who trust SmarAnandh for their loved ones' care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/auth')}
                className="px-10 py-5 rounded-2xl bg-white text-primary text-xl font-semibold
                           shadow-xl hover:shadow-2xl transition-all"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Start Free Today 🙏
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/senior/auth')}
                className="px-10 py-5 rounded-2xl bg-primary-foreground/10 text-primary-foreground text-xl font-medium
                           border-2 border-primary-foreground/30 hover:bg-primary-foreground/20 transition-all"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Senior Access
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-card border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
                SmarAnandh
              </span>
            </div>
            <p 
              className="text-muted-foreground text-sm"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              © 2026 SmarAnandh. Made with ❤️ for Indian families.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
