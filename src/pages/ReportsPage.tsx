import { DashboardLayout } from "@/components/DashboardLayout";
import { projects, forms } from "@/lib/mockData";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const statusData = [
  { name: "Planned", value: projects.filter(p => p.status === "planned").length },
  { name: "WIP", value: projects.filter(p => p.status === "wip").length },
  { name: "Completed", value: projects.filter(p => p.status === "completed").length },
];

const COLORS = ["hsl(199, 89%, 48%)", "hsl(38, 92%, 50%)", "hsl(142, 72%, 42%)"];

const formsByTemplate = [
  { name: "Laporan Harian", count: forms.filter(f => f.templateType === "Laporan Harian").length },
  { name: "Laporan Kendala", count: forms.filter(f => f.templateType === "Laporan Kendala").length },
  { name: "Izin Kerja", count: forms.filter(f => f.templateType === "Izin Kerja").length },
];

const ReportsPage = () => (
  <DashboardLayout title="Reports">
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Project Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Reports by Template Type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={formsByTemplate}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default ReportsPage;
