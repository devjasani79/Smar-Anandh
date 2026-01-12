import { motion } from "framer-motion";

interface HeroImageProps {
  imageUrl: string;
  alt?: string;
}

export function HeroImage({ imageUrl, alt = "Serene scene" }: HeroImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden mx-auto max-w-sm"
      style={{
        boxShadow: "0 12px 40px -12px hsl(30 50% 20% / 0.25)",
      }}
    >
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
      />
      {/* Warm gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
    </motion.div>
  );
}
