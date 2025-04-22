
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnalysisLoadingProps {
  onComplete: () => void;
}

export function AnalysisLoading({ onComplete }: AnalysisLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("Initializing analysis...");

  const messages = [
    "Initializing analysis...",
    "Calculating planetary positions...",
    "Mapping your DISC profile...",
    "Analyzing personality traits...",
    "Connecting cosmic and behavioral data...",
    "Generating personality insights...",
    "Finalizing your unique profile..."
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(progress + 1);

        // Change messages at specific points
        if (progress === 15) setCurrentMessage(messages[1]);
        if (progress === 35) setCurrentMessage(messages[2]);
        if (progress === 50) setCurrentMessage(messages[3]);
        if (progress === 65) setCurrentMessage(messages[4]);
        if (progress === 80) setCurrentMessage(messages[5]);
        if (progress === 95) setCurrentMessage(messages[6]);
      } else {
        onComplete();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [progress, onComplete]);

  const planets = [
    { name: "Sun", color: "#E67E22", size: 24, speed: 12 },
    { name: "Moon", color: "#BDC3C7", size: 18, speed: 8 },
    { name: "Mercury", color: "#95A5A6", size: 12, speed: 6 },
    { name: "Venus", color: "#F1C40F", size: 16, speed: 9 },
    { name: "Mars", color: "#E74C3C", size: 14, speed: 10 },
    { name: "Jupiter", color: "#D35400", size: 28, speed: 15 },
    { name: "Saturn", color: "#7F8C8D", size: 22, speed: 18 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[500px] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
    >
      <div className="star-field absolute inset-0 z-0"></div>

      <motion.div
        className="relative mb-12 z-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className="relative h-48 w-48">
          <div className="absolute inset-0 rounded-full border-2 border-brand-red border-opacity-20"></div>

          {planets?.map((planet, index) => (
            <motion.div
              key={planet.name}
              className="absolute rounded-full z-10"
              style={{
                width: planet.size,
                height: planet.size,
                backgroundColor: planet.color,
                boxShadow: `0 0 10px ${planet.color}`
              }}
              animate={{
                x: 24 * Math.cos(index * (Math.PI / 3.5) + progress / 10),
                y: 24 * Math.sin(index * (Math.PI / 3.5) + progress / 10),
              }}
              transition={{
                duration: planet.speed,
                repeat: Infinity,
                repeatType: "mirror"
              }}
            />
          ))}

          <motion.div
            className="absolute rounded-full bg-brand-red"
            style={{
              width: 32,
              height: 32,
              top: "50%",
              left: "50%",
              marginLeft: -16,
              marginTop: -16,
              boxShadow: "0 0 20px rgba(230, 57, 70, 0.7)"
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold mb-2 text-center z-10">
        Analyzing Your Cosmic and Behavioral Blueprint
      </h2>

      <p className="text-muted-foreground mb-8 text-center max-w-md z-10">
        {currentMessage}
      </p>

      <div className="w-full max-w-md h-2 bg-muted rounded-full overflow-hidden z-10">
        <motion.div
          className="h-full bg-brand-red"
          style={{ width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <p className="text-sm text-muted-foreground mt-2 z-10">
        {progress}% Complete
      </p>
    </motion.div>
  );
}
