import { useState } from "react";
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
  Download,
  Trash2
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { UploadDocumentModal } from "@/components/UploadDocumentModal";
import { CreateFolderModal } from "@/components/CreateFolderModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useData, Document } from "@/contexts/DataContext";
import { ConfirmationModal } from "@/components/ConfirmationModal";

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
  const { clients, firmFolders, addDocumentToFirm, addDocumentToClient, addFirmFolder, deleteFirmFolder } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"firm" | "clients">("firm");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  // Local expansion state
  const [expandedFirmFolders, setExpandedFirmFolders] = useState<Record<string, boolean>>({});
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});
  const [expandedClientFolders, setExpandedClientFolders] = useState<Record<string, boolean>>({});

  const toggleFirmFolder = (folderId: string) => {
    setExpandedFirmFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const toggleClient = (clientId: string) => {
    setExpandedClients(prev => ({ ...prev, [clientId]: !prev[clientId] }));
  };

  const toggleClientFolder = (folderId: string) => {
    setExpandedClientFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleCreateFolder = () => {
    setCreateFolderOpen(true);
  };

  const handleSaveFolder = (name: string) => {
    addFirmFolder(name);
    toast.success("Carpeta creada exitosamente");
  };

  // Build knowledge bases for the upload modal
  const knowledgeBases = [
    {
      id: "firm",
      name: "Metodologías Numericit",
      type: "firm" as const,
      folders: firmFolders.map((f) => ({ id: f.id, name: f.name })),
    },
    ...clients.map((client) => ({
      id: client.id,
      name: client.name,
      logo: client.logo,
      type: "client" as const,
      folders: client.folders.map((f) => ({ id: f.id, name: f.name })),
    })),
  ];

  const handleUpload = (file: File, kbId: string, folderId: string) => {
    const newDoc: Document = {
      id: `new-${Date.now()}`,
      name: file.name,
      type: (file.name.split(".").pop() as "pdf" | "xlsx" | "docx" | "pptx") || "pdf",
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      date: new Date().toISOString().split("T")[0],
      privacy: "private",
    };

    if (kbId === "firm") {
      addDocumentToFirm(folderId, newDoc);
      setExpandedFirmFolders(prev => ({ ...prev, [folderId]: true }));
    } else {
      addDocumentToClient(kbId, folderId, newDoc);
      setExpandedClients(prev => ({ ...prev, [kbId]: true }));
      setExpandedClientFolders(prev => ({ ...prev, [folderId]: true }));
    }

    toast.success("Documento subido exitosamente", {
      description: `${file.name} se agregó a la base de conocimiento.`,
    });
  };

  return (
    <>
      <main className="flex-1 flex flex-col h-[calc(100vh-2rem)] my-4 mr-4 ml-4 rounded-3xl bg-background shadow-xl border border-sidebar-border/20 overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl text-foreground">Base de Conocimiento</h1>
                <p className="text-muted-foreground text-sm">Gestiona documentos y recursos</p>
              </div>
            </div>
            <Button onClick={handleCreateFolder}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Carpeta
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

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          {activeTab === "firm" ? (
            /* Firm Knowledge Base */
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-foreground">Metodologías Numericit</h2>
                    <p className="text-sm text-muted-foreground">Biblioteca global de la firma</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleCreateFolder}>
                  <Plus className="w-4 h-4" />
                  Nueva Carpeta
                </Button>
              </div>

              {firmFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <div className="flex items-center w-full p-4 hover:bg-muted/50 transition-colors group">
                    <button
                      onClick={() => toggleFirmFolder(folder.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform",
                          expandedFirmFolders[folder.id] && "rotate-90"
                        )}
                      />
                      <Folder className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground flex-1">{folder.name}</span>
                      <span className="text-sm text-muted-foreground mr-4">{folder.documents.length} archivos</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderToDelete(folder.id);
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                      title="Eliminar carpeta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {expandedFirmFolders[folder.id] && (
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
                </div>
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
                    <h2 className="font-display text-xl text-foreground">Bases de Clientes</h2>
                    <p className="text-sm text-muted-foreground">Documentos por cliente y área</p>
                  </div>
                </div>
              </div>

              {clients.map((client) => (
                <div
                  key={client.id}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  {/* Client Header */}
                  <button
                    onClick={() => toggleClient(client.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        expandedClients[client.id] && "rotate-90"
                      )}
                    />
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                      {(client.logo.startsWith("data:") || client.logo.startsWith("http")) ? (
                        <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                      ) : (
                        client.logo
                      )}
                    </div>
                    <span className="font-medium text-foreground flex-1 text-left">{client.name}</span>
                    <span className="text-sm text-muted-foreground">{client.folders.length} áreas</span>
                  </button>

                  {/* Client Folders (Areas) */}
                  {expandedClients[client.id] && (
                    <div className="border-t border-border">
                      {client.folders.map((folder) => (
                        <div key={folder.id}>
                          <button
                            onClick={() => toggleClientFolder(folder.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-4" />
                            <ChevronRight
                              className={cn(
                                "w-4 h-4 text-muted-foreground transition-transform",
                                expandedClientFolders[folder.id] && "rotate-90"
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

                          {expandedClientFolders[folder.id] && (
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Document Modal */}
        <UploadDocumentModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          knowledgeBases={knowledgeBases}
          onUpload={handleUpload}
        />

        <CreateFolderModal
          isOpen={createFolderOpen}
          onClose={() => setCreateFolderOpen(false)}
          onSave={handleSaveFolder}
        />
        <ConfirmationModal
          isOpen={!!folderToDelete}
          onClose={() => setFolderToDelete(null)}
          onConfirm={() => {
            if (folderToDelete) {
              deleteFirmFolder(folderToDelete);
              toast.success("Carpeta eliminada exitosamente");
            }
          }}
          title="Eliminar Carpeta"
          description="¿Estás seguro que deseas eliminar esta carpeta? Esta acción no se puede deshacer y eliminará todos los documentos contenidos."
          confirmText="Eliminar"
          variant="destructive"
        />
      </main>
    </>
  );
}
