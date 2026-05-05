import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSharedData } from "@/contexts/SharedDataContext";
import { UserLayout } from "@/components/UserLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, Calendar, Clock, Trash2, Pencil, Camera, Save } from "lucide-react";
import { toast } from "sonner";

interface UserReport {
  id: string;
  formNumber?: string;
  date: string;
  workDescription: string;
  notes: string;
  photos: string[];
  submittedAt: string;
}

function getUserReports(userId: string): UserReport[] {
  try {
    return JSON.parse(localStorage.getItem(`user_reports_${userId}`) || "[]");
  } catch { return []; }
}

function saveUserReports(userId: string, reports: UserReport[]) {
  localStorage.setItem(`user_reports_${userId}`, JSON.stringify(reports));
}

const UserHistoryPage = () => {
  const { currentUser, authUser } = useAuth();
  const { forms, updateForm, deleteForm, addActivity } = useSharedData();
  const [reports, setReports] = useState<UserReport[]>(() => currentUser ? getUserReports(currentUser.id) : []);

  // Rehydrate from server (survives logout/refresh) and merge with any local-only entries
  useEffect(() => {
    if (!currentUser || !authUser) return;
    const myForms = forms.filter(f => f.submittedBy === authUser.id);
    const fromServer: UserReport[] = myForms.map(f => ({
      id: f.id,
      formNumber: f.formNumber,
      date: f.date,
      workDescription: f.workToday,
      notes: f.materials === "-" ? "" : f.materials,
      photos: f.reportPhotos || [],
      submittedAt: f.date,
    }));
    const local = getUserReports(currentUser.id);
    const serverNumbers = new Set(fromServer.map(r => r.formNumber));
    const localOnly = local.filter(r => r.formNumber && !serverNumbers.has(r.formNumber));
    const merged = [...fromServer, ...localOnly].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    setReports(merged);
    saveUserReports(currentUser.id, merged);
  }, [forms, currentUser, authUser]);
  const [editingReport, setEditingReport] = useState<UserReport | null>(null);
  const [editWork, setEditWork] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPhotos, setEditPhotos] = useState<string[]>([]);

  if (!currentUser) return null;

  const handleDelete = (report: UserReport) => {
    const updated = reports.filter(r => r.id !== report.id);
    setReports(updated);
    saveUserReports(currentUser.id, updated);

    // Also delete from shared forms (admin side)
    if (report.formNumber) {
      const matchingForm = forms.find(f => f.formNumber === report.formNumber);
      if (matchingForm) {
        deleteForm(matchingForm.id);
      }
    }

    addActivity({
      action: `Laporan ${report.formNumber || ''} dihapus oleh user`,
      project: currentUser.project,
      user: currentUser.fullName,
      userAvatar: currentUser.avatarUrl,
    });

    toast.success("Laporan berhasil dihapus");
  };

  const openEdit = (report: UserReport) => {
    setEditingReport(report);
    setEditWork(report.workDescription);
    setEditNotes(report.notes);
    setEditPhotos([...report.photos]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setEditPhotos((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveEdit = () => {
    if (!editingReport) return;

    const updated = reports.map(r => {
      if (r.id === editingReport.id) {
        return { ...r, workDescription: editWork, notes: editNotes, photos: editPhotos };
      }
      return r;
    });
    setReports(updated);
    saveUserReports(currentUser.id, updated);

    // Sync edit to shared forms (admin side)
    if (editingReport.formNumber) {
      const matchingForm = forms.find(f => f.formNumber === editingReport.formNumber);
      if (matchingForm) {
        updateForm(matchingForm.id, {
          workToday: editWork,
          materials: editNotes || "-",
          reportPhotos: editPhotos,
        });
      }
    }

    addActivity({
      action: `Laporan ${editingReport.formNumber || ''} diedit oleh user`,
      project: currentUser.project,
      user: currentUser.fullName,
      userAvatar: currentUser.avatarUrl,
    });

    setEditingReport(null);
    toast.success("Laporan berhasil diperbarui");
  };

  return (
    <UserLayout title="Riwayat Laporan">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Stats card */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl border shadow-sm p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{reports.length}</p>
              <p className="text-sm text-muted-foreground">Total Laporan</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl border shadow-sm p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{reports.length > 0 ? reports[0].date : "-"}</p>
              <p className="text-sm text-muted-foreground">Terakhir Kirim</p>
            </div>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="bg-card rounded-2xl border shadow-sm p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Belum ada laporan yang dikirim.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-card rounded-2xl border shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{report.date}</span>
                    {report.formNumber && (
                      <Badge variant="outline" className="text-xs">{report.formNumber}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(report)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
                          <AlertDialogDescription>Laporan ini akan dihapus permanen dari riwayat Anda dan dari admin.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(report)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{report.workDescription}</p>
                {report.notes && (
                  <p className="text-xs text-muted-foreground italic">📝 {report.notes}</p>
                )}
                {report.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {report.photos.map((photo, i) => (
                      <img key={i} src={photo} alt={`foto-${i}`} className="w-20 h-20 rounded-xl object-cover border shadow-sm" />
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Dikirim: {new Date(report.submittedAt).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingReport} onOpenChange={(open) => !open && setEditingReport(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit Laporan {editingReport?.formNumber}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Deskripsi Pekerjaan</Label>
                <Textarea value={editWork} onChange={(e) => setEditWork(e.target.value)} rows={4} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Foto</Label>
                <div className="flex flex-wrap gap-2">
                  {editPhotos.map((photo, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border group">
                      <img src={photo} alt={`foto-${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditPhotos(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground">Tambah</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Catatan</Label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} className="rounded-xl resize-none" />
              </div>
              <Button onClick={handleSaveEdit} className="w-full">
                <Save className="h-4 w-4 mr-2" />Simpan Perubahan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
};

export default UserHistoryPage;
