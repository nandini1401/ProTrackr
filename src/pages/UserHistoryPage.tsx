import { useAuth } from "@/contexts/AuthContext";
import { UserLayout } from "@/components/UserLayout";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Clock } from "lucide-react";

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

const UserHistoryPage = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const reports = getUserReports(currentUser.id);

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
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">Terkirim</Badge>
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
      </div>
    </UserLayout>
  );
};

export default UserHistoryPage;
