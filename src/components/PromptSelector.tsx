import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const prompts = [
  { id: "1", label: "Análisis de Riesgo" },
  { id: "2", label: "Resumir Reunión" },
  { id: "3", label: "Crear Minuta" },
  { id: "4", label: "Benchmark de Mercado" },
  { id: "5", label: "Due Diligence" },
  { id: "6", label: "Análisis FODA" },
];

interface PromptSelectorProps {
  activePrompt?: string;
  onSelect?: (promptId: string) => void;
}

export function PromptSelector({ activePrompt, onSelect }: PromptSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {prompts.map((prompt, index) => (
        <motion.button
          key={prompt.id}
          onClick={() => onSelect?.(prompt.id)}
          className={cn(
            "chip",
            activePrompt === prompt.id && "chip-active"
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {prompt.label}
        </motion.button>
      ))}
    </div>
  );
}
