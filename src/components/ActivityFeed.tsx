import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface Activity {
  id: string;
  client: string;
  area: string;
  action: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    client: "Coca-Cola",
    area: "Finanzas",
    action: "Análisis de Q3 completado",
    time: "hace 1h",
  },
  {
    id: "2",
    client: "Banco Santander",
    area: "General",
    action: "Carga de documentos pendiente",
    time: "hace 2h",
  },
  {
    id: "3",
    client: "Grupo Bimbo",
    area: "Logística",
    action: "Gap Analysis en progreso",
    time: "hace 3h",
  },
  {
    id: "4",
    client: "Coca-Cola",
    area: "RRHH",
    action: "Minuta de reunión generada",
    time: "hace 5h",
  },
];

export function ActivityFeed() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft h-full">
      <h3 className="font-display text-lg text-foreground mb-4">
        Actividad Reciente
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {activity.client}{" "}
                <span className="text-muted-foreground font-normal">
                  / {activity.area}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activity.action}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {activity.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
