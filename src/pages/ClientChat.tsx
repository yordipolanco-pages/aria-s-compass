import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { AriaOrb } from "@/components/AriaOrb";
import { EditClientModal } from "@/components/EditClientModal";
import {
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
} from "lucide-react";

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
  const [message, setMessage] = useState("");
  const [clientsData, setClientsData] = useState(initialClientsData);
  const [editClientOpen, setEditClientOpen] = useState(false);

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
        <header className="px-6 py-4">
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
            <div className="p-6">
              <div className="card-elevated p-4">
                <div className="flex items-center gap-4">
                  <textarea
                    rows={1}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        // Handle send
                      }
                    }}
                    placeholder={currentArea ? `Escribe tu consulta sobre ${currentArea.name}...` : "Escribe tu consulta..."}
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 font-body resize-none max-h-[150px]"
                  />
                  <button className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
}
