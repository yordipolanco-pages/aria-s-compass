import { useState } from "react";
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
      <main className="flex-1 overflow-y-auto bg-pearl">
        <div className="p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 lg:mb-10">
            <div className="flex items-center gap-4 mb-2">
              <AriaOrb size="sm" />
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-foreground">
                {getGreeting()}, Consultor.
              </h1>
            </div>
            <p className="text-muted-foreground font-body text-base lg:text-lg">
              ¿En qué nos enfocamos hoy?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              {/* Prompt Selector */}
              <section>
                <h2 className="font-display text-lg lg:text-xl text-foreground mb-4">
                  Acciones Rápidas
                </h2>
                <PromptSelector
                  activePrompt={activePrompt}
                  onSelect={setActivePrompt}
                />
              </section>

              {/* Tools Grid */}
              <section>
                <h2 className="font-display text-lg lg:text-xl text-foreground mb-4">
                  Herramientas de Operación
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      title={tool.title}
                      description={tool.description}
                      icon={tool.icon}
                    />
                  ))}
                </div>
              </section>

              {/* Chat Input Preview */}
              <section>
                <div className="card-elevated-md p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <input
                      type="text"
                      placeholder="Escribe tu consulta o selecciona una acción rápida..."
                      className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 font-body text-sm sm:text-base"
                    />
                    <button className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors whitespace-nowrap">
                      Enviar
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Activity Feed */}
            <div className="lg:col-span-1">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
