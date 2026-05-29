import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6">
      <div className="h-20 w-20 mx-auto rounded-full bg-cream grid place-items-center text-maroon shadow-soft">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="mt-6 font-display text-2xl md:text-3xl text-foreground">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-6 inline-flex">{action}</div>}
    </div>
  );
}
