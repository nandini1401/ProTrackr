import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useSharedData } from "@/contexts/SharedDataContext";
import { recentActivities } from "@/lib/mockData";
import { FolderKanban, FileText, Users, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

function getProgressBarColor(progress: number) {
  if (progress >= 100) return "[&>div]:bg-primary";
  if (progress >= 50) return "[&>div]:bg-warning";
  return "[&>div]:bg-destructive";
}

const Dashboard = () => {
  const { projects, forms, tasks, people } = useSharedData();

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
          <h3 className="text-base font-semibold text-foreground mb-4">Project Aktif</h3>
          <div className="space-y-3">
            {activeProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.company}</p>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="w-32 hidden sm:block">
                    <Progress value={project.progress} className={`h-2 ${getProgressBarColor(project.progress)}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">{project.progress}%</span>
                  <StatusBadge status={project.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.project} · {activity.user} · {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
