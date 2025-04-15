
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center max-w-3xl mx-auto text-center px-4 py-12"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-brand-red opacity-10 rounded-full blur-xl"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="relative h-32 w-32 flex items-center justify-center"
        >
          <div className="absolute inset-0 border-2 border-dashed border-brand-red rounded-full"></div>
          <motion.div
            className="absolute h-4 w-4 bg-brand-red rounded-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ top: 0, left: "50%" }}
          />
        </motion.div>
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold mb-6">
        Discover Your
        <span className="text-brand-red"> Cosmic Blueprint</span>
      </h1>

      <p className="text-lg mb-8 text-muted-foreground max-w-xl">
        Uncover the unique intersection of your personality traits and cosmic influences.
        Our AstroDISC assessment combines behavioral science with Vedic astrology for
        personalized insights into your natural strengths and potential.
      </p>

      <ul className="mb-8 grid gap-2 text-left max-w-md mx-auto">
        {[
          "Personalized DISC personality profile",
          "Vedic astrological insights based on your birth details",
          "Career compatibility and work style assessment",
          "Downloadable PDF report to share or reference",
        ].map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="flex items-start gap-2"
          >
            <span className="text-brand-red font-bold">✦</span>
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>

      <Button
        onClick={onGetStarted}
        size="lg"
        className="bg-brand-red hover:bg-opacity-90 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full"
      >
        Get Started
      </Button>
    </motion.div>
  );
}
