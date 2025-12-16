import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export function ToolCard({
  title,
  description,
  icon: Icon,
  onClick,
}: ToolCardProps) {
  return (
    <button
      onClick={onClick}
      className="tool-card text-left w-full hover:-translate-y-1 transition-transform"
    >
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <div>
        <h3 className="font-body font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </button>
  );
}
