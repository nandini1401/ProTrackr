import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useSharedData } from "@/contexts/SharedDataContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Download, FileText, ListChecks, FolderOpen } from "lucide-react";
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function getProgressBarColor(progress: number) {
  if (progress >= 100) return "[&>div]:bg-[hsl(var(--success))]";
  if (progress >= 50) return "[&>div]:bg-[hsl(var(--warning))]";
  return "[&>div]:bg-[hsl(var(--destructive))]";
}

function getProgressColorHex(progress: number) {
  if (progress >= 100) return "#16a34a";
  if (progress >= 50) return "#eab308";
  return "#dc2626";
}

const templateColors: Record<string, string> = {
  "Laporan Harian": "bg-primary/10 text-primary border-primary/20",
  "Laporan Kendala": "bg-warning/10 text-warning border-warning/20",
  "Izin Kerja": "bg-info/10 text-info border-info/20",
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, tasks, forms, projectFiles, people } = useSharedData();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const project = projects.find((p) => p.id === id);

  const projectTasks = tasks.filter((t) => t.projectId === id);
  const projectFormsRaw = forms.filter((f) => f.project === project?.name);
  const projectFileData = projectFiles.find((pf) => pf.projectId === id || pf.projectName === project?.name);

  const filteredForms = useMemo(() => {
    return projectFormsRaw.filter((f) => {
      const formDate = new Date(f.date);
      if (dateFrom && formDate < dateFrom) return false;
      if (dateTo && formDate > dateTo) return false;
      return true;
    });
  }, [projectFormsRaw, dateFrom, dateTo]);

  const loadImageAsBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const handleDownloadPdf = async () => {
    if (!project) return;
    setGeneratingPdf(true);
    try {
      const { default: jsPDF } = await import("jspdf");

      // Preload all form images
      const imagePromises = filteredForms.map((f) => loadImageAsBase64(f.reportPhotos?.[0] || ""));
      const formImages = await Promise.all(imagePromises);

      // Preload file images
      const fileImages: (string | null)[] = [];
      if (projectFileData) {
        const fileImgPromises = projectFileData.files.map((f) => loadImageAsBase64(f.url));
        fileImages.push(...(await Promise.all(fileImgPromises)));
      }

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPage = (needed: number) => {
        if (y + needed > 280) {
          doc.addPage();
          y = margin;
        }
      };

      // ===== HEADER =====
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(project.name, margin, 18);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${project.company}`, margin, 26);
      doc.text(`Periode: ${project.startDate} s/d ${project.endDate}`, margin, 33);

      // Status badge
      const statusLabel =
        project.status === "completed" ? "Completed" :
        project.status === "wip" ? "In Progress" : "Planned";
      const statusColor =
        project.status === "completed" ? [22, 163, 74] :
        project.status === "wip" ? [234, 179, 8] : [59, 130, 246];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(pageWidth - margin - 30, 12, 30, 8, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(statusLabel, pageWidth - margin - 15, 17.5, { align: "center" });

      y = 50;
      doc.setTextColor(30, 41, 59);

      // ===== PROJECT INFO =====
      doc.setFillColor(241, 245, 249); // slate-100
      doc.roundedRect(margin, y, contentWidth, 30, 3, 3, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Informasi Project", margin + 5, y + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Deskripsi: ${project.description}`, margin + 5, y + 15);

      // Progress bar
      const progressBarY = y + 20;
      const progressBarWidth = contentWidth - 50;
      doc.setFillColor(226, 232, 240); // slate-200
      doc.roundedRect(margin + 5, progressBarY, progressBarWidth, 5, 2, 2, "F");
      const progressColor = getProgressColorHex(project.progress);
      const r = parseInt(progressColor.slice(1, 3), 16);
      const g = parseInt(progressColor.slice(3, 5), 16);
      const b = parseInt(progressColor.slice(5, 7), 16);
      doc.setFillColor(r, g, b);
      doc.roundedRect(margin + 5, progressBarY, (progressBarWidth * project.progress) / 100, 5, 2, 2, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(r, g, b);
      doc.text(`${project.progress}%`, margin + 5 + progressBarWidth + 3, progressBarY + 4);
      doc.setTextColor(30, 41, 59);

      y += 38;

      // ===== LAPORAN / FORMS =====
      checkPage(20);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Laporan Masuk", margin, y);
      y += 3;

      if (dateFrom || dateTo) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const filterText = `Filter: ${dateFrom ? format(dateFrom, "dd MMM yyyy", { locale: localeId }) : "..."} - ${dateTo ? format(dateTo, "dd MMM yyyy", { locale: localeId }) : "..."}`;
        doc.text(filterText, margin, y + 4);
        doc.setTextColor(30, 41, 59);
        y += 7;
      }

      y += 4;

      if (filteredForms.length === 0) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(148, 163, 184);
        doc.text("Tidak ada laporan pada periode ini.", margin, y);
        doc.setTextColor(30, 41, 59);
        y += 10;
      } else {
        // Table header
        checkPage(12);
        doc.setFillColor(30, 41, 59);
        doc.rect(margin, y, contentWidth, 8, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        const cols = [margin + 2, margin + 30, margin + 60, margin + 100, margin + 140];
        doc.text("No. Form", cols[0], y + 5.5);
        doc.text("Tanggal", cols[1], y + 5.5);
        doc.text("Template", cols[2], y + 5.5);
        doc.text("Pekerjaan", cols[3], y + 5.5);
        doc.text("Status", cols[4], y + 5.5);
        y += 8;
        doc.setTextColor(30, 41, 59);

        filteredForms.forEach((form, idx) => {
          checkPage(10);
          if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y, contentWidth, 8, "F");
          }
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(form.formNumber, cols[0], y + 5.5);
          doc.text(form.date, cols[1], y + 5.5);
          doc.text(form.templateType, cols[2], y + 5.5);
          doc.text(form.workToday.substring(0, 28), cols[3], y + 5.5);

          // Status color badge
          const sColor =
            form.status === "submitted" ? [59, 130, 246] :
            form.status === "closed" ? [22, 163, 74] : [148, 163, 184];
          doc.setFillColor(sColor[0], sColor[1], sColor[2]);
          doc.roundedRect(cols[4], y + 1.5, 22, 5, 1.5, 1.5, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(6.5);
          doc.text(form.status.charAt(0).toUpperCase() + form.status.slice(1), cols[4] + 11, y + 5, { align: "center" });
          doc.setTextColor(30, 41, 59);

          y += 8;
        });

        // Detail per form with images
        y += 5;
        for (let fi = 0; fi < filteredForms.length; fi++) {
          const form = filteredForms[fi];
          const formIdx = fi;
          const imgData = formImages[formIdx] || null;
          const cardHeight = imgData ? 80 : 42;
          
          checkPage(cardHeight + 5);
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(margin, y, contentWidth, cardHeight, 3, 3, "F");

          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(`${form.formNumber} — ${form.templateType}`, margin + 5, y + 8);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.text(`Pelapor: ${form.reporterName}`, margin + 5, y + 15);
          doc.text(`Tanggal: ${form.date}`, margin + 5, y + 21);
          doc.text(`Manpower: ${form.manpower} orang`, margin + 5, y + 27);
          doc.text(`Material: ${form.materials}`, margin + 5, y + 33);
          doc.text(`Pekerjaan: ${form.workToday}`, margin + 5, y + 39);

          // Progress mini bar
          const miniBarX = margin + contentWidth - 55;
          doc.setFontSize(7);
          doc.text(`Progress: ${form.progress}%`, miniBarX, y + 8);
          doc.setFillColor(226, 232, 240);
          doc.roundedRect(miniBarX, y + 10, 45, 4, 1.5, 1.5, "F");
          const pc = getProgressColorHex(form.progress);
          doc.setFillColor(parseInt(pc.slice(1, 3), 16), parseInt(pc.slice(3, 5), 16), parseInt(pc.slice(5, 7), 16));
          doc.roundedRect(miniBarX, y + 10, (45 * form.progress) / 100, 4, 1.5, 1.5, "F");

          // Add report photo
          if (imgData) {
            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            doc.text("Foto Laporan:", margin + 5, y + 47);
            doc.setTextColor(30, 41, 59);
            try {
              doc.addImage(imgData, "JPEG", margin + 5, y + 49, 60, 28);
            } catch (e) {
              // skip if image fails
            }
            // Add border around image
            doc.setDrawColor(200, 200, 200);
            doc.rect(margin + 5, y + 49, 60, 28);
            doc.setDrawColor(0, 0, 0);
          }

          y += cardHeight + 5;
        }
      }

      // ===== TASKS =====
      checkPage(20);
      y += 5;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Daftar Tugas", margin, y);
      y += 7;

      if (projectTasks.length === 0) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(148, 163, 184);
        doc.text("Tidak ada tugas.", margin, y);
        doc.setTextColor(30, 41, 59);
        y += 10;
      } else {
        projectTasks.forEach((task) => {
          checkPage(14);
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text(task.title, margin + 4, y + 5);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.text(`${task.assignee} · ${task.startDate} — ${task.endDate}`, margin + 4, y + 10);

          // Task progress
          const taskBarX = margin + contentWidth - 50;
          doc.setFillColor(226, 232, 240);
          doc.roundedRect(taskBarX, y + 2.5, 35, 3.5, 1.5, 1.5, "F");
          const tc = getProgressColorHex(task.progress);
          doc.setFillColor(parseInt(tc.slice(1, 3), 16), parseInt(tc.slice(3, 5), 16), parseInt(tc.slice(5, 7), 16));
          doc.roundedRect(taskBarX, y + 2.5, (35 * task.progress) / 100, 3.5, 1.5, 1.5, "F");
          doc.setFontSize(7);
          doc.text(`${task.progress}%`, taskBarX + 37, y + 5.5);

          // Status
          const tsColor =
            task.status === "completed" ? [22, 163, 74] :
            task.status === "wip" ? [234, 179, 8] : [59, 130, 246];
          doc.setFillColor(tsColor[0], tsColor[1], tsColor[2]);
          doc.roundedRect(taskBarX, y + 7.5, 18, 4, 1.5, 1.5, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(6);
          const tsLabel = task.status === "completed" ? "Done" : task.status === "wip" ? "WIP" : "Planned";
          doc.text(tsLabel, taskBarX + 9, y + 10.5, { align: "center" });
          doc.setTextColor(30, 41, 59);

          y += 15;
        });
      }

      // ===== FILES WITH IMAGES =====
      if (projectFileData && projectFileData.files.length > 0) {
        checkPage(20);
        y += 5;
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("Berkas / Dokumentasi", margin, y);
        y += 7;

        for (let fi = 0; fi < projectFileData.files.length; fi++) {
          const file = projectFileData.files[fi];
          const imgData = fileImages[fi];
          checkPage(45);
          
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(margin, y, contentWidth, 40, 2, 2, "F");
          
          if (imgData) {
            try {
              doc.addImage(imgData, "JPEG", margin + 3, y + 2, 50, 36);
            } catch (e) {}
            doc.setDrawColor(200, 200, 200);
            doc.rect(margin + 3, y + 2, 50, 36);
            doc.setDrawColor(0, 0, 0);
          }

          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text(file.name, margin + 58, y + 10);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.text(`Diupload oleh: ${file.uploadedBy}`, margin + 58, y + 18);
          doc.text(`Tanggal: ${file.date}`, margin + 58, y + 25);

          y += 44;
        }
      }

      // ===== FOOTER =====
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(241, 245, 249);
        doc.rect(0, 287, pageWidth, 10, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text(`ProjectLog — ${project.name}`, margin, 293);
        doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin, 293, { align: "right" });
        doc.text(`Dicetak: ${format(new Date(), "dd MMM yyyy HH:mm", { locale: localeId })}`, pageWidth / 2, 293, { align: "center" });
      }

      doc.save(`Laporan_${project.name.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF berhasil diunduh!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Gagal mengunduh PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (!project) {
    return (
      <DashboardLayout title="Project Tidak Ditemukan">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Project tidak ditemukan.</p>
          <Button onClick={() => navigate("/projects")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={project.name}>
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Projects
        </Button>

        {/* Project Header Card */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">{project.name}</h2>
              <p className="text-muted-foreground">{project.company}</p>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              <span>{project.startDate} — {project.endDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ListChecks className="h-4 w-4" />
              <span>{projectTasks.length} Tugas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>{projectFormsRaw.length} Laporan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4" />
              <span>{projectFileData?.files.length || 0} Berkas</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress Keseluruhan</span>
              <span className="font-semibold text-foreground">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className={`h-3 ${getProgressBarColor(project.progress)}`} />
          </div>
        </div>

        {/* Laporan Section */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Laporan Masuk</h3>
              <Badge variant="secondary" className="ml-1">{filteredForms.length}</Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Date From */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("w-[150px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {dateFrom ? format(dateFrom, "dd MMM yy", { locale: localeId }) : "Dari tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {/* Date To */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("w-[150px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {dateTo ? format(dateTo, "dd MMM yy", { locale: localeId }) : "Sampai tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {(dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>
                  Reset
                </Button>
              )}
              {/* Download PDF */}
              <Button size="sm" onClick={handleDownloadPdf} disabled={generatingPdf}>
                <Download className="mr-2 h-4 w-4" />
                {generatingPdf ? "Membuat PDF..." : "Download PDF"}
              </Button>
            </div>
          </div>

          {filteredForms.length > 0 ? (
            <div className="space-y-3">
              {filteredForms.map((form) => (
                <div key={form.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">{form.formNumber}</span>
                        <Badge variant="outline" className={templateColors[form.templateType]}>
                          {form.templateType}
                        </Badge>
                        <StatusBadge status={form.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{form.workToday}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📅 {form.date}</span>
                        <span>👷 {form.reporterName}</span>
                        <span>👥 {form.manpower} orang</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Material: {form.materials}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {form.reportPhotos?.[0] && <img src={form.reportPhotos[0]} alt="Foto laporan" className="h-16 w-24 object-cover rounded-md border" />}
                      <div className="flex items-center gap-2 w-32">
                        <Progress value={form.progress} className={`h-2 flex-1 ${getProgressBarColor(form.progress)}`} />
                        <span className="text-xs font-medium text-foreground">{form.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Tidak ada laporan pada periode ini.
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Tugas</h3>
            <Badge variant="secondary" className="ml-1">{projectTasks.length}</Badge>
          </div>
          {projectTasks.length > 0 ? (
            <div className="space-y-2">
              {projectTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-3 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.assignee} · {task.startDate} — {task.endDate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-28">
                      <Progress value={task.progress} className={`h-2 flex-1 ${getProgressBarColor(task.progress)}`} />
                      <span className="text-xs font-medium">{task.progress}%</span>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">Tidak ada tugas.</div>
          )}
        </div>

        {/* Files Section */}
        {projectFileData && projectFileData.files.length > 0 && (
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Berkas</h3>
              <Badge variant="secondary" className="ml-1">{projectFileData.files.length}</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {projectFileData.files.map((file) => (
                <div key={file.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img src={file.url} alt={file.name} className="w-full h-24 object-cover" />
                  <div className="p-2">
                    <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.uploadedBy} · {file.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetailPage;
