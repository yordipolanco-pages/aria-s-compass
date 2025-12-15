import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  FolderClosed,
  PanelLeftClose,
  PanelLeft,
  Plus,
  BarChart3,
  Users,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientArea {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface Client {
  id: string;
  name: string;
  areas: ClientArea[];
  isExpanded: boolean;
}

const initialClients: Client[] = [
  {
    id: "1",
    name: "Coca-Cola",
    isExpanded: true,
    areas: [
      { id: "1-1", name: "Chat General", icon: <MessageSquare className="w-4 h-4" /> },
      { id: "1-2", name: "Finanzas", icon: <BarChart3 className="w-4 h-4" /> },
      { id: "1-3", name: "RRHH", icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    id: "2",
    name: "Banco Santander",
    isExpanded: false,
    areas: [
      { id: "2-1", name: "Chat General", icon: <MessageSquare className="w-4 h-4" /> },
      { id: "2-2", name: "Logística", icon: <Building2 className="w-4 h-4" /> },
    ],
  },
  {
    id: "3",
    name: "Grupo Bimbo",
    isExpanded: false,
    areas: [
      { id: "3-1", name: "Chat General", icon: <MessageSquare className="w-4 h-4" /> },
    ],
  },
];

interface SidebarProps {
  onNavigate?: (view: string, client?: string, area?: string) => void;
  activeArea?: string;
}

export function Sidebar({ onNavigate, activeArea }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [clients, setClients] = useState<Client[]>(initialClients);

  const toggleClient = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, isExpanded: !c.isExpanded } : c
      )
    );
  };

  return (
    <motion.aside
      className={cn(
        "h-screen bg-sidebar flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <motion.span
            className="text-sidebar-foreground font-body text-lg tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            n<span className="text-sidebar-primary">+</span>
          </motion.span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Clients Section */}
      <div className="flex-1 overflow-y-auto py-4">
        {!collapsed && (
          <p className="px-4 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-3">
            Clientes
          </p>
        )}

        <div className="space-y-1 px-2">
          {clients.map((client) => (
            <div key={client.id}>
              {/* Client Row */}
              <button
                onClick={() => toggleClient(client.id)}
                className={cn(
                  "w-full sidebar-item",
                  collapsed && "justify-center px-0"
                )}
              >
                {client.isExpanded ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                ) : collapsed ? (
                  <FolderClosed className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
                {!collapsed && (
                  <span className="truncate">{client.name}</span>
                )}
              </button>

              {/* Areas */}
              <AnimatePresence>
                {client.isExpanded && !collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 mt-1 space-y-1">
                      {client.areas.map((area) => (
                        <button
                          key={area.id}
                          onClick={() =>
                            onNavigate?.("chat", client.name, area.name)
                          }
                          className={cn(
                            "w-full sidebar-item text-sm",
                            activeArea === area.id && "sidebar-item-active"
                          )}
                        >
                          {area.icon}
                          <span className="truncate">{area.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* New Client Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          className={cn(
            "w-full flex items-center gap-2 px-4 py-2.5 rounded-lg",
            "text-sidebar-primary text-sm font-medium",
            "border border-sidebar-primary/30 hover:bg-sidebar-primary/10",
            "transition-all duration-200",
            collapsed && "px-0 justify-center"
          )}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span>Nuevo Cliente</span>}
        </button>
      </div>
    </motion.aside>
  );
}
