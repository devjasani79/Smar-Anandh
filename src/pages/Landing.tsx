import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Shield, Bell, Users, ChevronRight, Sparkles } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bell,
      title: 'Dawa Reminders',
      description: 'Gentle, non-intrusive medicine reminders with visual pill identification'
    },
    {
      icon: Heart,
      title: 'Khushi Activities',
      description: 'Curated entertainment - bhajans, puzzles, and memory games'
    },
    {
      icon: Users,
      title: 'Parivaar Connect',
      description: 'One-tap video calls to family with large, easy-to-use buttons'
    },
    {
      icon: Shield,
      title: 'Guardian Dashboard',
      description: 'Real-time updates and care management for family members'
    }
  ];

  const steps = [
    { number: '1', title: 'Set Up', description: 'Guardian completes a quick KYC and sets a Family PIN' },
    { number: '2', title: 'Enter PIN', description: 'Senior or Guardian enters the unified 4-digit Family PIN' },
    { number: '3', title: 'Stay Connected', description: 'Seniors enjoy companionship, Guardians stay informed' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
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
          <div className="flex items-center gap-6">
            <a 
              href="#features" 
              className="hidden md:block text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="hidden md:block text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              How It Works
            </a>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/auth')}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold
                         shadow-lg hover:shadow-xl transition-all"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Login
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                A digital companion that cares with{' '}
                <span className="text-primary">dignity</span>
              </h1>
              <p 
                className="text-lg text-muted-foreground mb-8 leading-relaxed"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                SmarAnandh brings peace of mind to families by keeping seniors connected, 
                entertained, and cared for — all with the warmth of a family companion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-lg font-semibold
                             shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Get Started
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-2xl bg-secondary text-secondary-foreground text-lg font-semibold
                             transition-all"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-success/20 p-8">
                <div className="w-full h-full rounded-2xl bg-card shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="w-12 h-12 text-primary" />
                    </div>
                    <p 
                      className="text-2xl text-foreground italic"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      "Because being away doesn't mean being disconnected."
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-success/90 flex items-center justify-center shadow-xl"
              >
                <span className="text-3xl">💊</span>
              </motion.div>
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 w-16 h-16 rounded-2xl bg-primary/90 flex items-center justify-center shadow-xl"
              >
                <span className="text-2xl">😊</span>
              </motion.div>
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
              Care designed for <span className="text-primary">dignity</span>
            </h2>
            <p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Every feature is crafted with seniors in mind — large buttons, clear text, 
              and a warm, familiar interface.
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
                className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 
                  className="text-xl font-bold text-foreground mb-2"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-muted-foreground"
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
              Simple as <span className="text-primary">1-2-3</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-6"
              >
                <div className="w-16 h-16 shrink-0 rounded-full bg-primary text-primary-foreground 
                               flex items-center justify-center text-2xl font-bold shadow-lg"
                     style={{ fontFamily: 'Playfair Display, serif' }}>
                  {step.number}
                </div>
                <div>
                  <h3 
                    className="text-xl font-bold text-foreground mb-1"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {step.title}
                  </h3>
                  <p 
                    className="text-muted-foreground"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 to-success/10">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-3xl md:text-4xl text-foreground mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Ready to bring peace of mind to your family?
            </h2>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/auth')}
              className="px-10 py-5 rounded-2xl bg-primary text-primary-foreground text-xl font-semibold
                         shadow-xl hover:shadow-2xl transition-all"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Start Free Today
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto text-center">
          <p 
            className="text-muted-foreground"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            © 2026 SmarAnandh. Made with ❤️ for Indian families.
          </p>
        </div>
      </footer>
    </div>
  );
} 
