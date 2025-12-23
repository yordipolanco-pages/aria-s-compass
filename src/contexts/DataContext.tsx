import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Document {
    id: string;
    name: string;
    type: "pdf" | "xlsx" | "docx" | "pptx";
    size: string;
    date: string;
    privacy: "public" | "private" | "confidential";
}

export interface FolderData {
    id: string;
    name: string;
    documents: Document[];
}
// ... (interfaces)

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    clientId: string;
    areaId?: string;
    title: string;
    createdAt: number;
    lastMessageAt: number;
    messages: Message[];
}

export interface ClientArea {
    id: string;
    name: string;
    icon: string; // Identifier for icon map
}

export interface Client {
    id: string;
    name: string;
    logo: string;
    areas: ClientArea[];
    folders: FolderData[]; // KB folders, separate or linked to areas? 
    // In KB page, clients have "folders" which seem to map to areas often, but can be distinct. 
    // To simplify, let's sync "Areas" with "KB Folders". Every Area is a Folder?
    // User request: "create a client ... adds to knowledge base". 
    // So adding a client adds it to KB. Adding an area likely adds a folder.
}

// Separate KB structure? 
// The KnowledgeBase page uses "firmFolders" and "clientKBs".
// "clientKBs" structure in KB page matches Client structure roughly.

interface DataContextType {
    clients: Client[];
    firmFolders: FolderData[];
    addClient: (name: string, logo: string) => void;
    updateClient: (id: string, updates: Partial<Client>) => void;
    deleteClient: (id: string) => void;
    addArea: (clientId: string, name: string, icon: string) => void;
    deleteArea: (clientId: string, areaId: string) => void;
    addDocumentToFirm: (folderId: string, doc: Document) => void;
    addDocumentToClient: (clientId: string, folderId: string, doc: Document) => void;
    addFirmFolder: (name: string) => void;
    deleteFirmFolder: (id: string) => void;
    chatSessions: ChatSession[];
    createChatSession: (clientId: string, areaId?: string) => string;
    addMessageToChat: (chatId: string, message: Omit<Message, "id" | "timestamp">) => void;
    deleteChatSession: (chatId: string) => void;
    clearClientChatHistory: (clientId: string) => void;
    updateChatTitle: (chatId: string, title: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = "aria_compass_data";

export function DataProvider({ children }: { children: ReactNode }) {
    const [clients, setClients] = useState<Client[]>([]);
    const [firmFolders, setFirmFolders] = useState<FolderData[]>([]);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

    // Load from Storage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.clients) setClients(parsed.clients);
                if (parsed.firmFolders) setFirmFolders(parsed.firmFolders);
                if (parsed.chatSessions) setChatSessions(parsed.chatSessions);
            } catch (e) {
                console.error("Failed to parse stored data", e);
            }
        }
    }, []);

    // Save to Storage
    useEffect(() => {
        const data = { clients, firmFolders, chatSessions };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [clients, firmFolders, chatSessions]);

    const addClient = (name: string, logo: string) => {
        const newClient: Client = {
            id: Date.now().toString(),
            name,
            logo,
            areas: [],
            folders: [
                { id: `c-${Date.now()}-general`, name: "General", documents: [] }
            ]
        };
        setClients(prev => [...prev, newClient]);
    };

    const deleteClient = (id: string) => {
        setClients(prev => prev.filter(c => c.id !== id));
    };

    const updateClient = (id: string, updates: Partial<Client>) => {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const addArea = (clientId: string, name: string, icon: string) => {
        setClients(prev => prev.map(c => {
            if (c.id === clientId) {
                const newAreaId = `${clientId}-${Date.now()}`;
                // When adding an Area, should we add a matching Folder in KB?
                // Usually yes for consistency.
                return {
                    ...c,
                    areas: [...c.areas, { id: newAreaId, name, icon }],
                    folders: [...c.folders, { id: newAreaId, name, documents: [] }]
                };
            }
            return c;
        }));
    };

    const deleteArea = (clientId: string, areaId: string) => {
        setClients(prev => prev.map(c => {
            if (c.id === clientId) {
                return {
                    ...c,
                    areas: c.areas.filter(a => a.id !== areaId),
                    folders: c.folders.filter(f => f.id !== areaId)
                };
            }
            return c;
        }));
    };

    const addDocumentToFirm = (folderId: string, doc: Document) => {
        setFirmFolders(prev => prev.map(f =>
            f.id === folderId ? { ...f, documents: [...f.documents, doc] } : f
        ));
    };

    const addDocumentToClient = (clientId: string, folderId: string, doc: Document) => {
        setClients(prev => prev.map(c =>
            c.id === clientId
                ? {
                    ...c,
                    folders: c.folders.map(f =>
                        f.id === folderId ? { ...f, documents: [...f.documents, doc] } : f
                    )
                }
                : c
        ));
    };

    const addFirmFolder = (name: string) => {
        setFirmFolders(prev => [...prev, { id: `f-${Date.now()}`, name, documents: [] }]);
    };

    const deleteFirmFolder = (id: string) => {
        setFirmFolders(prev => prev.filter(f => f.id !== id));
    };

    const createChatSession = (clientId: string, areaId?: string) => {
        const newChat: ChatSession = {
            id: Date.now().toString(),
            clientId,
            areaId,
            title: "Nuevo Chat",
            createdAt: Date.now(),
            lastMessageAt: Date.now(),
            messages: []
        };
        setChatSessions(prev => [newChat, ...prev]);
        return newChat.id;
    };

    const addMessageToChat = (chatId: string, message: Omit<Message, "id" | "timestamp">) => {
        setChatSessions(prev => prev.map(chat => {
            if (chat.id === chatId) {
                const newMessage: Message = {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    ...message
                };

                // Auto-generate title if it's the first user message
                let title = chat.title;
                if (chat.messages.length === 0 && message.role === "user") {
                    title = message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "");
                }

                return {
                    ...chat,
                    lastMessageAt: Date.now(),
                    title,
                    messages: [...chat.messages, newMessage]
                };
            }
            return chat;
        }));
    };

    const deleteChatSession = (chatId: string) => {
        setChatSessions(prev => prev.filter(c => c.id !== chatId));
    };

    const clearClientChatHistory = (clientId: string) => {
        setChatSessions(prev => prev.filter(c => c.clientId !== clientId));
    };

    const updateChatTitle = (chatId: string, title: string) => {
        setChatSessions(prev => prev.map(c => c.id === chatId ? { ...c, title } : c));
    };

    return (
        <DataContext.Provider value={{
            clients,
            firmFolders,
            addClient,
            updateClient,
            deleteClient,
            addArea,
            deleteArea,
            addDocumentToFirm,
            addDocumentToClient,
            addFirmFolder,
            deleteFirmFolder,
            chatSessions,
            createChatSession,
            addMessageToChat,
            deleteChatSession,
            clearClientChatHistory,
            updateChatTitle
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
}
