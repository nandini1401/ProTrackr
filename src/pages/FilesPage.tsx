import { DashboardLayout } from "@/components/DashboardLayout";
import { useSharedData } from "@/contexts/SharedDataContext";
import { Button } from "@/components/ui/button";
import { FolderOpen, ChevronLeft, User, Calendar } from "lucide-react";
import { useState, useMemo } from "react";

const FilesPage = () => {
  const { projects, projectFiles } = useSharedData();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const folders = useMemo(() => {
    return projects.map((p) => {
      const existing = projectFiles.find((pf) => pf.projectId === p.id || pf.projectName === p.name);
      return {
        projectId: p.id,
        projectName: p.name,
        files: existing?.files || [],
      };
    });
  }, [projects, projectFiles]);

  const currentFolder = folders.find((f) => f.projectId === selectedProject);

  return (
    <DashboardLayout title="Berkas">
      <div className="space-y-4">
        {!selectedProject ? (
          <>
            <p className="text-sm text-muted-foreground">Pilih folder project untuk melihat berkas laporan.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((pf) => (
                <button
                  key={pf.projectId}
                  onClick={() => setSelectedProject(pf.projectId)}
                  className="bg-card rounded-lg border p-6 text-left hover:shadow-md transition-shadow hover:border-primary/50 space-y-2"
                >
                  <FolderOpen className="h-10 w-10 text-primary" />
                  <h3 className="font-semibold text-foreground">{pf.projectName}</h3>
                  <p className="text-sm text-muted-foreground">{pf.files.length} file</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedProject(null)}>
                <ChevronLeft className="h-4 w-4 mr-1" />Kembali
              </Button>
              <h2 className="text-lg font-semibold text-foreground">{currentFolder?.projectName}</h2>
            </div>

            {currentFolder && currentFolder.files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentFolder.files.map((file) => (
                  <div key={file.id} className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-muted relative">
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" /><span>{file.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" /><span>{file.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">Belum ada berkas untuk project ini</div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FilesPage;
