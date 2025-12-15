import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
  delay?: number;
}

export function ToolCard({
  title,
  description,
  icon: Icon,
  onClick,
  delay = 0,
}: ToolCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="tool-card text-left w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
    >
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <div>
        <h3 className="font-body font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </motion.button>
  );
}
