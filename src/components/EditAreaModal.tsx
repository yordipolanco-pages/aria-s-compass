import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3, Users, Building2, Briefcase, FileText, Settings, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const iconOptions = [
  { id: "chart", icon: BarChart3, label: "Finanzas" },
  { id: "users", icon: Users, label: "RRHH" },
  { id: "building", icon: Building2, label: "Operaciones" },
  { id: "briefcase", icon: Briefcase, label: "Legal" },
  { id: "file", icon: FileText, label: "Documentos" },
  { id: "settings", icon: Settings, label: "TI" },
  { id: "target", icon: Target, label: "Estrategia" },
];

interface EditAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaName?: string;
  areaIcon?: string;
  onSave: (name: string, icon: string) => void;
  isNew?: boolean;
}

export function EditAreaModal({
  isOpen,
  onClose,
  areaName = "",
  areaIcon = "chart",
  onSave,
  isNew = false,
}: EditAreaModalProps) {
  const [name, setName] = useState(areaName);
  const [selectedIcon, setSelectedIcon] = useState(areaIcon);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), selectedIcon);
      onClose();
    }
  };

  const SelectedIconComponent = iconOptions.find((i) => i.id === selectedIcon)?.icon || BarChart3;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-background rounded-2xl shadow-elegant-lg w-full max-w-md overflow-hidden"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="font-display text-xl text-foreground">
                  {isNew ? "Nueva Área" : "Editar Área"}
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
                {/* Preview */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-muted">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <SelectedIconComponent className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-foreground text-lg">
                      {name || "Nombre del área"}
                    </span>
                  </div>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Icono del Área
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSelectedIcon(option.id)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all",
                            selectedIcon === option.id
                              ? "bg-primary/20 ring-2 ring-primary text-primary"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          )}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="text-xs">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre del Área
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Finanzas, RRHH, Logística..."
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
                  disabled={!name.trim()}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isNew ? "Crear Área" : "Guardar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
