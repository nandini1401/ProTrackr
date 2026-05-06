import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useSharedData } from "@/contexts/SharedDataContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, LayoutGrid, List, Trash2, Calendar, Pencil, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ProjectData } from "@/contexts/SharedDataContext";

function getProgressBarColor(progress: number) {
  if (progress >= 100) return "[&>div]:bg-primary";
  if (progress >= 50) return "[&>div]:bg-warning";
  return "[&>div]:bg-destructive";
}

const ProjectsPage = () => {
  const { projects, companies, addProject, updateProject, deleteProject, refreshFromRegistrations } = useSharedData();
  const [newCompany, setNewCompany] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [view, setView] = useState<"list" | "grid">("grid");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.company.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addProject({
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      company: newCompany,
      startDate: fd.get("startDate") as string,
      endDate: fd.get("endDate") as string,
      progress: 0,
      status: "planned",
      memberCount: 0,
    });
    setDialogOpen(false);
    toast.success("Project berhasil ditambahkan");
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProject) return;
    const fd = new FormData(e.currentTarget);
    updateProject(editingProject.id, {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      company: editCompany,
      startDate: fd.get("startDate") as string,
      endDate: fd.get("endDate") as string,
      progress: Number(fd.get("progress")),
      status: fd.get("status") as ProjectData["status"],
    });
    setEditDialogOpen(false);
    setEditingProject(null);
    toast.success("Project berhasil diperbarui");
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    toast.success("Project berhasil dihapus");
  };

  return (
    <DashboardLayout title="Projects">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari project..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant={view === "grid" ? "default" : "outline"} size="icon" onClick={() => setView("grid")}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={view === "list" ? "default" : "outline"} size="icon" onClick={() => setView("list")}>
              <List className="h-4 w-4" />
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (o) { setNewCompany(""); refreshFromRegistrations(); } }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" />Tambah Project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Tambah Project Baru</DialogTitle></DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div><Label>Nama Project</Label><Input name="name" required /></div>
                  <div><Label>Deskripsi</Label><Input name="description" required /></div>
                  <div>
                    <Label>Perusahaan</Label>
                    <Select value={newCompany} onValueChange={setNewCompany} required>
                      <SelectTrigger><SelectValue placeholder={companies.length ? "Pilih perusahaan" : "Belum ada perusahaan — buat dulu di menu Companies"} /></SelectTrigger>
                      <SelectContent>
                        {companies.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">Belum ada perusahaan</div>
                        ) : (
                          companies.map((c) => (<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Tanggal Mulai</Label><Input name="startDate" type="date" required /></div>
                    <div><Label>Tanggal Selesai</Label><Input name="endDate" type="date" required /></div>
                  </div>
                  <Button type="submit" className="w-full">Simpan</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (o && editingProject) setEditCompany(editingProject.company); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
            {editingProject && (
              <form onSubmit={handleEdit} className="space-y-4">
                <div><Label>Nama Project</Label><Input name="name" defaultValue={editingProject.name} required /></div>
                <div><Label>Deskripsi</Label><Input name="description" defaultValue={editingProject.description} required /></div>
                <div>
                  <Label>Perusahaan</Label>
                  <Select value={editCompany} onValueChange={setEditCompany} required>
                    <SelectTrigger><SelectValue placeholder="Pilih perusahaan" /></SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Tanggal Mulai</Label><Input name="startDate" type="date" defaultValue={editingProject.startDate} required /></div>
                  <div><Label>Tanggal Selesai</Label><Input name="endDate" type="date" defaultValue={editingProject.endDate} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Progress (%)</Label><Input name="progress" type="number" min="0" max="100" defaultValue={editingProject.progress} required /></div>
                  <div><Label>Status</Label>
                    <select name="status" defaultValue={editingProject.status} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                      <option value="planned">Planned</option>
                      <option value="wip">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full">Simpan Perubahan</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <div key={project.id} className="bg-card rounded-lg border p-5 space-y-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.company}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingProject(project); setEditDialogOpen(true); }} className="text-muted-foreground hover:text-primary p-1">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{project.startDate} — {project.endDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-foreground font-medium">
                    <Users className="h-3 w-3" />
                    <span>{project.memberCount} orang</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className={`h-2.5 ${getProgressBarColor(project.progress)}`} />
                </div>
                <StatusBadge status={project.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="p-3 text-sm font-medium text-muted-foreground">Nama Project</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Perusahaan</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">Tanggal</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Anggota</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Progress</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground w-20">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => (
                  <tr key={project.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                    <td className="p-3 text-sm font-medium text-foreground">{project.name}</td>
                    <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{project.company}</td>
                    <td className="p-3 text-sm text-muted-foreground hidden lg:table-cell">{project.startDate} — {project.endDate}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm text-foreground">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{project.memberCount}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className={`h-2 w-20 ${getProgressBarColor(project.progress)}`} />
                        <span className="text-sm">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3"><StatusBadge status={project.status} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setEditingProject(project); setEditDialogOpen(true); }} className="text-muted-foreground hover:text-primary">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Tidak ada project ditemukan</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectsPage;
