import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useSharedData } from "@/contexts/SharedDataContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Download, FileText, FolderOpen } from "lucide-react";
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
  const { projects, forms, projectFiles } = useSharedData();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const project = projects.find((p) => p.id === id);


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

  const handleDownloadPdf = async () => {
    if (!project) return;
    setGeneratingPdf(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPage = (needed: number) => {
        if (y + needed > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }
      };

      // ===== HEADER =====
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Laporan Harian Project", margin, y + 4);
      y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Project   : ${project.name}`, margin, y); y += 5;
      doc.text(`Perusahaan: ${project.company}`, margin, y); y += 5;
      const periodeText = (dateFrom || dateTo)
        ? `${dateFrom ? format(dateFrom, "dd MMM yyyy", { locale: localeId }) : "..."} s/d ${dateTo ? format(dateTo, "dd MMM yyyy", { locale: localeId }) : "..."}`
        : `${project.startDate} s/d ${project.endDate}`;
      doc.text(`Periode   : ${periodeText}`, margin, y); y += 5;
      doc.text(`Total     : ${filteredForms.length} laporan`, margin, y); y += 8;

      // ===== TABLE =====
      const cols = [
        { label: "Tanggal", w: 22 },
        { label: "No. Form", w: 28 },
        { label: "Pelapor", w: 30 },
        { label: "Manpower", w: 18 },
        { label: "Pekerjaan", w: 50 },
        { label: "Material", w: 32 },
      ];
      const colX: number[] = [];
      let acc = margin;
      cols.forEach((c) => { colX.push(acc); acc += c.w; });

      const drawHeader = () => {
        doc.setFillColor(30, 41, 59);
        doc.rect(margin, y, contentWidth, 8, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        cols.forEach((c, i) => doc.text(c.label, colX[i] + 2, y + 5.5));
        y += 8;
        doc.setTextColor(30, 41, 59);
      };

      if (filteredForms.length === 0) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(120, 120, 120);
        doc.text("Tidak ada laporan pada periode ini.", margin, y);
        doc.setTextColor(0, 0, 0);
      } else {
        drawHeader();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        filteredForms.forEach((form, idx) => {
          const rowData = [
            form.date || "-",
            form.formNumber,
            form.reporterName,
            String(form.manpower || 0),
            form.workToday || "-",
            form.materials || "-",
          ];
          // compute row height based on wrapped text
          const wrapped = rowData.map((txt, i) => doc.splitTextToSize(txt, cols[i].w - 4));
          const lineCount = Math.max(...wrapped.map((w) => w.length));
          const rowH = Math.max(8, lineCount * 4 + 3);

          checkPage(rowH);
          if (y === margin) drawHeader();

          if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y, contentWidth, rowH, "F");
          }
          wrapped.forEach((lines, i) => {
            doc.text(lines, colX[i] + 2, y + 5);
          });
          // borders
          doc.setDrawColor(220, 220, 220);
          doc.line(margin, y + rowH, margin + contentWidth, y + rowH);
          y += rowH;
        });
      }

      // ===== FOOTER =====
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`Halaman ${i}/${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
        doc.text(`Dicetak: ${format(new Date(), "dd MMM yyyy HH:mm", { locale: localeId })}`, margin, pageHeight - 8);
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
