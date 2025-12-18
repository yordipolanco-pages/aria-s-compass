import { AriaOrb } from "@/components/AriaOrb";

export default function Welcome() {
    return (
        <main className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-2rem)] my-4 mr-4 ml-4 rounded-3xl bg-background shadow-xl border border-sidebar-border/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-blue-500/5 blur-[100px]" />
            <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-2xl">
                <AriaOrb size="lg" className="mb-8" />
                <h1 className="font-display font-bold text-4xl text-foreground mb-4">
                    Bienvenido a Aria<span className="text-accent">+</span>
                </h1>
                <p className="text-muted-foreground text-lg">
                    Tu asistente de inteligencia artificial para consultoría organizacional.
                    Selecciona una opción del menú para comenzar.
                </p>
            </div>
        </main>
    );
}
