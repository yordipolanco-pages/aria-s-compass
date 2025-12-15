import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Building2, 
  Folder, 
  FileText, 
  Upload, 
  Search, 
  ChevronRight,
  Lock,
  Shield,
  Plus,
  MoreVertical,
  Trash2,
  Download
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  type: "pdf" | "xlsx" | "docx" | "pptx";
  size: string;
  date: string;
  privacy: "public" | "private" | "confidential";
}

interface Folder {
  id: string;
  name: string;
  documents: Document[];
  isExpanded: boolean;
}

interface ClientKB {
  id: string;
  name: string;
  logo: string;
  folders: Folder[];
  isExpanded: boolean;
}

// Mock data for firm knowledge base
const firmFolders: Folder[] = [
  {
    id: "f1",
    name: "Frameworks de Estrategia",
    isExpanded: false,
    documents: [
      { id: "d1", name: "Porter's Five Forces Template.pptx", type: "pptx", size: "2.4 MB", date: "2024-01-15", privacy: "public" },
      { id: "d2", name: "SWOT Analysis Framework.xlsx", type: "xlsx", size: "1.1 MB", date: "2024-02-20", privacy: "public" },
    ],
  },
  {
    id: "f2",
    name: "Plantillas Oficiales",
    isExpanded: false,
    documents: [
      { id: "d3", name: "Modelo Financiero Base.xlsx", type: "xlsx", size: "4.2 MB", date: "2024-03-10", privacy: "public" },
      { id: "d4", name: "Presentación Ejecutiva.pptx", type: "pptx", size: "8.5 MB", date: "2024-03-15", privacy: "public" },
    ],
  },
  {
    id: "f3",
    name: "Casos de Éxito",
    isExpanded: false,
    documents: [
      { id: "d5", name: "Caso Transformación Digital.pdf", type: "pdf", size: "3.8 MB", date: "2024-01-28", privacy: "private" },
    ],
  },
];

// Mock data for client knowledge bases
const clientKBs: ClientKB[] = [
  {
    id: "1",
    name: "Coca-Cola",
    logo: "🥤",
    isExpanded: false,
    folders: [
      {
        id: "c1-f1",
        name: "General",
        isExpanded: false,
        documents: [
          { id: "c1-d1", name: "Contrato Master 2024.pdf", type: "pdf", size: "1.2 MB", date: "2024-01-10", privacy: "confidential" },
        ],
      },
      {
        id: "c1-f2",
        name: "Finanzas",
        isExpanded: false,
        documents: [
          { id: "c1-d2", name: "Estados Financieros Q3.xlsx", type: "xlsx", size: "2.8 MB", date: "2024-10-05", privacy: "confidential" },
          { id: "c1-d3", name: "Proyecciones 2025.xlsx", type: "xlsx", size: "1.5 MB", date: "2024-11-20", privacy: "private" },
        ],
      },
      {
        id: "c1-f3",
        name: "RRHH",
        isExpanded: false,
        documents: [
          { id: "c1-d4", name: "Entrevistas Ejecutivos.pdf", type: "pdf", size: "890 KB", date: "2024-09-15", privacy: "confidential" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Banco Santander",
    logo: "🏦",
    isExpanded: false,
    folders: [
      {
        id: "c2-f1",
        name: "General",
        isExpanded: false,
        documents: [
          { id: "c2-d1", name: "Propuesta Comercial.pdf", type: "pdf", size: "2.1 MB", date: "2024-08-22", privacy: "private" },
        ],
      },
      {
        id: "c2-f2",
        name: "Logística",
        isExpanded: false,
        documents: [
          { id: "c2-d2", name: "Análisis de Procesos.docx", type: "docx", size: "1.8 MB", date: "2024-11-01", privacy: "private" },
        ],
      },
    ],
  },
];

const getFileIcon = (type: string) => {
  const colors: Record<string, string> = {
    pdf: "text-red-500",
    xlsx: "text-green-600",
    docx: "text-blue-600",
    pptx: "text-orange-500",
  };
  return colors[type] || "text-muted-foreground";
};

const getPrivacyBadge = (privacy: string) => {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    public: { bg: "bg-green-500/10", text: "text-green-600", icon: null },
    private: { bg: "bg-amber-500/10", text: "text-amber-600", icon: <Lock className="w-3 h-3" /> },
    confidential: { bg: "bg-red-500/10", text: "text-red-500", icon: <Shield className="w-3 h-3" /> },
  };
  const style = styles[privacy];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", style.bg, style.text)}>
      {style.icon}
      {privacy === "confidential" ? "Confidencial" : privacy === "private" ? "Privado" : "Público"}
    </span>
  );
};

export default function KnowledgeBase() {
  const [firmData, setFirmData] = useState(firmFolders);
  const [clientData, setClientData] = useState(clientKBs);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"firm" | "clients">("firm");

  const toggleFirmFolder = (folderId: string) => {
    setFirmData((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f))
    );
  };

  const toggleClient = (clientId: string) => {
    setClientData((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, isExpanded: !c.isExpanded } : c))
    );
  };

  const toggleClientFolder = (clientId: string, folderId: string) => {
    setClientData((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              folders: c.folders.map((f) =>
                f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f
              ),
            }
          : c
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-background w-full">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-title text-3xl text-foreground mb-1">Base de Conocimiento</h1>
                <p className="text-muted-foreground">Gestiona documentos de la firma y clientes</p>
              </div>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                Subir Documento
              </Button>
            </div>

            {/* Search & Tabs */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted border-border"
                />
              </div>
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("firm")}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    activeTab === "firm"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BookOpen className="w-4 h-4 inline-block mr-2" />
                  Firma
                </button>
                <button
                  onClick={() => setActiveTab("clients")}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    activeTab === "clients"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Building2 className="w-4 h-4 inline-block mr-2" />
                  Clientes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === "firm" ? (
            /* Firm Knowledge Base */
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-title text-xl text-foreground">Metodologías Numericit</h2>
                    <p className="text-sm text-muted-foreground">Biblioteca global de la firma</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Carpeta
                </Button>
              </div>

              {firmData.map((folder) => (
                <motion.div
                  key={folder.id}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    onClick={() => toggleFirmFolder(folder.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        folder.isExpanded && "rotate-90"
                      )}
                    />
                    <Folder className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground flex-1 text-left">{folder.name}</span>
                    <span className="text-sm text-muted-foreground">{folder.documents.length} archivos</span>
                  </button>

                  {folder.isExpanded && (
                    <div className="border-t border-border bg-muted/30">
                      {folder.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
                        >
                          <div className="w-8" />
                          <FileText className={cn("w-4 h-4", getFileIcon(doc.type))} />
                          <span className="flex-1 text-sm text-foreground">{doc.name}</span>
                          {getPrivacyBadge(doc.privacy)}
                          <span className="text-xs text-muted-foreground">{doc.size}</span>
                          <button className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all">
                            <Download className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            /* Client Knowledge Bases */
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-title text-xl text-foreground">Bases de Clientes</h2>
                    <p className="text-sm text-muted-foreground">Documentos por cliente y área</p>
                  </div>
                </div>
              </div>

              {clientData.map((client) => (
                <motion.div
                  key={client.id}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Client Header */}
                  <button
                    onClick={() => toggleClient(client.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        client.isExpanded && "rotate-90"
                      )}
                    />
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg">
                      {client.logo}
                    </div>
                    <span className="font-medium text-foreground flex-1 text-left">{client.name}</span>
                    <span className="text-sm text-muted-foreground">{client.folders.length} áreas</span>
                  </button>

                  {/* Client Folders (Areas) */}
                  {client.isExpanded && (
                    <div className="border-t border-border">
                      {client.folders.map((folder) => (
                        <div key={folder.id}>
                          <button
                            onClick={() => toggleClientFolder(client.id, folder.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-4" />
                            <ChevronRight
                              className={cn(
                                "w-4 h-4 text-muted-foreground transition-transform",
                                folder.isExpanded && "rotate-90"
                              )}
                            />
                            <Folder className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium text-foreground flex-1 text-left">
                              {folder.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {folder.documents.length} archivos
                            </span>
                          </button>

                          {folder.isExpanded && (
                            <div className="bg-muted/20">
                              {folder.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors group"
                                >
                                  <div className="w-12" />
                                  <FileText className={cn("w-4 h-4", getFileIcon(doc.type))} />
                                  <span className="flex-1 text-sm text-foreground">{doc.name}</span>
                                  {getPrivacyBadge(doc.privacy)}
                                  <span className="text-xs text-muted-foreground">{doc.size}</span>
                                  <button className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all">
                                    <Download className="w-4 h-4 text-muted-foreground" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
