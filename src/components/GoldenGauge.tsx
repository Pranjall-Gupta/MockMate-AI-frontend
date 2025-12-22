import { motion } from "framer-motion";

interface GaugeProps {
  score: number;
  label: string;
}

const GoldenGauge = ({ score, label }: GaugeProps) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20 flex items-center justify-center">
        {/* Background Track */}
        <svg className="absolute h-full w-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/5"
          />
          {/* Animated Gold Fill */}
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="#C9A227"
            strokeWidth="4"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(201, 162, 39, 0.5))" }}
          />
        </svg>
        <span className="text-gold-light text-sm font-bold font-sans">{score}%</span>
      </div>
      <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{label}</span>
    </div>
  );
};

export default GoldenGauge;