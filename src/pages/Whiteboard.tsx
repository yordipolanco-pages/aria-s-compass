import { useState, useCallback } from "react";
import { Tldraw, Editor, createShapeId } from "tldraw";
import "tldraw/tldraw.css";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { AriaOrb } from "@/components/AriaOrb";
import { Send, Loader2, Save, Eraser, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Whiteboard() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const { clients } = useData();

  // Estado del contexto
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  // Estado del chat
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    editor.updateInstanceState({ isGridMode: true });
  }, []);

  // --- FUNCIÓN MÁGICA: CHAT CON LA IA ---
  const handleGenerate = async () => {
    if (!chatInput.trim()) return;
    if (!selectedClientId) {
      toast.error("Por favor selecciona una empresa primero para dar contexto.");
      return;
    }

    setIsGenerating(true);
    const userPrompt = chatInput;
    setChatInput("");

    // --- PROMPT ENGINEERING SYSTEM ---
    // This instructs the AI to return the EXACT JSON format our renderer needs.
    const systemInstruction = `
    Eres un asistente experto en diagramación visual. Tu trabajo es interpretar la solicitud del usuario y generar un diagrama estructurado en formato JSON.
    
    NO respondas con texto conversacional. SOLO responde con un objeto JSON válido.
    
    El formato JSON debe ser exactamente así:
    {
      "nodes": [
        { "id": "1", "label": "Inicio", "type": "diamond", "x": 100, "y": 100 },
        { "id": "2", "label": "Paso 1", "type": "rectangle", "x": 300, "y": 100 }
    `; // Corrected: Removed `setIsGenerating(true);` from inside the string literal.

    try {
      const userRequest = {
        message: userPrompt,
        context: {
          clientId: selectedClientId,
          areaId: selectedAreaId,
        },
      };

      if (!editor) {
        toast.error("Editor no inicializado.");
        return;
      }

      // Lazy load agent
      const { TldrawAgent } = await import("../lib/tldraw-agent/Agent");
      const agent = new TldrawAgent(editor);

      await agent.prompt(userRequest);
      toast.success("Diagrama generado exitosamente");
      if (showAssistant) setShowAssistant(false);

    } catch (error: any) {
      console.error("Error conectando con Agente:", error);
      toast.error("Error al generar diagrama", {
        description: error.message || "Verifica la conexión con el backend."
      });
    } finally {
      setIsGenerating(false);
    }
  };


  const clearCanvas = () => {
    if (editor) {
      editor.selectAll();
      editor.deleteShapes(editor.getSelectedShapeIds());
    }
  };

  return (
    <div className="flex-1 h-[calc(100vh-2rem)] my-4 mr-4 ml-4 rounded-3xl bg-white shadow-xl border border-sidebar-border/20 relative overflow-hidden font-body">

      {/* TLDRAW CANVAS */}
      <div className="absolute inset-0 z-0">
        <Tldraw
          onMount={handleMount}
          persistenceKey="aria-canvas-v2"
          hideUi={false}
        />
      </div>

      {/* Floating Toolbar (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 pointer-events-auto">
        <Button size="icon" variant="secondary" onClick={clearCanvas} title="Borrar todo" className="bg-white/80 backdrop-blur hover:bg-white shadow-sm border border-gray-200">
          <Eraser className="w-4 h-4 text-destructive" />
        </Button>
        <Button size="icon" variant="secondary" title="Guardar" className="bg-white/80 backdrop-blur hover:bg-white shadow-sm border border-gray-200">
          <Save className="w-4 h-4 text-gray-700" />
        </Button>
      </div>

      {/* Magic Assistant Trigger */}
      <div className="absolute bottom-6 right-6 z-20">
        <AnimatePresence>
          {!showAssistant && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAssistant(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-accent to-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-medium font-muli">Aria Assistant</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Assistant Modal Panel */}
      <AnimatePresence>
        {showAssistant && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-6 right-6 z-30 w-96 max-w-[90vw]"
          >
            <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-border overflow-hidden ring-1 ring-black/5 rounded-3xl">

              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <AriaOrb size="sm" className="w-6 h-6" />
                  <div>
                    <h3 className="font-display font-bold text-sm text-foreground">Asistente de Diagramado</h3>
                    <p className="text-[10px] text-muted-foreground leading-none">Contextualizado por IA</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-gray-200" onClick={() => setShowAssistant(false)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Context Selectors */}
              <div className="p-4 space-y-3 bg-white">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contexto</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select onValueChange={setSelectedClientId} value={selectedClientId}>
                      <SelectTrigger className="h-8 text-xs bg-white border-gray-200">
                        <SelectValue placeholder="Cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select onValueChange={setSelectedAreaId} value={selectedAreaId} disabled={!selectedClient}>
                      <SelectTrigger className="h-8 text-xs bg-white border-gray-200">
                        <SelectValue placeholder="Área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        {selectedClient?.areas.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Instrucción</label>
                  <div className="relative">
                    <Textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ej: Flujo de aprobación para..."
                      className="text-xs h-20 pb-8 resize-none bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
                      disabled={isGenerating}
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 h-7 w-7 rounded-lg bg-accent hover:bg-accent/90 shrink-0 p-0"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>

                {/* Suggestions */}
                {!isGenerating && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button onClick={() => setChatInput("Organigrama general de la empresa")} className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-600 hover:bg-gray-200 transition-colors border border-gray-200">
                      Organigrama
                    </button>
                    <button onClick={() => setChatInput("Diagrama de flujo de ventas")} className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-600 hover:bg-gray-200 transition-colors border border-gray-200">
                      Flujo Ventas
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}