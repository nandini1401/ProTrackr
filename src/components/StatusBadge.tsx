import { Badge } from "@/components/ui/badge";

type StatusType = "planned" | "wip" | "completed" | "draft" | "submitted" | "closed";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  planned: { label: "Planned", className: "bg-info/10 text-info border-info/20" },
  wip: { label: "Work In Progress", className: "bg-warning/10 text-warning border-warning/20" },
  completed: { label: "Completed", className: "bg-success/10 text-success border-success/20" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
  submitted: { label: "Submitted", className: "bg-primary/10 text-primary border-primary/20" },
  closed: { label: "Closed", className: "bg-success/10 text-success border-success/20" },
};

export function StatusBadge({ status }: { status: StatusType }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
