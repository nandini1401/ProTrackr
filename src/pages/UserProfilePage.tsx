import { useAuth } from "@/contexts/AuthContext";
import { UserLayout } from "@/components/UserLayout";
import { User, Mail, Phone, Briefcase, Building2, FolderKanban } from "lucide-react";

const UserProfilePage = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const initials = currentUser.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const profileFields = [
    { icon: User, label: "Nama Lengkap", value: currentUser.fullName },
    { icon: Mail, label: "Email", value: currentUser.email },
    { icon: Phone, label: "Nomor HP", value: currentUser.phone },
    { icon: Briefcase, label: "Posisi", value: currentUser.position },
    { icon: Building2, label: "Perusahaan", value: currentUser.company },
    { icon: FolderKanban, label: "Project", value: currentUser.project },
  ];

  return (
    <UserLayout title="Profil Saya">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Avatar card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary p-8 text-primary-foreground shadow-lg text-center">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground/10" />
          <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-primary-foreground/5" />
          <div className="relative z-10">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
              <span className="text-2xl font-bold">{initials}</span>
            </div>
            <h2 className="text-xl font-bold">{currentUser.fullName}</h2>
            <p className="text-sm text-primary-foreground/80">{currentUser.position} · {currentUser.company}</p>
          </div>
        </div>

        {/* Profile details */}
        <div className="bg-card rounded-2xl border shadow-sm divide-y">
          {profileFields.map((field) => (
            <div key={field.label} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
              <div className="p-2 rounded-xl bg-primary/10">
                <field.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-sm font-medium text-foreground">{field.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default UserProfilePage;
