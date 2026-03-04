import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import heroImage1 from '@/assets/hero-carousel-1.jpg';
import heroImage2 from '@/assets/hero-carousel-2.jpg';
import heroImage3 from '@/assets/hero-carousel-3.jpg';

const slides = [
  {
    image: heroImage1,
    title: 'Peace of Mind',
    subtitle: 'Stay connected with your loved ones, wherever you are',
  },
  {
    image: heroImage2,
    title: 'Family Bonding',
    subtitle: 'One-tap video calls bring generations together',
  },
  {
    image: heroImage3,
    title: 'Cultural Harmony',
    subtitle: 'Respecting traditions while embracing modern care',
  }
];

interface HeroCarouselProps {
  fullWidth?: boolean;
}

export function HeroCarousel({ fullWidth = false }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const containerClass = fullWidth
    ? "relative w-full h-full"
    : "relative w-full h-full overflow-hidden rounded-3xl";

  return (
    <div 
      className={containerClass}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      {fullWidth && (
        <div className="absolute inset-0 flex items-end justify-center pb-16 md:pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-center px-6"
            >
              <h2 
                className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1.5 drop-shadow-lg"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {slides[currentSlide].title}
              </h2>
              <p 
                className="text-xs md:text-sm text-white/85 max-w-md mx-auto drop-shadow-md"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/15 backdrop-blur-sm
                   flex items-center justify-center text-white hover:bg-white/25 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/15 backdrop-blur-sm
                   flex items-center justify-center text-white hover:bg-white/25 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'w-7 bg-primary' 
                : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
