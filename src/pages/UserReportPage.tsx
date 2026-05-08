import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSharedData, generateFormNumber } from "@/contexts/SharedDataContext";
import { UserLayout } from "@/components/UserLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera, Send, FileText } from "lucide-react";

const saveLocalReportCache = (userId: string, report: any) => {
  try {
    const existing = JSON.parse(localStorage.getItem(`user_reports_${userId}`) || "[]");
    const lightweightReport = { ...report, photos: [] };
    const compact = [lightweightReport, ...existing]
      .slice(0, 25)
      .map((item: any) => ({ ...item, photos: [] }));
    localStorage.setItem(`user_reports_${userId}`, JSON.stringify(compact));
  } catch (err) {
    try { localStorage.removeItem(`user_reports_${userId}`); } catch {}
    console.warn("Local report cache skipped:", err);
  }
};

const UserReportPage = () => {
  const { currentUser } = useAuth();
  const { addForm, addFileToProject, addActivity } = useSharedData();
  const [workDescription, setWorkDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const userProjects = (currentUser?.project || "").split(",").map((s) => s.trim()).filter(Boolean);
  const [selectedProject, setSelectedProject] = useState<string>(userProjects[0] || "");

  if (!currentUser) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDescription.trim()) {
      toast.error("Deskripsi pekerjaan wajib diisi");
      return;
    }
    if (userProjects.length > 1 && !selectedProject) {
      toast.error("Pilih project untuk laporan ini");
      return;
    }
    setSubmitting(true);

    const formNumber = generateFormNumber();
    const today = new Date().toISOString().split("T")[0];
    const snapshotWork = workDescription;
    const snapshotNotes = notes;
    const snapshotPhotos = photos;

    // Reset UI immediately for snappy feel
    setWorkDescription("");
    setNotes("");
    setPhotos([]);
    toast.success("Laporan berhasil dikirim!");
    setSubmitting(false);


    // Save to user's own report history as a lightweight cache only.
    // Never let full browser storage block sending the report to admin.
    saveLocalReportCache(currentUser.id, {
      id: crypto.randomUUID(),
      formNumber,
      date: today,
      workDescription: snapshotWork,
      notes: snapshotNotes,
      photos: snapshotPhotos,
      submittedAt: new Date().toISOString(),
    });

    // Fire-and-forget the network insert; realtime will sync admin views
    addForm({
      formNumber,
      project: selectedProject || userProjects[0] || currentUser.project,
      templateType: "Laporan Harian",
      date: today,
      status: "submitted",
      progress: 0,
      workToday: snapshotWork,
      manpower: 1,
      materials: snapshotNotes || "-",
      reporterName: currentUser.fullName,
      reporterPhone: currentUser.phone,
      reporterAvatar: currentUser.avatarUrl || "",
      reportPhotos: snapshotPhotos,
    }).catch((err) => {
      console.error("Gagal kirim laporan:", err);
      toast.error("Gagal sinkron ke server, laporan tersimpan lokal");
    }).finally(() => setSubmitting(false));

    addActivity({
      action: `Laporan harian submitted (${formNumber})`,
      project: selectedProject || userProjects[0] || currentUser.project,
      user: currentUser.fullName,
      userAvatar: currentUser.avatarUrl,
    });
  };

  return (
    <UserLayout title="Buat Laporan">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Project info card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary p-6 text-primary-foreground shadow-lg">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-foreground/10" />
          <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-primary-foreground/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Laporan Harian</h2>
            </div>
            <p className="text-sm text-primary-foreground/80">Project: {userProjects.length > 1 ? (selectedProject || "(pilih di bawah)") : (currentUser.project || "-")}</p>
            <p className="text-sm text-primary-foreground/80">Tanggal: {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitReport} className="bg-card rounded-2xl border shadow-sm p-6 space-y-5">
          {userProjects.length > 1 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Pilih Project</Label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">-- Pilih project --</option>
                {userProjects.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Detail Pekerjaan Hari ini?</Label>
            <Textarea
              placeholder="Jelaskan pekerjaan yang dilakukan hari ini..."
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              rows={4}
              className="rounded-xl resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Foto Bukti Kerja</Label>
            <div className="flex flex-wrap gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-border shadow-sm group">
                  <img src={photo} alt={`foto-${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-bold"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground whitespace-pre-wrap text-center leading-tight">
                  {"    "}Tambah foto{"\n"}[bukti pekerjaan]
                </span>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Catatan Tambahan (Opsional)</Label>
            <Textarea
              placeholder="Catatan atau kendala yang dihadapi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all" disabled={submitting}>
            {submitting ? (
              "Mengirim..."
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Kirim Laporan
              </span>
            )}
          </Button>
        </form>
      </div>
    </UserLayout>
  );
};

export default UserReportPage;
