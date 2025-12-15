import { motion } from "framer-motion";

interface AriaOrbProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AriaOrb({ size = "lg", className = "" }: AriaOrbProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-48 h-48",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, hsl(217 91% 60% / 0.4) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main orb container */}
      <motion.div
        className="relative w-full h-full rounded-full overflow-hidden"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          boxShadow:
            "0 0 60px hsl(217 91% 60% / 0.3), inset 0 0 40px hsl(222 47% 11% / 0.2)",
        }}
      >
        {/* Fluid layers */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 30% 20%, hsl(217 91% 70% / 0.8) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, hsl(222 47% 20%) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, hsl(217 91% 55%) 0%, hsl(222 47% 15%) 100%)
            `,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Moving fluid blob 1 */}
        <motion.div
          className="absolute w-3/4 h-3/4 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(190 80% 70% / 0.6) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={{
            x: ["0%", "30%", "0%", "-30%", "0%"],
            y: ["0%", "-20%", "30%", "-10%", "0%"],
            scale: [1, 1.1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Moving fluid blob 2 */}
        <motion.div
          className="absolute w-2/3 h-2/3 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(220 20% 85% / 0.5) 0%, transparent 60%)",
            filter: "blur(15px)",
            top: "20%",
            left: "10%",
          }}
          animate={{
            x: ["0%", "-20%", "20%", "0%"],
            y: ["0%", "25%", "-15%", "0%"],
            opacity: [0.5, 0.8, 0.4, 0.5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Highlight reflection */}
        <motion.div
          className="absolute w-1/3 h-1/3 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(0 0% 100% / 0.4) 0%, transparent 70%)",
            top: "15%",
            left: "20%",
            filter: "blur(8px)",
          }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
}
