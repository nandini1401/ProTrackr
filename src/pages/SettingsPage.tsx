import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { settings, updateSettings } = useUserSettings();
  const [fullName, setFullName] = useState(settings.fullName);
  const [email, setEmail] = useState(settings.email);
  const [jobTitle, setJobTitle] = useState(settings.jobTitle);
  const [phone, setPhone] = useState(settings.phone);
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const initials = fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarUrl(dataUrl);
      updateSettings({ fullName, email, jobTitle, phone, avatarUrl: dataUrl });
      toast.success("Foto profil berhasil diperbarui");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    updateSettings({ fullName, email, jobTitle, phone, avatarUrl });
    toast.success("Profil berhasil disimpan");
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast.error("Masukkan password saat ini");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password berhasil diubah");
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h3 className="text-base font-semibold text-foreground">Profile Settings</h3>
          <Separator />

          <div className="flex items-center gap-4">
            <div
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="h-20 w-20">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-3.5 w-3.5 mr-1.5" /> Ubah Foto
              </Button>
              {avatarUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-destructive"
                  onClick={() => {
                    setAvatarUrl("");
                    updateSettings({ fullName, email, jobTitle, phone, avatarUrl: "" });
                    toast.success("Foto profil dihapus");
                  }}
                >
                  Hapus
                </Button>
              )}
              <p className="text-xs text-muted-foreground mt-1">JPG/PNG, maks. 5MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSaveProfile}>Save Changes</Button>
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h3 className="text-base font-semibold text-foreground">Change Password</h3>
          <Separator />
          <div className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleChangePassword}>Update Password</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
