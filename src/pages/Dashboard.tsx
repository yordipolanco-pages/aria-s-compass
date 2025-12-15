import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { PromptSelector } from "@/components/PromptSelector";
import { ToolCard } from "@/components/ToolCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AriaOrb } from "@/components/AriaOrb";
import {
  GitCompare,
  FileCheck,
  FileText,
  Languages,
} from "lucide-react";

const tools = [
  {
    id: "1",
    title: "Gap Analysis",
    description: "Identifica brechas estratégicas",
    icon: GitCompare,
  },
  {
    id: "2",
    title: "Auditoría Documental",
    description: "Revisa y valida documentos",
    icon: FileCheck,
  },
  {
    id: "3",
    title: "Generador de SOW",
    description: "Crea alcances de trabajo",
    icon: FileText,
  },
  {
    id: "4",
    title: "Traductor Corporativo",
    description: "Traducciones profesionales",
    icon: Languages,
  },
];

export default function Dashboard() {
  const [activePrompt, setActivePrompt] = useState<string>();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="flex min-h-screen w-full bg-pearl">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-2">
              <AriaOrb size="sm" />
              <h1 className="font-display text-3xl lg:text-4xl text-foreground">
                {getGreeting()}, Consultor.
              </h1>
            </div>
            <p className="text-muted-foreground font-body text-lg">
              ¿En qué nos enfocamos hoy?
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Prompt Selector */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="font-display text-xl text-foreground mb-4">
                  Acciones Rápidas
                </h2>
                <PromptSelector
                  activePrompt={activePrompt}
                  onSelect={setActivePrompt}
                />
              </motion.section>

              {/* Tools Grid */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="font-display text-xl text-foreground mb-4">
                  Herramientas de Operación
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tools.map((tool, index) => (
                    <ToolCard
                      key={tool.id}
                      title={tool.title}
                      description={tool.description}
                      icon={tool.icon}
                      delay={0.3 + index * 0.1}
                    />
                  ))}
                </div>
              </motion.section>

              {/* Chat Input Preview */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="card-elevated-md p-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Escribe tu consulta o selecciona una acción rápida..."
                      className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 font-body"
                    />
                    <button className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                      Enviar
                    </button>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Right Column - Activity Feed */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ActivityFeed />
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
