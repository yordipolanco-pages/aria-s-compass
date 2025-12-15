import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Plus,
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  Building2,
  Settings,
  LogOut,
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
  logo: string;
  areas: ClientArea[];
  isExpanded: boolean;
}

const initialClients: Client[] = [
  {
    id: "1",
    name: "Coca-Cola",
    logo: "🥤",
    isExpanded: false,
    areas: [
      { id: "1-1", name: "Finanzas", icon: <BarChart3 className="w-4 h-4" /> },
      { id: "1-2", name: "RRHH", icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    id: "2",
    name: "Banco Santander",
    logo: "🏦",
    isExpanded: false,
    areas: [
      { id: "2-1", name: "Logística", icon: <Building2 className="w-4 h-4" /> },
    ],
  },
  {
    id: "3",
    name: "Grupo Bimbo",
    logo: "🍞",
    isExpanded: false,
    areas: [],
  },
];

interface SidebarProps {
  onNavigate?: (view: string, client?: string, area?: string) => void;
  activeArea?: string;
}

export function Sidebar({ onNavigate, activeArea }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleClient = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, isExpanded: !c.isExpanded } : c
      )
    );
  };

  const handleClientClick = (client: Client) => {
    navigate(`/client/${client.id}`);
  };

  const handleAreaClick = (clientId: string, areaId: string) => {
    navigate(`/client/${clientId}/area/${areaId}`);
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <motion.aside
      className={cn(
        "h-screen bg-sidebar flex flex-col transition-all duration-300 relative",
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

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Dashboard Link */}
        <div className="px-2 mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className={cn(
              "w-full sidebar-item",
              collapsed && "justify-center px-0",
              isActiveRoute("/dashboard") && "sidebar-item-active"
            )}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </button>
        </div>

        {/* Clients Section */}
        {!collapsed && (
          <p className="px-4 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-3">
            Clientes
          </p>
        )}

        <div className="space-y-1 px-2">
          {clients.map((client) => (
            <div key={client.id}>
              {/* Client Row */}
              <div className="flex items-center">
                <button
                  onClick={() => handleClientClick(client)}
                  className={cn(
                    "flex-1 sidebar-item",
                    collapsed && "justify-center px-0",
                    isActiveRoute(`/client/${client.id}`) && "sidebar-item-active"
                  )}
                >
                  {/* Client Logo */}
                  <div className="w-7 h-7 rounded-lg bg-sidebar-accent flex items-center justify-center text-sm flex-shrink-0">
                    {client.logo}
                  </div>
                  {!collapsed && (
                    <span className="truncate flex-1 text-left">{client.name}</span>
                  )}
                </button>
                
                {/* Expand/Collapse Button */}
                {!collapsed && client.areas.length > 0 && (
                  <button
                    onClick={(e) => toggleClient(client.id, e)}
                    className="p-1.5 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  >
                    {client.isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

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
                    <div className="ml-6 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                      {client.areas.map((area) => (
                        <button
                          key={area.id}
                          onClick={() => handleAreaClick(client.id, area.id)}
                          className={cn(
                            "w-full sidebar-item text-sm py-2",
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

          {/* Add Client Button */}
          {!collapsed && (
            <button className="w-full sidebar-item text-sidebar-foreground/50 hover:text-sidebar-foreground mt-2">
              <Plus className="w-4 h-4" />
              <span>Nuevo Cliente</span>
            </button>
          )}
        </div>

        {/* Knowledge Base */}
        <div className="px-2 mt-6">
          {!collapsed && (
            <p className="px-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-3">
              Recursos
            </p>
          )}
          <button
            onClick={() => navigate("/knowledge")}
            className={cn(
              "w-full sidebar-item",
              collapsed && "justify-center px-0",
              isActiveRoute("/knowledge") && "sidebar-item-active"
            )}
          >
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Base de Conocimiento</span>}
          </button>
        </div>
      </div>

      {/* Consultant Card with Menu */}
      <div className="p-3 border-t border-sidebar-border relative">
        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              className="absolute bottom-full left-3 right-3 mb-2 bg-sidebar-accent rounded-xl shadow-elegant-lg overflow-hidden"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-border/50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {!collapsed && <span className="text-sm">Ajustes</span>}
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-sidebar-border/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={cn(
            "w-full rounded-xl bg-sidebar-accent/50 p-3 hover:bg-sidebar-accent transition-colors",
            collapsed && "p-2"
          )}
        >
          {collapsed ? (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sidebar-primary text-sm font-medium">
              JD
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sidebar-primary font-medium">
                JD
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sidebar-foreground text-sm font-medium truncate">
                  Juan Díaz
                </p>
                <p className="text-sidebar-foreground/50 text-xs truncate">
                  Consultor Senior
                </p>
              </div>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
