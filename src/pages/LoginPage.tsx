import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"admin" | "user">("admin");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const success = login(username, password, role);
      setLoading(false);
      if (success) {
        navigate(role === "admin" ? "/" : "/user");
      } else {
        setError(role === "admin" ? "Username atau password salah" : "Email atau password salah");
      }
    }, 500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin") {
      toast.success(
        `Kredensial admin telah dikirim ke ${forgotEmail}. Username: Admin, Password: Admin2026`,
        { duration: 8000 }
      );
    } else {
      toast.success(`Link reset password telah dikirim ke ${forgotEmail}`);
    }
    setForgotOpen(false);
    setForgotEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <img src="/logo-protrackr.png" alt="ProTrackr" className="mx-auto h-20 w-auto" />
          <p className="text-sm text-muted-foreground">Sistem Informasi Laporan Harian Project</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-lg border p-6 space-y-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "user")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{role === "admin" ? "Username" : "Email"}</Label>
            <Input
              type="text"
              placeholder={role === "admin" ? "Username" : "Email"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="w-full text-sm text-primary hover:underline"
          >
            Lupa Password?
          </button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Daftar di sini
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            {" "}
          </p>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Lupa Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="admin@company.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {role === "admin"
                ? "Masukkan email admin untuk menerima kredensial login."
                : "Masukkan email Anda untuk menerima link reset password."}
            </p>
            <Button type="submit" className="w-full">Kirim</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
