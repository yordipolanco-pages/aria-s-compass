import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  clientLogo: string;
  onSave: (name: string, logo: string) => void;
}

export function EditClientModal({
  isOpen,
  onClose,
  clientName,
  clientLogo,
  onSave,
}: EditClientModalProps) {
  const [name, setName] = useState(clientName);
  const [logo, setLogo] = useState(clientLogo);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojiOptions = ["🏢", "🏦", "🏭", "🛒", "💼", "🚀", "🌐", "📊", "🎯", "💡"];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogo(reader.result as string);
        setLogo("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(name, customLogo || logo);
    onClose();
  };

  const handleEmojiSelect = (emoji: string) => {
    setLogo(emoji);
    setCustomLogo(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-background rounded-2xl shadow-elegant-lg w-full max-w-md overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="font-display text-xl text-foreground">
                  Editar Cliente
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Logo Section */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Logo del Cliente
                  </label>

                  {/* Current Logo Preview */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl overflow-hidden">
                      {customLogo ? (
                        <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        logo
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">
                        Selecciona un emoji o sube una imagen
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-primary border border-primary/30 hover:bg-primary/10 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          Subir imagen
                        </button>
                        {customLogo && (
                          <button
                            onClick={() => {
                              setCustomLogo(null);
                              setLogo(clientLogo);
                            }}
                            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Emoji Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className={cn(
                          "w-12 h-12 rounded-lg text-2xl flex items-center justify-center transition-all",
                          logo === emoji && !customLogo
                            ? "bg-primary/20 ring-2 ring-primary"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
