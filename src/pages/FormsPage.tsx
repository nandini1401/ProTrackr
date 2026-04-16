import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSharedData } from "@/contexts/SharedDataContext";
import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const templateColors: Record<string, string> = {
  "Laporan Harian": "bg-primary/10 text-primary border-primary/20",
  "Laporan Kendala": "bg-warning/10 text-warning border-warning/20",
  "Izin Kerja": "bg-info/10 text-info border-info/20",
};

const FormsPage = () => {
  const { forms, deleteForm } = useSharedData();
  const [search, setSearch] = useState("");
  const [selectedForm, setSelectedForm] = useState<typeof forms[0] | null>(null);

  const filtered = forms.filter(
    (f) =>
      f.formNumber.toLowerCase().includes(search.toLowerCase()) ||
      f.project.toLowerCase().includes(search.toLowerCase()) ||
      f.workToday.toLowerCase().includes(search.toLowerCase()) ||
      f.reporterName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, id: string, formNumber: string) => {
    e.stopPropagation();
    deleteForm(id);
    toast.success(`Laporan "${formNumber}" berhasil dihapus`);
  };

  return (
    <DashboardLayout title="Forms - Laporan Harian">
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari laporan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="bg-card rounded-lg border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="p-3 text-sm font-medium text-muted-foreground">No. Form</th>
                <th className="p-3 text-sm font-medium text-muted-foreground">Pelapor</th>
                <th className="p-3 text-sm font-medium text-muted-foreground hidden md:table-cell">No. HP</th>
                <th className="p-3 text-sm font-medium text-muted-foreground">Project</th>
                <th className="p-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">Template</th>
                <th className="p-3 text-sm font-medium text-muted-foreground">Tanggal</th>
                <th className="p-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Pekerjaan Hari Ini</th>
                <th className="p-3 text-sm font-medium text-muted-foreground">Foto</th>
                <th className="p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-sm font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((form) => (
                <tr key={form.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedForm(form)}>
                  <td className="p-3 text-sm font-medium text-foreground">{form.formNumber}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={form.reporterAvatar} />
                        <AvatarFallback>{form.reporterName.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{form.reporterName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{form.reporterPhone}</td>
                  <td className="p-3 text-sm text-muted-foreground">{form.project}</td>
                  <td className="p-3 hidden lg:table-cell">
                    <Badge variant="outline" className={templateColors[form.templateType]}>
                      {form.templateType}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{form.date}</td>
                  <td className="p-3 hidden md:table-cell text-sm text-muted-foreground max-w-48 truncate">{form.workToday}</td>
                  <td className="p-3">
                    {form.reportPhotos && form.reportPhotos.length > 0 ? (
                      <img src={form.reportPhotos[0]} alt="Laporan" className="h-8 w-12 object-cover rounded" />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3"><StatusBadge status={form.status} /></td>
                  <td className="p-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
                          <AlertDialogDescription>Laporan "{form.formNumber}" akan dihapus permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={(e) => handleDelete(e, form.id, form.formNumber)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Tidak ada laporan ditemukan</div>
        )}

        <Dialog open={!!selectedForm} onOpenChange={() => setSelectedForm(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Detail Laporan</DialogTitle></DialogHeader>
            {selectedForm && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedForm.reporterAvatar} />
                    <AvatarFallback>{selectedForm.reporterName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{selectedForm.reporterName}</p>
                    <p className="text-sm text-muted-foreground">{selectedForm.reporterPhone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">No. Form:</span> <span className="text-foreground">{selectedForm.formNumber}</span></div>
                  <div><span className="text-muted-foreground">Tanggal:</span> <span className="text-foreground">{selectedForm.date}</span></div>
                  <div><span className="text-muted-foreground">Project:</span> <span className="text-foreground">{selectedForm.project}</span></div>
                  <div><span className="text-muted-foreground">Template:</span> <span className="text-foreground">{selectedForm.templateType}</span></div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pekerjaan Hari Ini:</p>
                  <p className="text-sm text-foreground">{selectedForm.workToday}</p>
                </div>
                {selectedForm.materials && selectedForm.materials !== "-" && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Catatan:</p>
                    <p className="text-sm text-foreground">{selectedForm.materials}</p>
                  </div>
                )}
                {selectedForm.reportPhotos && selectedForm.reportPhotos.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Foto Laporan:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedForm.reportPhotos.map((photo, i) => (
                        <img key={i} src={photo} alt={`Foto ${i + 1}`} className="w-full rounded-lg" />
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-2">
                  <StatusBadge status={selectedForm.status} />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default FormsPage;
