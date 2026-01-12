import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { EntertainmentTile } from "@/components/EntertainmentTile";

export default function Santosh() {
  const navigate = useNavigate();

  const handleTileClick = (section: string) => {
    // In real app: navigate to specific entertainment section
    console.log("Opening:", section);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-safe-bottom">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 px-6 py-4"
      >
        <button
          onClick={() => navigate("/")}
          className="p-3 -ml-3 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>
        <h1 className="text-display text-foreground">😊 Khushi</h1>
      </motion.header>

      {/* Question */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-6"
      >
        <div className="card-warm text-center py-5">
          <p className="text-heading text-foreground">
            Aaj kya karna chahenge?
          </p>
          <p className="text-body text-muted-foreground mt-1">
            What would you like to do today?
          </p>
        </div>
      </motion.section>

      {/* Entertainment Tiles */}
      <section className="flex-1 px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          <EntertainmentTile
            icon="🎵"
            label="SUNO"
            sublabel="Listen"
            onClick={() => handleTileClick("suno")}
            delay={1}
          />
          <EntertainmentTile
            icon="👁️"
            label="DEKHO"
            sublabel="Watch"
            onClick={() => handleTileClick("dekho")}
            delay={2}
          />
          <EntertainmentTile
            icon="🖼️"
            label="YAADEIN"
            sublabel="Memories"
            onClick={() => handleTileClick("yaadein")}
            delay={3}
          />
          <EntertainmentTile
            icon="🧩"
            label="KHEL"
            sublabel="Play"
            onClick={() => handleTileClick("khel")}
            delay={4}
          />
        </div>

        {/* Micro-Moment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <div className="card-warm p-6">
            <p className="text-heading text-foreground text-center mb-4">
              🌸 Aaj Ka Sujhav
            </p>
            <p className="text-body text-muted-foreground text-center mb-4">
              Today's Suggestion
            </p>
            <div className="bg-primary/10 rounded-2xl p-5 text-center">
              <p className="text-body-lg text-foreground mb-2">
                "Chidiyaon ke liye paani rakhe?"
              </p>
              <p className="text-label text-muted-foreground">
                Shall we put water for birds?
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
