import { DashboardLayout } from "@/components/DashboardLayout";
import { useSharedData } from "@/contexts/SharedDataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Phone, Mail, Globe, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const CompaniesPage = () => {
  const { companies, people, addCompany, refreshFromRegistrations } = useSharedData();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => { refreshFromRegistrations(); }, [refreshFromRegistrations]);

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lineOfBusiness.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate live employee counts
  const getEmployeeCount = (companyName: string) =>
    people.filter(p => p.company.toLowerCase() === companyName.toLowerCase()).length;

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addCompany({
      id: String(Date.now()),
      name: fd.get("name") as string,
      lineOfBusiness: fd.get("lineOfBusiness") as string,
      phone: fd.get("phone") as string,
      email: fd.get("email") as string,
      website: fd.get("website") as string,
      employeeCount: 0,
    });
    setDialogOpen(false);
    toast.success("Perusahaan berhasil ditambahkan");
  };

  return (
    <DashboardLayout title="Perusahaan">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari perusahaan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />Tambah Perusahaan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Perusahaan Baru</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div><Label>Nama Perusahaan</Label><Input name="name" required /></div>
                <div><Label>Bidang Usaha</Label><Input name="lineOfBusiness" required /></div>
                <div><Label>No. Telepon</Label><Input name="phone" required /></div>
                <div><Label>Email</Label><Input name="email" type="email" required /></div>
                <div><Label>Website</Label><Input name="website" /></div>
                <Button type="submit" className="w-full">Simpan</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company) => (
            <div key={company.id} className="bg-card rounded-lg border p-5 space-y-3 hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-semibold text-foreground">{company.name}</h3>
                <p className="text-sm text-muted-foreground">{company.lineOfBusiness}</p>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /><span>{company.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /><span>{company.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" /><span>{company.website}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm pt-2 border-t">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{getEmployeeCount(company.name)}</span>
                <span className="text-muted-foreground">orang terdaftar</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Tidak ada data ditemukan</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompaniesPage;
