import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AdminNotificationBell } from "@/components/AdminNotificationBell";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSharedData } from "@/contexts/SharedDataContext";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { tasks, projects, people, companies, forms } = useSharedData();
  const [bellAnimating, setBellAnimating] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const recentNotifications = useMemo(() =>
    tasks
      .filter((t) => t.status === "wip" || t.status === "completed")
      .slice(0, 6)
      .map((t) => ({
        id: t.id,
        title: t.title,
        project: t.projectName,
        assignee: t.assignee,
        status: t.status,
        date: t.endDate,
      })),
    [tasks]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { type: string; label: string; sub: string; url: string }[] = [];
    projects.filter(p => p.name.toLowerCase().includes(q) || p.company.toLowerCase().includes(q))
      .slice(0, 3).forEach(p => results.push({ type: "Project", label: p.name, sub: p.company, url: `/projects/${p.id}` }));
    people.filter(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
      .slice(0, 3).forEach(p => results.push({ type: "People", label: p.name, sub: p.jobTitle, url: "/people" }));
    companies.filter(c => c.name.toLowerCase().includes(q))
      .slice(0, 3).forEach(c => results.push({ type: "Perusahaan", label: c.name, sub: c.lineOfBusiness, url: "/companies" }));
    tasks.filter(t => t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q))
      .slice(0, 3).forEach(t => results.push({ type: "Task", label: t.title, sub: t.projectName, url: "/tasks" }));
    forms.filter(f => f.formNumber.toLowerCase().includes(q) || f.workToday.toLowerCase().includes(q))
      .slice(0, 3).forEach(f => results.push({ type: "Form", label: f.formNumber, sub: f.project, url: "/forms" }));
    return results;
  }, [searchQuery, projects, people, companies, tasks, forms]);

  const handleBellClick = () => {
    setBellAnimating(true);
    setOpen(!open);
    setTimeout(() => setBellAnimating(false), 600);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b bg-card px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              {title && <h1 className="text-lg font-semibold text-foreground">{title}</h1>}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-64 bg-secondary border-0"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                />
                {searchOpen && searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 w-80 bg-card border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {searchResults.map((r, i) => (
                      <button key={i} className="w-full text-left p-3 hover:bg-muted/50 border-b last:border-0 flex items-center gap-3"
                        onMouseDown={() => { navigate(r.url); setSearchQuery(""); setSearchOpen(false); }}>
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{r.type}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{r.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchOpen && searchQuery.trim() && searchResults.length === 0 && (
                  <div className="absolute top-full mt-1 left-0 w-80 bg-card border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
                    Tidak ada hasil ditemukan
                  </div>
                )}
              </div>
              <AdminNotificationBell />
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
