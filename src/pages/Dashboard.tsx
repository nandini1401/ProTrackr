import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useSharedData } from "@/contexts/SharedDataContext";
import { FolderKanban, FileText, Users, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Dashboard = () => {
  const { projects, forms, people } = useSharedData();
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // Realtime notifications: derived from incoming form submissions, sorted by createdAt timestamp
  const notifications = [...forms]
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date || 0).getTime();
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date || 0).getTime();
      return tb - ta;
    })
    .slice(0, 10);

  const formatRelative = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 30) return "Baru saja";
    if (secs < 60) return `${secs} detik lalu`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins} menit lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} jam lalu`;
    const days = Math.floor(hrs / 24);
    return `${days} hari lalu`;
  };

  const activeProjects = projects.filter(p => p.status !== "completed");
  const avgProgress = projects.length ? Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length) : 0;

  const chartData = projects.map((p) => ({
    name: p.name.length > 18 ? p.name.substring(0, 18) + "..." : p.name,
    progress: p.progress,
  }));
  const chartWidth = Math.max(projects.length * 160, 600);

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Projects" value={projects.length} icon={FolderKanban} change={`${activeProjects.length} aktif`} changeType="positive" color="primary" />
          <StatCard title="Total Laporan" value={forms.length} icon={FileText} change={`${forms.filter(f => f.status === 'submitted').length} submitted`} changeType="positive" color="success" />
          <StatCard title="Total People" value={people.length} icon={Users} change={`${people.length} terdaftar`} changeType="neutral" color="info" />
          <StatCard title="Avg Progress" value={`${avgProgress}%`} icon={TrendingUp} change="+5% dari minggu lalu" changeType="positive" color="warning" />
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Progress Project</h3>
          <ScrollArea className="w-full">
            <div style={{ width: chartWidth, minWidth: "100%" }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Notifikasi Laporan Masuk</h3>
            <span className="text-xs text-muted-foreground">Realtime</span>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada laporan masuk</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="flex gap-3 items-start p-3 rounded-lg hover:bg-muted/40 transition-colors">
                  {n.reporterAvatar ? (
                    <img src={n.reporterAvatar} alt="" className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{n.reporterName}</span> mengirim laporan{" "}
                      <span className="font-medium">{n.formNumber}</span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {n.project} · {n.date} · {formatRelative(n.createdAt || n.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
