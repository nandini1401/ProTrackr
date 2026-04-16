import { DashboardLayout } from "@/components/DashboardLayout";
import { useSharedData } from "@/contexts/SharedDataContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Calendar, Filter, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const statusConfig = {
  planned: { label: "Belum Mulai", className: "bg-muted text-muted-foreground border-border" },
  wip: { label: "Dalam Proses", className: "bg-warning/10 text-warning border-warning/20" },
  completed: { label: "Selesai", className: "bg-success/10 text-success border-success/20" },
};

const TasksPage = () => {
  const { tasks, deleteTask } = useSharedData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.projectName.toLowerCase().includes(search.toLowerCase()) ||
        t.assignee.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchDateFrom = !dateFrom || t.startDate >= dateFrom;
      const matchDateTo = !dateTo || t.endDate <= dateTo;
      return matchSearch && matchStatus && matchDateFrom && matchDateTo;
    });
  }, [search, statusFilter, dateFrom, dateTo]);

  const handleDelete = (id: string, title: string) => {
    deleteTask(id);
    toast.success(`Task "${title}" berhasil dihapus`);
  };

  return (
    <DashboardLayout title="Tasks">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari task..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="planned">Belum Mulai</SelectItem>
              <SelectItem value="wip">Dalam Proses</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" />
            <span className="text-muted-foreground text-sm">—</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((task) => (
            <div key={task.id} className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-semibold text-foreground">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.projectName}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{task.assignee}</span>
                  </div>
                  <Badge variant="outline" className={statusConfig[task.status].className}>
                    {statusConfig[task.status].label}
                  </Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Task?</AlertDialogTitle>
                        <AlertDialogDescription>Task "{task.title}" akan dihapus permanen.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(task.id, task.title)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={task.progress} className="h-2" />
                </div>
                <span className="text-sm font-medium text-foreground w-10 text-right">{task.progress}%</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {task.startDate} — {task.endDate}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Tidak ada task ditemukan</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TasksPage;
