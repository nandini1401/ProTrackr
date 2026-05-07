import { DashboardLayout } from "@/components/DashboardLayout";
import { useSharedData } from "@/contexts/SharedDataContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { PersonData } from "@/contexts/SharedDataContext";

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  project_manager: "bg-primary/10 text-primary border-primary/20",
  engineer: "bg-success/10 text-success border-success/20",
  viewer: "bg-muted text-muted-foreground border-border",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  project_manager: "Project Manager",
  engineer: "Engineer",
  viewer: "Viewer",
};

const PeoplePage = () => {
  const { people, addPerson, updatePerson, deletePerson, refreshFromRegistrations } = useSharedData();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<PersonData | null>(null);

  useEffect(() => { refreshFromRegistrations(); }, [refreshFromRegistrations]);

  const filtered = people.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.company.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const photoFile = (e.currentTarget.querySelector('input[name="photo"]') as HTMLInputElement)?.files?.[0];
    const avatarUrl = photoFile ? URL.createObjectURL(photoFile) : "";
    addPerson({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      company: fd.get("company") as string,
      jobTitle: fd.get("jobTitle") as string,
      role: (fd.get("role") as string) || "viewer",
      avatar: avatarUrl,
      progress: 0,
      startDate: fd.get("startDate") as string,
    });
    setDialogOpen(false);
    toast.success("Orang baru berhasil ditambahkan");
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPerson) return;
    const fd = new FormData(e.currentTarget);
    const photoFile = (e.currentTarget.querySelector('input[name="photo"]') as HTMLInputElement)?.files?.[0];
    const avatarUrl = photoFile ? URL.createObjectURL(photoFile) : editingPerson.avatar;
    updatePerson(editingPerson.id, {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      company: fd.get("company") as string,
      jobTitle: fd.get("jobTitle") as string,
      role: fd.get("role") as string,
      avatar: avatarUrl,
      progress: Number(fd.get("progress")),
      startDate: fd.get("startDate") as string,
    });
    setEditDialogOpen(false);
    setEditingPerson(null);
    toast.success("Data berhasil diperbarui");
  };

  const PersonForm = ({ onSubmit, person }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; person?: PersonData | null }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><Label>Foto</Label><Input name="photo" type="file" accept="image/*" /></div>
      <div><Label>Nama</Label><Input name="name" defaultValue={person?.name} required /></div>
      <div><Label>Email</Label><Input name="email" type="email" defaultValue={person?.email} required /></div>
      <div><Label>No. HP</Label><Input name="phone" defaultValue={person?.phone} required /></div>
      <div><Label>Perusahaan</Label><Input name="company" defaultValue={person?.company} required /></div>
      <div><Label>Jabatan</Label><Input name="jobTitle" defaultValue={person?.jobTitle} required /></div>
      {person && (
        <div><Label>Progress (%)</Label><Input name="progress" type="number" min="0" max="100" defaultValue={person.progress} /></div>
      )}
  const PersonForm = ({ onSubmit, person }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; person?: PersonData | null }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><Label>Foto</Label><Input name="photo" type="file" accept="image/*" /></div>
      <div><Label>Nama</Label><Input name="name" defaultValue={person?.name} required /></div>
      <div><Label>Email</Label><Input name="email" type="email" defaultValue={person?.email} required /></div>
      <div><Label>No. HP</Label><Input name="phone" defaultValue={person?.phone} required /></div>
      <div><Label>Perusahaan</Label><Input name="company" defaultValue={person?.company} required /></div>
      <div><Label>Jabatan</Label><Input name="jobTitle" defaultValue={person?.jobTitle} required /></div>
      {person && (
        <div><Label>Progress (%)</Label><Input name="progress" type="number" min="0" max="100" defaultValue={person.progress} /></div>
      )}
      <input type="hidden" name="role" value={person?.role || "viewer"} />
      <div><Label>Tanggal Mulai Kerja</Label><Input name="startDate" type="date" defaultValue={person?.startDate} required /></div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );
      <div><Label>Tanggal Mulai Kerja</Label><Input name="startDate" type="date" defaultValue={person?.startDate} required /></div>
      <Button type="submit" className="w-full">Simpan</Button>
    </form>
  );

  return (
    <DashboardLayout title="People">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nama, perusahaan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />Tambah Orang</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Orang Baru</DialogTitle></DialogHeader>
              <PersonForm onSubmit={handleAdd} />
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Data</DialogTitle></DialogHeader>
            <PersonForm onSubmit={handleEdit} person={editingPerson} />
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((person) => (
            <div key={person.id} className="bg-card rounded-lg border p-5 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={person.avatar} alt={person.name} />
                  <AvatarFallback>{person.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">{person.name}</h3>
                  <p className="text-sm text-muted-foreground">{person.jobTitle}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingPerson(person); setEditDialogOpen(true); }} className="text-muted-foreground hover:text-primary p-1">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm(`Hapus ${person.name}?`)) { deletePerson(person.id); toast.success("Berhasil dihapus"); } }} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">{person.company}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3 w-3" /><span className="truncate">{person.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" /><span>{person.phone}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{person.progress}%</span>
                </div>
                <Progress value={person.progress} className="h-2" />
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={roleColors[person.role] || roleColors.viewer}>
                  {roleLabels[person.role] || person.role}
                </Badge>
                <span className="text-xs text-muted-foreground">Mulai: {person.startDate}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Tidak ada data ditemukan</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PeoplePage;
