import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { AriaOrb } from "@/components/AriaOrb";
import { EditClientModal } from "@/components/EditClientModal";
import { EditAreaModal } from "@/components/EditAreaModal";
import {
  Plus,
  Send,
  BarChart3,
  Users,
  Building2,
  Briefcase,
  FileText,
  Settings,
  Target,
  Pencil,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  chart: BarChart3,
  users: Users,
  building: Building2,
  briefcase: Briefcase,
  file: FileText,
  settings: Settings,
  target: Target,
};

// Mock client data
const initialClientsData: Record<string, { name: string; logo: string; areas: { id: string; name: string; icon: string }[] }> = {
  "1": {
    name: "Coca-Cola",
    logo: "🥤",
    areas: [
      { id: "1-1", name: "Finanzas", icon: "chart" },
      { id: "1-2", name: "RRHH", icon: "users" },
    ],
  },
  "2": {
    name: "Banco Santander",
    logo: "🏦",
    areas: [
      { id: "2-1", name: "Logística", icon: "building" },
    ],
  },
  "3": {
    name: "Grupo Bimbo",
    logo: "🍞",
    areas: [],
  },
};

export default function ClientChat() {
  const { clientId, areaId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [clientsData, setClientsData] = useState(initialClientsData);
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [editAreaOpen, setEditAreaOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<{ id: string; name: string; icon: string } | null>(null);
  const [isNewArea, setIsNewArea] = useState(false);
  const [areasSidebarCollapsed, setAreasSidebarCollapsed] = useState(false);

  const client = clientId ? clientsData[clientId] : null;
  const currentArea = areaId ? client?.areas.find(a => a.id === areaId) : null;

  if (!client) {
    return (
      <div className="flex min-h-screen w-full bg-pearl">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Cliente no encontrado</p>
        </main>
      </div>
    );
  }

  const handleSaveClient = (name: string, logo: string) => {
    if (clientId) {
      setClientsData((prev) => ({
        ...prev,
        [clientId]: { ...prev[clientId], name, logo },
      }));
    }
  };

  const handleSaveArea = (name: string, icon: string) => {
    if (clientId) {
      if (isNewArea) {
        const newAreaId = `${clientId}-${Date.now()}`;
        setClientsData((prev) => ({
          ...prev,
          [clientId]: {
            ...prev[clientId],
            areas: [...prev[clientId].areas, { id: newAreaId, name, icon }],
          },
        }));
      } else if (editingArea) {
        setClientsData((prev) => ({
          ...prev,
          [clientId]: {
            ...prev[clientId],
            areas: prev[clientId].areas.map((a) =>
              a.id === editingArea.id ? { ...a, name, icon } : a
            ),
          },
        }));
      }
    }
    setEditingArea(null);
    setIsNewArea(false);
  };

  const handleAddArea = () => {
    setIsNewArea(true);
    setEditingArea(null);
    setEditAreaOpen(true);
  };

  const handleEditArea = (area: { id: string; name: string; icon: string }) => {
    setIsNewArea(false);
    setEditingArea(area);
    setEditAreaOpen(true);
  };

  const getAreaIcon = (iconType: string) => {
    const IconComponent = iconMap[iconType] || Building2;
    return <IconComponent className="w-5 h-5" />;
  };

  // Determine chat context
  const chatTitle = currentArea ? `${currentArea.name} - ${client.name}` : `Chat General - ${client.name}`;
  const chatSubtitle = currentArea 
    ? `Chat específico del área de ${currentArea.name}` 
    : "Aquí puedes hacer consultas generales sobre este cliente.";

  return (
    <div className="flex min-h-screen w-full bg-pearl">
      <Sidebar activeArea={areaId} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl overflow-hidden">
                {client.logo.startsWith("data:") ? (
                  <img src={client.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  client.logo
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl text-foreground">
                    {client.name}
                  </h1>
                  {currentArea && (
                    <>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      <span className="font-display text-xl text-accent">
                        {currentArea.name}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {currentArea ? `Área: ${currentArea.name}` : "Chat General"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setEditClientOpen(true)}
              className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Empty State / Welcome */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <AriaOrb size="md" className="mx-auto mb-6" />
                <h2 className="font-display text-2xl text-foreground mb-2">
                  {chatTitle}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {chatSubtitle}
                  {!currentArea && " Aria+ tiene acceso a toda la información del cliente."}
                  {currentArea && ` Aria+ tiene acceso a los documentos de ${currentArea.name}.`}
                </p>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-border bg-background">
              <div className="card-elevated p-4">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={currentArea ? `Escribe tu consulta sobre ${currentArea.name}...` : "Escribe tu consulta..."}
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 font-body"
                  />
                  <button className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Areas Sidebar */}
          <aside 
            className={cn(
              "bg-background border-l border-border overflow-y-auto transition-all duration-300 ease-out relative",
              areasSidebarCollapsed ? "w-0" : "w-80"
            )}
          >
            {/* Collapse Toggle */}
            <button
              onClick={() => setAreasSidebarCollapsed(!areasSidebarCollapsed)}
              className="absolute -left-3 top-6 z-10 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {areasSidebarCollapsed ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {!areasSidebarCollapsed && (
                <motion.div
                  className="p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-lg text-foreground">
                      Áreas del Cliente
                    </h3>
                    <button
                      onClick={handleAddArea}
                      className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* General Chat Link */}
                  <div className="mb-4">
                    <button
                      onClick={() => navigate(`/client/${clientId}`)}
                      className={cn(
                        "w-full card-elevated p-4 flex items-center gap-3 transition-all",
                        !areaId && "border-2 border-primary/30 bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                        !areaId ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className={cn(
                        "font-medium",
                        !areaId ? "text-primary" : "text-foreground"
                      )}>
                        Chat General
                      </span>
                    </button>
                  </div>

                  {client.areas.length > 0 ? (
                    <div className="space-y-3">
                      {client.areas.map((area) => (
                        <div
                          key={area.id}
                          className={cn(
                            "w-full card-elevated p-4 flex items-center gap-3 transition-all group",
                            areaId === area.id && "border-2 border-accent/30 bg-accent/5"
                          )}
                        >
                          <button
                            onClick={() => navigate(`/client/${clientId}/area/${area.id}`)}
                            className="flex-1 flex items-center gap-3"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                              areaId === area.id 
                                ? "bg-accent/20 text-accent" 
                                : "bg-primary/10 text-primary group-hover:bg-primary/20"
                            )}>
                              {getAreaIcon(area.icon)}
                            </div>
                            <span className={cn(
                              "font-medium",
                              areaId === area.id ? "text-accent" : "text-foreground"
                            )}>
                              {area.name}
                            </span>
                          </button>
                          <button
                            onClick={() => handleEditArea(area)}
                            className="p-2 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm mb-4">
                        No hay áreas creadas aún
                      </p>
                      <button onClick={handleAddArea} className="chip chip-active">
                        <Plus className="w-4 h-4" />
                        Crear primera área
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>
      </main>

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={editClientOpen}
        onClose={() => setEditClientOpen(false)}
        clientName={client.name}
        clientLogo={client.logo}
        onSave={handleSaveClient}
      />

      {/* Edit/Create Area Modal */}
      <EditAreaModal
        isOpen={editAreaOpen}
        onClose={() => {
          setEditAreaOpen(false);
          setEditingArea(null);
          setIsNewArea(false);
        }}
        areaName={editingArea?.name || ""}
        areaIcon={editingArea?.icon || "chart"}
        onSave={handleSaveArea}
        isNew={isNewArea}
      />
    </div>
  );
}
