import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { AriaOrb } from "@/components/AriaOrb";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { EditClientModal } from "@/components/EditClientModal";
import {
  ArrowUp,
  Pencil,
  ChevronRight,
  Paperclip,
  Bot,
  User,
  Clock, // History icon
  Plus, // New chat icon
  MessageSquare,
  Trash2,
  Copy,
  Download,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useData, Document } from "@/contexts/DataContext";
import { UploadDocumentModal } from "@/components/UploadDocumentModal";
import { toast } from "sonner";
import { renderToStaticMarkup } from "react-dom/server";

// --- NUEVAS IMPORTACIONES PARA MARKDOWN ---
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import rehypeRaw from "rehype-raw";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ClientChat() {
  const { clientId, areaId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  // const [messages, setMessages] = useState<Message[]>([]); // Removed local messages state
  const [isLoading, setIsLoading] = useState(false);
  const { clients, updateClient, firmFolders, addDocumentToClient, addDocumentToFirm, chatSessions, createChatSession, addMessageToChat, deleteChatSession, clearClientChatHistory } = useData();
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat History State
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [deleteChatConfirmId, setDeleteChatConfirmId] = useState<string | null>(null);
  const [clearHistoryConfirmOpen, setClearHistoryConfirmOpen] = useState(false);

  const client = clientId ? clients.find(c => c.id === clientId) : null;
  const currentArea = areaId && client ? client.areas.find(a => a.id === areaId) : null;

  // Filter chats for this client/area
  const clientChats = chatSessions.filter(c => c.clientId === clientId && (!areaId || c.areaId === areaId)).sort((a, b) => b.lastMessageAt - a.lastMessageAt);

  const activeChat = activeChatId ? chatSessions.find(c => c.id === activeChatId) : null;
  const messages = activeChat?.messages || [];

  // Initialize or select chat
  useEffect(() => {
    const chatIdParam = searchParams.get("chatId");

    // 1. If URL has specific chatId, try to load it
    if (chatIdParam) {
      const chatExists = chatSessions.find(c => c.id === chatIdParam);
      if (chatExists) {
        if (activeChatId !== chatIdParam) {
          setActiveChatId(chatIdParam);
        }
        return;
      }
    }

    // 2. Main Logic: Ensure activeChatId fits current context (Client + Area)
    const isActiveChatValid = activeChatId && clientChats.find(c => c.id === activeChatId);

    if (!isActiveChatValid) {
      // If the currently selected chat doesn't belong to this new area/client view,
      // reset it.
      if (clientChats.length > 0) {
        // Option A: Auto-select latest chat
        setActiveChatId(clientChats[0].id);
      } else {
        // Option B: No chats? Set to null (New Chat)
        setActiveChatId(null);
      }
    }
  }, [clientId, areaId, chatSessions, searchParams, activeChatId]); // Removed clientChats from dependency to avoid loop, calculated inside or separate memo

  const handleNewChat = () => {
    setActiveChatId(null);
    setHistoryOpen(false);
    // Clear chatId from URL when starting a new chat
    navigate(`/client/${clientId}${areaId ? `/area/${areaId}` : ''}`, { replace: true });
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setHistoryOpen(false);
    // Update URL with selected chatId
    navigate(`/client/${clientId}${areaId ? `/area/${areaId}` : ''}?chatId=${chatId}`);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !client) return;

    let chatId = activeChatId;

    // Create session if not exists
    if (!chatId) {
      chatId = createChatSession(client.id, currentArea?.id);
      setActiveChatId(chatId);
      // Update URL with new chatId
      navigate(`/client/${clientId}${areaId ? `/area/${areaId}` : ''}?chatId=${chatId}`);
    }

    const userMsg = { role: "user" as const, content: inputMessage };
    addMessageToChat(chatId, userMsg);

    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          clientId: client.id,
          areaId: currentArea?.id || "general"
        }),
      });

      const data = await response.json();

      const aiMsg = {
        role: "assistant" as const,
        content: data.response
      };
      addMessageToChat(chatId, aiMsg);

    } catch (error) {
      console.error("Error conectando con Aria:", error);
      const errorMsg = {
        role: "assistant" as const,
        content: "⚠️ **Error:** No pude conectar con el servidor de IA."
      };
      addMessageToChat(chatId, errorMsg);

    } finally {
      setIsLoading(false);
    }
  };

  if (!client) return <div className="flex min-h-screen w-full bg-pearl"><Sidebar /><main className="flex-1 p-8">Cliente no encontrado</main></div>;

  const handleSaveClient = (name: string, logo: string) => {
    updateClient(client.id, { name, logo });
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setDeleteChatConfirmId(chatId);
  };

  const confirmDeleteChat = () => {
    if (deleteChatConfirmId) {
      deleteChatSession(deleteChatConfirmId);
      if (activeChatId === deleteChatConfirmId) {
        setActiveChatId(null);
        // Clear chatId from URL if the active chat is deleted
        navigate(`/client/${clientId}${areaId ? `/area/${areaId}` : ''}`, { replace: true });
      }
      setDeleteChatConfirmId(null);
    }
  };

  const handleClearHistory = () => {
    setClearHistoryConfirmOpen(true);
  };

  const confirmClearHistory = () => {
    if (client) {
      clearClientChatHistory(client.id);
      setActiveChatId(null);
      setHistoryOpen(false);
      // Clear chatId from URL if history is cleared
      navigate(`/client/${clientId}${areaId ? `/area/${areaId}` : ''}`, { replace: true });
    }
    setClearHistoryConfirmOpen(false);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copiado al portapapeles");
  };

  const handleExportExcel = (content: string) => {
    // Escaping quotes for CSV
    const safeContent = content.replace(/"/g, '""');
    const csvContent = `\uFEFFResponse\n"${safeContent}"`; // BOM for Excel + simple CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aria-response-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exportado a Excel");
  };

  const handleExportWord = (content: string) => {
    // Render Markdown to HTML string
    // This ensures tables, bold, lists etc are converted to HTML tags that Word understands
    const contentHtml = renderToStaticMarkup(
      <div style={{ fontFamily: 'Calibri, Arial, sans-serif', color: '#000' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>
    );

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Export</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
          th { background-color: #f3f4f6; font-weight: bold; }
          h1, h2, h3 { color: #111827; margin-top: 1.5em; margin-bottom: 0.5em; }
          p { margin-bottom: 1em; }
          ul, ol { margin-bottom: 1em; padding-left: 2em; }
          li { margin-bottom: 0.5em; }
        </style>
      </head>
      <body>
        ${contentHtml}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aria-response-${Date.now()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exportado a Word");
  };

  return (
    <>
      <main className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-2rem)] my-4 mr-4 ml-4 rounded-3xl bg-white shadow-xl border border-gray-200 relative">
        {/* Header - Transparent/Minimal */}
        <header className="px-6 py-4 border-b border-gray-100 backdrop-blur-sm absolute top-0 left-0 right-0 z-10 bg-white/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl overflow-hidden shadow-sm border border-border/50">
                {client.logo.startsWith("data:") ? <img src={client.logo} className="w-full h-full object-cover" /> : client.logo}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-lg text-foreground font-semibold">{client.name}</h1>
                  {currentArea && <><ChevronRight className="w-4 h-4 text-muted-foreground" /><span className="font-display text-lg text-accent">{currentArea.name}</span></>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewChat}
                className="p-2.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center gap-2"
                title="Nuevo Chat"
              >
                <Plus className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className={`p-2.5 rounded-full transition-all ${historyOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  title="Historial de Chats"
                >
                  <Clock className="w-5 h-5" />
                </button>
                {/* History Dropdown/Popover */}
                {historyOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 max-h-[400px] overflow-y-auto">
                    <h3 className="font-display font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wider">Historial</h3>
                    <div className="space-y-2">
                      {clientChats.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No hay historial</p>
                      ) : (
                        clientChats.map(chat => (
                          <div
                            key={chat.id}
                            className={`group w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 hover:bg-gray-50 ${activeChatId === chat.id ? "bg-blue-50 border border-blue-100" : ""}`}
                          >
                            <button
                              onClick={() => handleSelectChat(chat.id)}
                              className="flex-1 flex items-start gap-3 text-left w-full overflow-hidden"
                            >
                              <MessageSquare className={`w-4 h-4 mt-1 flex-shrink-0 ${activeChatId === chat.id ? "text-blue-500" : "text-gray-400"}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm truncate ${activeChatId === chat.id ? "text-blue-700" : "text-gray-700"}`}>{chat.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{new Date(chat.lastMessageAt).toLocaleDateString()} {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </button>
                            <button
                              onClick={(e) => handleDeleteChat(e, chat.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                              title="Eliminar chat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    {clientChats.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={handleClearHistory}
                          className="w-full py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Borrar Todo el Historial
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="w-px h-6 bg-gray-200 mx-2"></div>
              <button onClick={() => setEditClientOpen(true)} className="p-2.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><Pencil className="w-5 h-5" /></button>
            </div>
          </div>
        </header >

        {/* Chat Content - The Invisible Container */}
        < div className="flex-1 overflow-y-auto w-full flex flex-col items-center scroll-smooth pt-20 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']" >
          <div className="w-full max-w-[800px] px-6 flex flex-col min-h-full">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 my-auto">
                <div className="space-y-4">
                  <AriaOrb size="lg" className="mx-auto shadow-2xl shadow-blue-500/20 rounded-full" />
                  <h2 className="font-display text-4xl text-foreground font-bold tracking-tight">Bienvenido a {client.name}</h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">Estoy lista para analizar los documentos y datos de esta empresa.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-10 pt-8 pb-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-4 max-w-full ${msg.role === "user" ? "flex-row-reverse" : "flex-row w-full"}`}>

                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === "user" ? "hidden" : "bg-transparent scale-110"}`}>
                        {msg.role === "assistant" && <AriaOrb size="xs" isStatic />}
                      </div>

                      {/* Message Content */}
                      <div className={`${msg.role === "user" ? "bg-[#2A2B2C] text-gray-100 px-6 py-4 rounded-[2rem] shadow-sm max-w-[85%]" : "w-full max-w-[800px] mx-auto text-left block px-0 py-2"}`}>
                        {msg.role === "user" ? (
                          <p className="whitespace-pre-wrap text-[16px]" style={{ fontFamily: "'Inter', system-ui, sans-serif", lineHeight: "1.6" }}>{msg.content}</p>
                        ) : (
                          /* AI Message - Clean Text Flow (Light Mode) */
                          <div className="ai-message-content" style={{ width: '100%' }}>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                p: ({ node, ...props }) => <p style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif", fontSize: '16px', lineHeight: '1.6', color: '#1f1f1f', marginBottom: '24px' }} {...props} />,
                                h1: ({ node, ...props }) => <h1 style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif", fontSize: '24px', fontWeight: 700, lineHeight: '1.6', color: '#1f1f1f', marginTop: '32px', marginBottom: '16px' }} {...props} />,
                                h2: ({ node, ...props }) => <h2 style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif", fontSize: '20px', fontWeight: 700, lineHeight: '1.6', color: '#1f1f1f', marginTop: '24px', marginBottom: '16px' }} {...props} />,
                                h3: ({ node, ...props }) => <h3 style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif", fontSize: '18px', fontWeight: 700, lineHeight: '1.6', color: '#1f1f1f', marginTop: '24px', marginBottom: '16px' }} {...props} />,
                                ul: ({ node, ...props }) => <ul style={{ marginTop: '0', marginBottom: '24px', paddingLeft: '24px', color: '#1f1f1f', listStyleType: 'disc' }} {...props} />,
                                ol: ({ node, ...props }) => <ol style={{ marginTop: '0', marginBottom: '24px', paddingLeft: '24px', color: '#1f1f1f', listStyleType: 'decimal' }} {...props} />,
                                li: ({ node, ...props }) => <li style={{ marginBottom: '8px', paddingLeft: '4px', fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif", fontSize: '16px', lineHeight: '1.6', color: '#1f1f1f' }} {...props} />,
                                strong: ({ node, ...props }) => <strong style={{ fontWeight: 700, color: '#000000' }} {...props} />,
                                table: ({ node, ...props }) => <div className="overflow-hidden rounded-lg border border-gray-200 my-6 shadow-sm"><table className="min-w-full text-sm text-left text-gray-800" {...props} /></div>,
                                thead: ({ node, ...props }) => <thead className="bg-gray-50 text-gray-900 border-b border-gray-200" {...props} />,
                                tr: ({ node, ...props }) => <tr className="border-b border-gray-100 last:border-0" {...props} />,
                                th: ({ node, ...props }) => <th className="px-6 py-3 font-semibold" {...props} />,
                                td: ({ node, ...props }) => <td className="px-6 py-4" {...props} />,
                                hr: ({ node, ...props }) => <hr className="my-8 border-gray-200" {...props} />,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                            <div className="flex items-center gap-2 mt-4 pt-2 border-t border-gray-100">
                              <button
                                onClick={() => handleCopyMessage(msg.content)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                Copiar
                              </button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Exportar
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleExportExcel(msg.content)}>
                                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                                    Excel
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleExportWord(msg.content)}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Word (Docx)
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 w-full">
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1"><AriaOrb size="xs" /></div>
                    <div className="flex items-center gap-1.5 h-8 px-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div >

        {/* Floating Input Capsule */}
        < div className="w-full flex justify-center pb-8 pt-2 px-6 bg-gradient-to-t from-white via-white to-transparent z-10" >
          <div className="w-full max-w-[800px] relative">
            <div className="bg-gray-100 rounded-[26px] p-4 border border-transparent focus-within:bg-white focus-within:border-gray-300 focus-within:ring-4 focus-within:ring-gray-100 transition-all shadow-sm hover:shadow-md flex flex-col gap-2">
              <textarea
                rows={1}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                    const target = e.target as HTMLTextAreaElement;
                    setTimeout(() => { target.style.height = 'auto'; }, 0);
                  }
                }}
                placeholder="Escribe tu consulta a Aria..."
                className="w-full bg-transparent border-none outline-none resize-none max-h-[200px] font-body text-gray-900 placeholder:text-gray-500 text-[16px]"
                style={{ minHeight: '24px', height: 'auto' }}
              />
              <div className="flex justify-between items-center w-full">
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    handleSendMessage();
                  }}
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="text-center mt-3">
              <p className="text-[11px] text-muted-foreground/60 font-medium tracking-wide">Aria puede mostrar información imprecisa. Verifica sus respuestas.</p>
            </div>
          </div>
        </div >
      </main >

      <EditClientModal isOpen={editClientOpen} onClose={() => setEditClientOpen(false)} clientName={client.name} clientLogo={client.logo} onSave={handleSaveClient} />

      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        knowledgeBases={[
          {
            id: "firm",
            name: "Metodologías Numericit",
            type: "firm" as const,
            folders: firmFolders.map((f) => ({ id: f.id, name: f.name })),
          },
          ...clients.map((c) => ({
            id: c.id,
            name: c.name,
            logo: c.logo,
            type: "client" as const,
            folders: c.folders.map((f) => ({ id: f.id, name: f.name })),
          })),
        ]}
        initialClientId={client.id}
        initialFolderId={currentArea?.id}
        onUpload={async (file, kbId, folderId) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("clientId", kbId);
          formData.append("areaId", folderId);

          const toastId = toast.loading(`Subiendo ${file.name}...`);

          try {
            const response = await fetch("http://localhost:8000/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) throw new Error("Error en el servidor");

            const data = await response.json();

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
            } else {
              addDocumentToClient(kbId, folderId, newDoc);
            }

            toast.success("Archivo enviado al núcleo", {
              id: toastId,
              duration: 5000,
              description: "Aria+ está leyendo y analizando el documento.",
              icon: <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            });

          } catch (error) {
            console.error(error);
            toast.error("Error al subir documento", {
              id: toastId,
              description: "Verifica que el servidor esté corriendo.",
            });
          }
        }}
      />
      <ConfirmationModal
        isOpen={!!deleteChatConfirmId}
        onClose={() => setDeleteChatConfirmId(null)}
        onConfirm={confirmDeleteChat}
        title="Eliminar Chat"
        description="¿Estás seguro de que quieres eliminar este chat? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="destructive"
      />
      <ConfirmationModal
        isOpen={clearHistoryConfirmOpen}
        onClose={() => setClearHistoryConfirmOpen(false)}
        onConfirm={confirmClearHistory}
        title="Borrar Todo el Historial"
        description="¿Estás seguro de que quieres borrar permanentemente todo el historial de chats de este cliente? Esta acción no se puede deshacer."
        confirmText="Borrar Todo"
        variant="destructive"
      />
    </>
  );
}