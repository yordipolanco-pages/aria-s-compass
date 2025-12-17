import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  Building2,
  Settings,
  LogOut,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddClientModal } from "./AddClientModal";
import { EditAreaModal } from "./EditAreaModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [editAreaOpen, setEditAreaOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<{ clientId: string; area: ClientArea } | null>(null);
  const [isNewArea, setIsNewArea] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [hoveredClientId, setHoveredClientId] = useState<string | null>(null);
  const [hoveredAreaId, setHoveredAreaId] = useState<string | null>(null);
  const [deleteClientConfirmId, setDeleteClientConfirmId] = useState<string | null>(null);
  const [deleteAreaConfirmId, setDeleteAreaConfirmId] = useState<string | null>(null);
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

  const handleDeleteClient = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteClientConfirmId === clientId) {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      setDeleteClientConfirmId(null);
    } else {
      setDeleteClientConfirmId(clientId);
      setTimeout(() => setDeleteClientConfirmId(null), 2000);
    }
  };

  const handleAddClient = (newClient: { name: string; logo: string }) => {
    const client: Client = {
      id: String(Date.now()),
      name: newClient.name,
      logo: newClient.logo,
      areas: [],
      isExpanded: false,
    };
    setClients((prev) => [...prev, client]);
  };

  const handleAddAreaStart = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClientId(clientId);
    setIsNewArea(true);
    setEditingArea(null);
    setEditAreaOpen(true);
  };

  const handleEditAreaStart = (clientId: string, area: ClientArea, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClientId(clientId);
    setIsNewArea(false);
    setEditingArea({ clientId, area });
    setEditAreaOpen(true);
  };

  const handleDeleteArea = (clientId: string, areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteAreaConfirmId === areaId) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? { ...c, areas: c.areas.filter((a) => a.id !== areaId) }
            : c
        )
      );
      setDeleteAreaConfirmId(null);
    } else {
      setDeleteAreaConfirmId(areaId);
      setTimeout(() => setDeleteAreaConfirmId(null), 2000);
    }
  };

  const handleSaveArea = (name: string, icon: string) => {
    if (!selectedClientId) return;

    // Helper to get React Node icon from string identifier
    // In a real app, this mapping might be centralized
    const iconMap: Record<string, any> = {
      chart: BarChart3,
      users: Users,
      building: Building2,
      briefcase: BookOpen, // Using placeholder
      file: BookOpen, // Using placeholder
    };
    const IconComponent = iconMap[icon] || Building2;
    const iconNode = <IconComponent className="w-4 h-4" />;

    if (isNewArea) {
      const newArea: ClientArea = {
        id: `${selectedClientId}-${Date.now()}`,
        name,
        icon: iconNode,
      };
      setClients(prev => prev.map(c =>
        c.id === selectedClientId ? { ...c, areas: [...c.areas, newArea] } : c
      ));
    } else if (editingArea) {
      setClients(prev => prev.map(c =>
        c.id === editingArea.clientId ? {
          ...c,
          areas: c.areas.map(a => a.id === editingArea.area.id ? { ...a, name, icon: iconNode } : a)
        } : c
      ));
    }

    setEditAreaOpen(false);
    setEditingArea(null);
    setIsNewArea(false);
    setSelectedClientId(null);
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <>
      <aside
        className={cn(
          "h-screen bg-sidebar flex flex-col relative overflow-hidden transition-all duration-300 ease-out group/sidebar",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border min-h-[65px]">
          {collapsed ? (
            <div className="w-full flex justify-center relative group/header">
              {/* Logo (visible by default, hidden on hover) */}
              <span className="text-sidebar-foreground font-body text-lg tracking-wider whitespace-nowrap transition-opacity duration-200 group-hover/header:opacity-0">
                n<span className="text-sidebar-primary">+</span>
              </span>

              {/* Toggle Button (hidden by default, visible on hover) */}
              <button
                onClick={() => setCollapsed(false)}
                className="absolute inset-0 flex items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground transition-all duration-200 opacity-0 group-hover/header:opacity-100 scale-90 group-hover/header:scale-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <span className="text-sidebar-foreground font-body text-lg tracking-wider whitespace-nowrap">
              n<span className="text-sidebar-primary">+</span>
            </span>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <ChevronRight className="rotate-180 w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">

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
                <div
                  className="flex items-center group/client"
                  onMouseEnter={() => setHoveredClientId(client.id)}
                  onMouseLeave={() => {
                    setHoveredClientId(null);
                    if (deleteClientConfirmId === client.id) {
                      setDeleteClientConfirmId(null);
                    }
                  }}
                >
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

                  {/* Client Actions (Dropdown Menu) */}
                  {!collapsed && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors mr-1 opacity-0 group-hover/client:opacity-100 data-[state=open]:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#1E1E2E] border-sidebar-border text-sidebar-foreground">
                        <DropdownMenuItem
                          onClick={(e) => handleAddAreaStart(client.id, e)}
                          className="focus:bg-sidebar-accent cursor-pointer gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Agregar área</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-sidebar-border" />
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClient(client.id, e)}
                          className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar cliente</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Expand/Collapse Button */}
                  {!collapsed && (
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
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="ml-6 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                        {client.areas.map((area) => (
                          <div
                            key={area.id}
                            className="flex items-center group/area"
                            onMouseEnter={() => setHoveredAreaId(area.id)}
                            onMouseLeave={() => setHoveredAreaId(null)}
                          >
                            <button
                              onClick={() => handleAreaClick(client.id, area.id)}
                              className={cn(
                                "flex-1 sidebar-item text-sm py-2",
                                activeArea === area.id && "sidebar-item-active"
                              )}
                            >
                              {area.icon}
                              <span className="truncate">{area.name}</span>
                            </button>

                            {/* Area Actions */}
                            {hoveredAreaId === area.id && (
                              <div className="flex items-center pr-1">
                                <button
                                  onClick={(e) => handleEditAreaStart(client.id, area, e)}
                                  className="p-1 rounded text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                >
                                  <Settings className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteArea(client.id, area.id, e)}
                                  className={cn(
                                    "p-1 rounded transition-colors ml-1",
                                    deleteAreaConfirmId === area.id
                                      ? "text-red-400 bg-red-500/20"
                                      : "text-sidebar-foreground/40 hover:text-red-400 hover:bg-red-500/10"
                                  )}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Add Client Button */}
            {!collapsed && (
              <button
                onClick={() => setAddClientOpen(true)}
                className="w-full sidebar-item text-sidebar-foreground/50 hover:text-sidebar-foreground mt-2"
              >
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
            {userMenuOpen && !collapsed && (
              <motion.div
                className="absolute bottom-full left-3 right-3 mb-2 bg-sidebar-accent rounded-xl shadow-elevated-lg overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
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
                  <span className="text-sm">Ajustes</span>
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-sidebar-border/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Cerrar Sesión</span>
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
      </aside>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={addClientOpen}
        onClose={() => setAddClientOpen(false)}
        onSave={handleAddClient}
      />

      {/* Edit/Create Area Modal */}
      <EditAreaModal
        isOpen={editAreaOpen}
        onClose={() => {
          setEditAreaOpen(false);
          setEditingArea(null);
          setIsNewArea(false);
          setSelectedClientId(null);
        }}
        areaName={editingArea?.area.name || ""}
        areaIcon={"chart"} // Default or extracted from icon
        onSave={handleSaveArea}
        isNew={isNewArea}
      />
    </>
  );
}
