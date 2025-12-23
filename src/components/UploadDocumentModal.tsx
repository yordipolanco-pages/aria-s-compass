import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, ChevronDown, Check, FolderOpen, Building2, BookOpen, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Folder {
  id: string;
  name: string;
}

interface KnowledgeBase {
  id: string;
  name: string;
  logo?: string;
  type: "firm" | "client";
  folders: Folder[];
}

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeBases: KnowledgeBase[];
  onUpload: (file: File, kbId: string, folderId: string) => void;
  initialClientId?: string;
  initialFolderId?: string;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  knowledgeBases,
  onUpload,
  initialClientId,
  initialFolderId,
}: UploadDocumentModalProps) {
  const [step, setStep] = useState<"type-selection" | "upload-form">("type-selection");
  const [uploadType, setUploadType] = useState<"firm" | "client">("firm");
  const [selectedKB, setSelectedKB] = useState<string>("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [kbDropdownOpen, setKbDropdownOpen] = useState(false);
  const [folderDropdownOpen, setFolderDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Filter clients for the client selection dropdown
  const clientKBs = knowledgeBases.filter(kb => kb.type === "client");

  useEffect(() => {
    if (isOpen && initialClientId) {
      if (initialClientId === 'firm') {
        handleTypeSelect('firm');
      } else {
        setUploadType('client');
        setSelectedKB(initialClientId);
        setStep("upload-form");
      }

      if (initialFolderId) {
        setSelectedFolder(initialFolderId);
      }
    }
  }, [isOpen, initialClientId, initialFolderId]);

  const selectedKBData = knowledgeBases.find((kb) => kb.id === selectedKB);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile && selectedKB && selectedFolder) {
      onUpload(selectedFile, selectedKB, selectedFolder);
      handleClose();
    }
  };

  const handleTypeSelect = (type: "firm" | "client") => {
    setUploadType(type);
    if (type === "firm") {
      // Automatically select the firm KB
      const firmKB = knowledgeBases.find(kb => kb.type === "firm");
      if (firmKB) setSelectedKB(firmKB.id);
    } else {
      setSelectedKB(""); // Reset for client selection
    }
    setStep("upload-form");
  };

  const handleClose = () => {
    setStep("type-selection");
    setSelectedKB("");
    setSelectedFolder("");
    setSelectedFile(null);
    setKbDropdownOpen(false);
    setFolderDropdownOpen(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-card rounded-2xl shadow-elegant-lg p-8 w-full max-w-lg mx-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6 flex items-start gap-4">
              {step === "upload-form" && (
                <button
                  onClick={() => setStep("type-selection")}
                  className="mt-1 p-1 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h2 className="font-display text-2xl text-foreground mb-2">
                  Subir Documento
                </h2>
                <p className="text-muted-foreground text-sm">
                  {step === "type-selection"
                    ? "Elige el tipo de documento a subir"
                    : "Selecciona los detalles y el archivo"}
                </p>
              </div>
            </div>

            {step === "type-selection" ? (
              <div className="grid grid-cols-2 gap-4 mb-2">
                <button
                  onClick={() => handleTypeSelect("firm")}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-display font-medium text-foreground text-lg mb-1">Firma</span>
                  <span className="text-xs text-muted-foreground text-center">Documentos internos y metodologías</span>
                </button>

                <button
                  onClick={() => handleTypeSelect("client")}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-accent/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6 text-accent" />
                  </div>
                  <span className="font-display font-medium text-foreground text-lg mb-1">Cliente</span>
                  <span className="text-xs text-muted-foreground text-center">Documentos específicos por cliente</span>
                </button>
              </div>
            ) : (
              <>
                {/* File Drop Zone */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-colors",
                    isDragging ? "border-accent bg-accent/5" : "border-border",
                    selectedFile && "border-accent/50 bg-accent/5"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-accent" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-foreground font-medium mb-1">
                        Arrastra un archivo aquí
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        o haz clic para seleccionar
                      </p>
                      <label className="cursor-pointer">
                        <span className="chip">Seleccionar archivo</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileSelect}
                          accept=".pdf,.xlsx,.docx,.pptx,.txt"
                        />
                      </label>
                    </>
                  )}
                </div>

                {/* Selectors */}
                <div className="space-y-4 mb-6">
                  {/* Client Selector - Only show if type is client */}
                  {uploadType === "client" && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Cliente
                      </label>
                      <button
                        onClick={() => {
                          setKbDropdownOpen(!kbDropdownOpen);
                          setFolderDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <span className={cn(
                          selectedKB ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {selectedKBData ? (
                            <span className="flex items-center gap-2">
                              {selectedKBData.logo && (selectedKBData.logo.startsWith("http") || selectedKBData.logo.startsWith("data:") ? (
                                <img src={selectedKBData.logo} alt="" className="w-5 h-5 rounded-full object-cover" />
                              ) : (
                                <span>{selectedKBData.logo}</span>
                              ))}
                              {selectedKBData.name}
                            </span>
                          ) : (
                            "Selecciona un cliente"
                          )}
                        </span>
                        <ChevronDown className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform",
                          kbDropdownOpen && "rotate-180"
                        )} />
                      </button>

                      <AnimatePresence>
                        {kbDropdownOpen && (
                          <motion.div
                            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated overflow-hidden z-10 max-h-60 overflow-y-auto"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {clientKBs.map((kb) => (
                              <button
                                key={kb.id}
                                onClick={() => {
                                  setSelectedKB(kb.id);
                                  setSelectedFolder("");
                                  setKbDropdownOpen(false);
                                }}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors",
                                  selectedKB === kb.id && "bg-accent/10"
                                )}
                              >
                                {kb.logo && (kb.logo.startsWith("http") || kb.logo.startsWith("data:") ? (
                                  <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                                    <img src={kb.logo} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <span className="text-lg">{kb.logo}</span>
                                ))}
                                <span className="flex-1 text-left text-foreground">
                                  {kb.name}
                                </span>
                                {selectedKB === kb.id && (
                                  <Check className="w-4 h-4 text-accent" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Folder Selector */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {uploadType === "firm" ? "Carpeta" : "Área"}
                    </label>
                    <button
                      onClick={() => {
                        if (selectedKB) {
                          setFolderDropdownOpen(!folderDropdownOpen);
                          setKbDropdownOpen(false);
                        }
                      }}
                      disabled={!selectedKB}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border transition-colors",
                        selectedKB
                          ? "bg-muted/50 hover:bg-muted"
                          : "bg-muted/30 cursor-not-allowed opacity-50"
                      )}
                    >
                      <span className={cn(
                        selectedFolder ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {selectedKBData?.folders.find((f) => f.id === selectedFolder)?.name ||
                          (uploadType === "firm" ? "Selecciona una carpeta" : "Selecciona un área")}
                      </span>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        folderDropdownOpen && "rotate-180"
                      )} />
                    </button>

                    <AnimatePresence>
                      {folderDropdownOpen && selectedKBData && (
                        <motion.div
                          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated overflow-hidden z-10 max-h-60 overflow-y-auto"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {selectedKBData.folders.map((folder) => (
                            <button
                              key={folder.id}
                              onClick={() => {
                                setSelectedFolder(folder.id);
                                setFolderDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors",
                                selectedFolder === folder.id && "bg-accent/10"
                              )}
                            >
                              <FolderOpen className="w-4 h-4 text-accent" />
                              <span className="flex-1 text-left text-foreground">
                                {folder.name}
                              </span>
                              {selectedFolder === folder.id && (
                                <Check className="w-4 h-4 text-accent" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-full border border-border text-foreground font-medium hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || !selectedKB || !selectedFolder}
                    className={cn(
                      "px-6 py-2.5 rounded-full font-medium transition-colors",
                      selectedFile && selectedKB && selectedFolder
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    Subir Documento
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
