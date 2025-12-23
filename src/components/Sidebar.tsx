import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  BookOpen,
  BarChart3,
  Users,
  Building2,
  Settings,
  LogOut,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Clock,
  Presentation
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddClientModal } from "./AddClientModal";
import { EditAreaModal } from "./EditAreaModal";
import { ConfirmationModal } from "./ConfirmationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/contexts/UserContext";
import { useData, ClientArea, Client } from "@/contexts/DataContext";

export function Sidebar() {
  const { user, setUser } = useUser();
  const { clients, addClient, deleteClient, addArea, deleteArea, chatSessions } = useData();
  const { areaId: activeArea } = useParams();

  const [collapsed, setCollapsed] = useState(false);
  const [imageError, setImageError] = useState(false);
  // Local state for expansion
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});


  const [addClientOpen, setAddClientOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [editAreaOpen, setEditAreaOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<{ clientId: string; area: ClientArea } | null>(null);
  const [isNewArea, setIsNewArea] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const recentChats = chatSessions
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    .slice(0, 5);

  const allChats = chatSessions.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  const [hoveredClientId, setHoveredClientId] = useState<string | null>(null);
  const [hoveredAreaId, setHoveredAreaId] = useState<string | null>(null);
  const [deleteClientConfirmId, setDeleteClientConfirmId] = useState<string | null>(null);
  const [deleteAreaConfirmId, setDeleteAreaConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleClient = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  const handleClientClick = (client: Client) => {
    // Navigate without expanding sidebar
    if (collapsed) {
      // If collapsed, navigation shouldn't force expand. 
      // Just navigate.
      navigate(`/client/${client.id}`);
      return;
    }
    navigate(`/client/${client.id}`);
  };

  const handleAreaClick = (clientId: string, areaId: string) => {
    navigate(`/client/${clientId}/area/${areaId}`);
  };

  const handleDeleteClient = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteClientConfirmId === clientId) {
      deleteClient(clientId);
      setDeleteClientConfirmId(null);
    } else {
      setDeleteClientConfirmId(clientId);
      setTimeout(() => setDeleteClientConfirmId(null), 2000);
    }
  };

  const handleAddClient = (newClient: { name: string; logo: string }) => {
    addClient(newClient.name, newClient.logo);
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
      deleteArea(clientId, areaId);
      setDeleteAreaConfirmId(null);
    } else {
      setDeleteAreaConfirmId(areaId);
      setTimeout(() => setDeleteAreaConfirmId(null), 2000);
    }
  };

  const handleSaveArea = (name: string, icon: string) => {
    if (!selectedClientId && !editingArea) return;

    if (isNewArea && selectedClientId) {
      addArea(selectedClientId, name, icon);
    } else if (editingArea) {
      // DataContext update todo
      console.log("Update area not implemented in this context version");
    }

    setEditAreaOpen(false);
    setEditingArea(null);
    setIsNewArea(false);
    setSelectedClientId(null);
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  return (
    <>
      <aside
        className={cn(
          "h-[calc(100vh-2rem)] my-4 ml-4 rounded-3xl bg-sidebar flex flex-col relative overflow-hidden transition-all duration-300 ease-out group/sidebar shadow-xl border border-sidebar-border/20",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border min-h-[65px]">
          {collapsed ? (
            <div className="w-full flex justify-center relative group/header">
              {/* Logo (visible by default, hidden on hover) */}
              <span className="text-white font-bold font-muli text-2xl tracking-wider whitespace-nowrap transition-opacity duration-200 group-hover/header:opacity-0">
                n<span className="text-accent">+</span>
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
            <span className="text-sidebar-foreground font-bold font-muli text-xl tracking-wide whitespace-nowrap">
              numericit<span className="text-accent">+</span>
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">

          {/* Clients Section */}
          {!collapsed && (
            <p className="px-4 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-3">
              Clientes
            </p>
          )}

          <div className="space-y-1 px-2">
            {clients.map((client) => {
              const isExpanded = expandedClients[client.id];
              return (
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
                    <Tooltip delayDuration={500}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleClientClick(client)}
                          className={cn(
                            "flex-1 sidebar-item",
                            collapsed && "justify-center px-0",
                            isActiveRoute(`/client/${client.id}`) && "sidebar-item-active"
                          )}
                        >
                          {/* Client Logo */}
                          <div className="w-7 h-7 rounded-lg bg-sidebar-accent flex items-center justify-center text-sm flex-shrink-0 overflow-hidden">
                            {(client.logo.startsWith("data:") || client.logo.startsWith("http")) ? (
                              <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                            ) : (
                              client.logo
                            )}
                          </div>
                          {!collapsed && (
                            <span className="truncate flex-1 text-left">{client.name}</span>
                          )}
                        </button>
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right">{client.name}</TooltipContent>}
                      {!collapsed && client.name.length > 20 && (
                        <TooltipContent side="right" className="bg-sidebar-accent text-sidebar-foreground border-sidebar-border shadow-xl">
                          {client.name}
                        </TooltipContent>
                      )}
                    </Tooltip>

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
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Areas */}
                  <AnimatePresence>
                    {isExpanded && !collapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="ml-6 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                          {client.areas.map((area) => {
                            const iconMap: Record<string, any> = {
                              chart: BarChart3,
                              users: Users,
                              building: Building2,
                              briefcase: BookOpen,
                              file: BookOpen,
                            };
                            const IconComponent = iconMap[area.icon] || Building2;

                            return (
                              <div
                                key={area.id}
                                className="flex items-center group/area"
                                onMouseEnter={() => setHoveredAreaId(area.id)}
                                onMouseLeave={() => setHoveredAreaId(null)}
                              >
                                <Tooltip delayDuration={500}>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => handleAreaClick(client.id, area.id)}
                                      className={cn(
                                        "flex-1 sidebar-item text-sm py-2",
                                        activeArea === area.id && "sidebar-item-active"
                                      )}
                                    >
                                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                                      <span className="truncate">{area.name}</span>
                                    </button>
                                  </TooltipTrigger>
                                  {area.name.length > 20 && (
                                    <TooltipContent side="right" className="bg-sidebar-accent text-sidebar-foreground border-sidebar-border">
                                      {area.name}
                                    </TooltipContent>
                                  )}
                                </Tooltip>

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
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

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

          {/* Resources & Tools Section */}
          <div className="px-2 mt-6">
            {!collapsed && (
              <p className="px-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-3">
                Herramientas
              </p>
            )}

            {/* Whiteboard Button - Moved ABOVE Knowledge Base */}
            <button
              onClick={() => navigate("/whiteboard")}
              className={cn(
                "w-full sidebar-item mb-1",
                collapsed && "justify-center px-0",
                isActiveRoute("/whiteboard") && "sidebar-item-active"
              )}
            >
              <Presentation className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">Pizarra Estratégica</span>}
            </button>

            {/* Knowledge Base Button */}
            <button
              onClick={() => navigate("/knowledge")}
              className={cn(
                "w-full sidebar-item",
                collapsed && "justify-center px-0",
                isActiveRoute("/knowledge") && "sidebar-item-active"
              )}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">Base de Conocimiento</span>}
            </button>
          </div>
        </div>

        {/* Global Recent History Section */}
        {!collapsed && recentChats.length > 0 && (
          <div className="mt-2 px-4 mb-4 pt-4 border-t border-sidebar-border">
            <h3 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 pl-2 flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Recientes
            </h3>
            <div className="space-y-0.5 mb-6">
              {recentChats.map(chat => {
                const chatClient = clients.find(c => c.id === chat.clientId);
                if (!chatClient) return null;
                return (
                  <button
                    key={chat.id}
                    onClick={() => navigate(`/client/${chat.clientId}?chatId=${chat.id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all flex items-center gap-2 group"
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-accent/70 group-hover:text-accent" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{chat.title}</p>
                      <p className="text-[10px] text-sidebar-foreground/50 truncate">{chatClient.name} • {new Date(chat.lastMessageAt).toLocaleDateString()}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <h3 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 pl-2 flex items-center gap-2">
              <MessageSquare className="w-3 h-3" />
              Todos los Chats
            </h3>
            {/* Added [&::-webkit-scrollbar]:hidden to hide scrollbar while allowing scroll */}
            <div className="space-y-0.5 max-h-[200px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
              {allChats.map(chat => {
                const chatClient = clients.find(c => c.id === chat.clientId);
                if (!chatClient) return null;
                return (
                  <button
                    key={`all-${chat.id}`}
                    onClick={() => navigate(`/client/${chat.clientId}?chatId=${chat.id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all flex items-center gap-2 group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-sidebar-border group-hover:bg-accent flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{chat.title}</p>
                      <p className="text-[10px] text-sidebar-foreground/50 truncate">{chatClient.name}</p>
                    </div>
                  </button>
                );
              })}
              {allChats.length === 0 && <p className="text-xs text-sidebar-foreground/40 px-3 py-2">No hay chats aún.</p>}
            </div>
          </div>
        )}

        {/* Consultant Card with Menu */}
        <div className="p-3 border-t border-sidebar-border relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full rounded-xl bg-sidebar-accent/50 p-3 hover:bg-sidebar-accent transition-colors flex items-center",
                  collapsed ? "p-2 justify-center" : "gap-3"
                )}
              >
                <div
                  className={cn(
                    "relative flex items-center justify-center overflow-hidden rounded-full bg-primary/20 flex-shrink-0",
                    collapsed ? "w-8 h-8" : "w-10 h-10"
                  )}
                >
                  {user?.picture && !imageError ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-sidebar-primary font-medium">
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sidebar-foreground text-sm font-medium truncate">
                      {user?.name || "Usuario"}
                    </p>
                    <p className="text-sidebar-foreground/50 text-xs truncate">
                      {user?.email || "consultor@aria.com"}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={collapsed ? "right" : "bottom"}
              align={collapsed ? "start" : "center"}
              sideOffset={10}
              className="w-56 bg-sidebar-accent border-sidebar-border text-sidebar-foreground p-1"
            >
              <DropdownMenuItem
                onClick={() => navigate("/settings")}
                className="cursor-pointer gap-2 focus:bg-sidebar-border/50"
              >
                <Settings className="w-4 h-4" />
                <span>Ajustes</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-sidebar-border" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        areaIcon="chart"
        onSave={handleSaveArea}
        isNew={isNewArea}
      />

      <ConfirmationModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          setUser(null);
          navigate("/");
        }}
        title="Cerrar Sesión"
        description="¿Estás seguro que deseas cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder."
        confirmText="Cerrar Sesión"
        variant="destructive"
      />
    </>
  );
}
