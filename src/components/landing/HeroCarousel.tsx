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
    : "relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden rounded-3xl";

  return (
    <div 
      className={containerClass}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlays for full-width mode */}
          {fullWidth && (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            </>
          )}
          {/* Gradient Overlays for contained mode */}
          {!fullWidth && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay - Only for fullWidth mode */}
      {fullWidth && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center px-6"
            >
              <h2 
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {slides[currentSlide].title}
              </h2>
              <p 
                className="text-sm md:text-base text-white/90 max-w-md mx-auto drop-shadow-md"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Content Overlay - For contained mode */}
      {!fullWidth && (
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-2xl"
              >
                <h2 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {slides[currentSlide].title}
                </h2>
                <p 
                  className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {slides[currentSlide].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm
                   flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm
                   flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'w-6 md:w-8 bg-primary' 
                : 'w-1.5 md:w-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
