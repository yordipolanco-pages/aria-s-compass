import { Sidebar } from "@/components/Sidebar";
import { AriaOrb } from "@/components/AriaOrb";

export default function Welcome() {
    return (
        <div className="flex min-h-screen w-full bg-pearl">
            <Sidebar />
            <main className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-lg">
                    <AriaOrb size="lg" className="mx-auto mb-8" />
                    <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                        Bienvenido, Consultor
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Selecciona un cliente del menú lateral para comenzar a trabajar.
                    </p>
                </div>
            </main>
        </div>
    );
}
