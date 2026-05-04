import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; company_id: string | null }[]>([]);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", position: "",
    company: "", project: "", password: "", confirmPassword: "",
  });

  useEffect(() => {
    const load = async () => {
      const [c, p] = await Promise.all([
        supabase.from("companies").select("id, name").order("name"),
        supabase.from("projects").select("id, name, company_id").order("name"),
      ]);
      setCompanies(c.data || []);
      setProjects(p.data || []);
    };
    load();
    // realtime updates
    const ch = supabase
      .channel("register-lookups")
      .on("postgres_changes", { event: "*", schema: "public", table: "companies" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const selectedCompany = companies.find((c) => c.name === form.company);
  const filteredProjects = selectedCompany
    ? projects.filter((p) => p.company_id === selectedCompany.id)
    : [];

  const handleChange = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "company") next.project = "";
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    setLoading(true);
    const result = await register({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      position: form.position,
      company: form.company,
      project: form.project,
      password: form.password,
    });
    setLoading(false);
    if (result.success) {
      toast.success("Pendaftaran berhasil! Silakan login.");
      navigate("/login");
    } else {
      toast.error(result.error || "Pendaftaran gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <img src="/logo-protrackr.png" alt="Logo" className="mx-auto h-20 w-auto" />
          <p className="text-sm text-muted-foreground">Daftar sebagai pekerja / user baru</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 space-y-4">
          <div className="space-y-2">
            <Label>Nama Lengkap</Label>
            <Input placeholder="Nama lengkap" value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="email@contoh.com" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Nomor HP</Label>
            <Input placeholder="+62 812 xxxx xxxx" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Posisi / Jabatan</Label>
            <Input placeholder="Contoh: Site Engineer" value={form.position} onChange={(e) => handleChange("position", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Dari Perusahaan</Label>
            {companies.length > 0 ? (
              <Select value={form.company} onValueChange={(v) => handleChange("company", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih perusahaan" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input placeholder="Nama perusahaan (belum ada di sistem)" value={form.company} onChange={(e) => handleChange("company", e.target.value)} required />
            )}
            <p className="text-xs text-muted-foreground">
              {companies.length > 0 ? "Daftar dari admin (otomatis sinkron)" : "Belum ada perusahaan terdaftar — admin perlu menambahkan dulu, atau ketik manual"}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Project yang Dipegang</Label>
            {!form.company ? (
              <Input disabled placeholder="Pilih perusahaan terlebih dahulu" />
            ) : filteredProjects.length > 0 ? (
              <Select value={form.project} onValueChange={(v) => handleChange("project", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih project" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProjects.map((p) => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input placeholder="Belum ada project untuk perusahaan ini — ketik manual atau kosongkan" value={form.project} onChange={(e) => handleChange("project", e.target.value)} />
            )}
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Konfirmasi Password</Label>
            <Input type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Mendaftar..." : "Daftar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
