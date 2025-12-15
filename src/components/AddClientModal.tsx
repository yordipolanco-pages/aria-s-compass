import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: { name: string; logo: string }) => void;
}

const defaultEmojis = ["🏢", "🏦", "🏭", "🏪", "🏬", "🏛️", "🏗️", "🏠", "🌐", "💼", "📊", "🎯"];

export function AddClientModal({ isOpen, onClose, onSave }: AddClientModalProps) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("🏢");

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), logo });
      setName("");
      setLogo("🏢");
      onClose();
    }
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
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-card rounded-2xl shadow-elegant-lg w-full max-w-md mx-4 overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-title text-xl text-foreground">Nuevo Cliente</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Logo Selection */}
              <div className="space-y-3">
                <Label className="text-foreground">Logo del Cliente</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl">
                    {logo}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">Selecciona un emoji o sube una imagen</p>
                    <div className="flex flex-wrap gap-2">
                      {defaultEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setLogo(emoji)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                            logo === emoji
                              ? "bg-primary/20 ring-2 ring-primary"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="client-name" className="text-foreground">Nombre del Cliente</Label>
                <Input
                  id="client-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Coca-Cola, BBVA, Bimbo..."
                  className="bg-muted border-border"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!name.trim()}>
                Crear Cliente
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
