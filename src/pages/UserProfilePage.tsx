import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserLayout } from "@/components/UserLayout";
import { User, Mail, Phone, Briefcase, Building2, FolderKanban, Camera, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const UserProfilePage = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: currentUser?.fullName || "",
    phone: currentUser?.phone || "",
    position: currentUser?.position || "",
    company: currentUser?.company || "",
    project: currentUser?.project || "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const initials = currentUser.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateCurrentUser({ avatarUrl: dataUrl });
      toast.success("Foto profil berhasil diperbarui");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateCurrentUser(form);
    setEditing(false);
    toast.success("Profil berhasil diperbarui");
  };

  const handleCancel = () => {
    setForm({
      fullName: currentUser.fullName,
      phone: currentUser.phone,
      position: currentUser.position,
      company: currentUser.company,
      project: currentUser.project,
    });
    setEditing(false);
  };

  const profileFields = [
    { icon: User, label: "Nama Lengkap", key: "fullName" as const, value: currentUser.fullName, editable: true },
    { icon: Mail, label: "Email", key: "email" as const, value: currentUser.email, editable: false },
    { icon: Phone, label: "Nomor HP", key: "phone" as const, value: currentUser.phone, editable: true },
    { icon: Briefcase, label: "Posisi", key: "position" as const, value: currentUser.position, editable: true },
    { icon: Building2, label: "Perusahaan", key: "company" as const, value: currentUser.company, editable: true },
    { icon: FolderKanban, label: "Project", key: "project" as const, value: currentUser.project, editable: true },
  ];

  return (
    <UserLayout title="Profil">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Avatar card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary p-8 text-primary-foreground shadow-lg text-center">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground/10" />
          <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-primary-foreground/5" />
          <div className="relative z-10">
            <div
              className="mx-auto w-20 h-20 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg relative cursor-pointer group overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">{initials}</span>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <h2 className="text-xl font-bold">{currentUser.fullName}</h2>
            <p className="text-sm text-primary-foreground/80">{currentUser.position} · {currentUser.company}</p>
          </div>
        </div>

        {/* Profile details */}
        <div className="bg-card rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-foreground">Detail Profil</h3>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-3.5 w-3.5 mr-1" /> Batal
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Simpan
                </Button>
              </div>
            )}
          </div>
          <div className="divide-y">
            {profileFields.map((field) => (
              <div key={field.label} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                <div className="p-2 rounded-xl bg-primary/10">
                  <field.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  {editing && field.editable ? (
                    <Input
                      value={(form as any)[field.key] || ""}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground">{field.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserProfilePage;
