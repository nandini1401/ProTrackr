export const companies = [
  { id: "1", name: "PT Konstruksi Utama", lineOfBusiness: "Construction", phone: "+62 21 5551234", email: "info@konstruksiutama.co.id", website: "www.konstruksiutama.co.id", employeeCount: 3 },
  { id: "2", name: "PT Energi Nusantara", lineOfBusiness: "Energy", phone: "+62 21 5554567", email: "info@energinusantara.co.id", website: "www.energinusantara.co.id", employeeCount: 1 },
  { id: "3", name: "PT Infrastruktur Mandiri", lineOfBusiness: "Infrastructure", phone: "+62 21 5557890", email: "info@inframandiri.co.id", website: "www.inframandiri.co.id", employeeCount: 1 },
  { id: "4", name: "PT Teknik Jaya", lineOfBusiness: "Engineering", phone: "+62 21 5552345", email: "info@teknikjaya.co.id", website: "www.teknikjaya.co.id", employeeCount: 1 },
];

export const people = [
  { id: "1", name: "Ahmad Susanto", email: "ahmad@konstruksiutama.co.id", phone: "+62 812 1234 5678", company: "PT Konstruksi Utama", jobTitle: "Project Manager", role: "project_manager" as const, avatar: "https://i.pravatar.cc/150?img=1", progress: 45, startDate: "2025-01-15" },
  { id: "2", name: "Budi Hartono", email: "budi@energinusantara.co.id", phone: "+62 813 2345 6789", company: "PT Energi Nusantara", jobTitle: "Site Engineer", role: "engineer" as const, avatar: "https://i.pravatar.cc/150?img=2", progress: 72, startDate: "2025-03-01" },
  { id: "3", name: "Citra Dewi", email: "citra@inframandiri.co.id", phone: "+62 814 3456 7890", company: "PT Infrastruktur Mandiri", jobTitle: "Admin", role: "admin" as const, avatar: "https://i.pravatar.cc/150?img=5", progress: 10, startDate: "2025-06-01" },
  { id: "4", name: "Dian Pratama", email: "dian@teknikjaya.co.id", phone: "+62 815 4567 8901", company: "PT Teknik Jaya", jobTitle: "Field Supervisor", role: "engineer" as const, avatar: "https://i.pravatar.cc/150?img=3", progress: 100, startDate: "2024-08-01" },
  { id: "5", name: "Eka Ramadhan", email: "eka@konstruksiutama.co.id", phone: "+62 816 5678 9012", company: "PT Konstruksi Utama", jobTitle: "Viewer", role: "viewer" as const, avatar: "https://i.pravatar.cc/150?img=4", progress: 25, startDate: "2025-04-01" },
  { id: "6", name: "Fajar Hidayat", email: "fajar@konstruksiutama.co.id", phone: "+62 817 6789 0123", company: "PT Konstruksi Utama", jobTitle: "Drafter", role: "engineer" as const, avatar: "https://i.pravatar.cc/150?img=7", progress: 60, startDate: "2025-02-15" },
];

export const projects = [
  { id: "1", name: "Aplikasi E-Learning", description: "Pembuatan platform e-learning untuk pelatihan karyawan", company: "PT Konstruksi Utama", startDate: "2025-01-15", endDate: "2025-12-31", progress: 45, status: "wip" as const },
  { id: "2", name: "Website Perusahaan", description: "Redesign dan pembuatan website company profile", company: "PT Energi Nusantara", startDate: "2025-03-01", endDate: "2025-09-30", progress: 72, status: "wip" as const },
  { id: "3", name: "Renovasi Gedung Kantor Pusat", description: "Renovasi total gedung kantor pusat 5 lantai", company: "PT Infrastruktur Mandiri", startDate: "2025-06-01", endDate: "2026-03-31", progress: 10, status: "planned" as const },
  { id: "4", name: "Perbaikan Jalan Tol Seksi 3", description: "Perbaikan dan perawatan jalan tol seksi 3", company: "PT Teknik Jaya", startDate: "2024-08-01", endDate: "2025-02-28", progress: 100, status: "completed" as const },
  { id: "5", name: "Pembangunan Dermaga Pelabuhan", description: "Pembangunan dermaga baru di pelabuhan utama", company: "PT Konstruksi Utama", startDate: "2025-04-01", endDate: "2026-06-30", progress: 25, status: "wip" as const },
];

export const tasks = [
  { id: "1", projectId: "1", projectName: "Aplikasi E-Learning", title: "Desain UI/UX Dashboard", assignee: "Ahmad Susanto", status: "completed" as const, startDate: "2025-01-15", endDate: "2025-02-15", progress: 100 },
  { id: "2", projectId: "1", projectName: "Aplikasi E-Learning", title: "Pengembangan Backend API", assignee: "Budi Hartono", status: "wip" as const, startDate: "2025-02-01", endDate: "2025-05-30", progress: 60 },
  { id: "3", projectId: "1", projectName: "Aplikasi E-Learning", title: "Minta Penawaran Dana Tambahan", assignee: "Citra Dewi", status: "planned" as const, startDate: "2025-04-10", endDate: "2025-04-20", progress: 0 },
  { id: "4", projectId: "2", projectName: "Website Perusahaan", title: "Integrasi Payment Gateway", assignee: "Dian Pratama", status: "wip" as const, startDate: "2025-03-15", endDate: "2025-06-15", progress: 40 },
  { id: "5", projectId: "2", projectName: "Website Perusahaan", title: "Testing & QA", assignee: "Eka Ramadhan", status: "planned" as const, startDate: "2025-06-01", endDate: "2025-07-30", progress: 0 },
  { id: "6", projectId: "5", projectName: "Pembangunan Dermaga Pelabuhan", title: "Survei Lokasi", assignee: "Fajar Hidayat", status: "completed" as const, startDate: "2025-04-01", endDate: "2025-04-15", progress: 100 },
  { id: "7", projectId: "5", projectName: "Pembangunan Dermaga Pelabuhan", title: "Pengerukan Area Dermaga", assignee: "Ahmad Susanto", status: "wip" as const, startDate: "2025-04-10", endDate: "2025-06-30", progress: 30 },
  { id: "8", projectId: "3", projectName: "Renovasi Gedung Kantor Pusat", title: "Izin Kerja Panas", assignee: "Citra Dewi", status: "planned" as const, startDate: "2025-06-01", endDate: "2025-06-15", progress: 0 },
];

export const projectFiles = [
  { id: "1", projectId: "1", projectName: "Aplikasi E-Learning", files: [
    { id: "f1", name: "Screenshot Dashboard v1.png", url: "https://picsum.photos/seed/el1/400/300", uploadedBy: "Ahmad Susanto", date: "2025-03-10" },
    { id: "f2", name: "Mockup Login Page.png", url: "https://picsum.photos/seed/el2/400/300", uploadedBy: "Ahmad Susanto", date: "2025-03-15" },
    { id: "f3", name: "Laporan Mingguan W12.png", url: "https://picsum.photos/seed/el3/400/300", uploadedBy: "Budi Hartono", date: "2025-03-22" },
  ]},
  { id: "2", projectId: "2", projectName: "Website Perusahaan", files: [
    { id: "f4", name: "Design Homepage.png", url: "https://picsum.photos/seed/wp1/400/300", uploadedBy: "Dian Pratama", date: "2025-04-01" },
    { id: "f5", name: "Foto Progres Backend.png", url: "https://picsum.photos/seed/wp2/400/300", uploadedBy: "Eka Ramadhan", date: "2025-04-05" },
  ]},
  { id: "3", projectId: "5", projectName: "Pembangunan Dermaga Pelabuhan", files: [
    { id: "f6", name: "Foto Lokasi Survei.png", url: "https://picsum.photos/seed/dp1/400/300", uploadedBy: "Fajar Hidayat", date: "2025-04-02" },
    { id: "f7", name: "Laporan Pengerukan.png", url: "https://picsum.photos/seed/dp2/400/300", uploadedBy: "Ahmad Susanto", date: "2025-04-12" },
    { id: "f8", name: "Foto Alat Berat.png", url: "https://picsum.photos/seed/dp3/400/300", uploadedBy: "Fajar Hidayat", date: "2025-04-14" },
  ]},
];

export const forms = [
  { id: "1", formNumber: "DLR-2025-001", project: "Aplikasi E-Learning", templateType: "Laporan Harian" as const, date: "2025-04-10", status: "submitted" as const, progress: 45, workToday: "Pemasangan tiang pancang area barat", manpower: 25, materials: "Beton K-350, Baja tulangan D25" },
  { id: "2", formNumber: "DLR-2025-002", project: "Website Perusahaan", templateType: "Laporan Harian" as const, date: "2025-04-10", status: "draft" as const, progress: 72, workToday: "Instalasi panel surya blok C", manpower: 12, materials: "Panel Surya 450W, Mounting bracket" },
  { id: "3", formNumber: "KDL-2025-001", project: "Aplikasi E-Learning", templateType: "Laporan Kendala" as const, date: "2025-04-09", status: "closed" as const, progress: 44, workToday: "Kendala cuaca hujan deras", manpower: 0, materials: "-" },
  { id: "4", formNumber: "DLR-2025-003", project: "Pembangunan Dermaga Pelabuhan", templateType: "Laporan Harian" as const, date: "2025-04-10", status: "submitted" as const, progress: 25, workToday: "Pengerukan area dermaga", manpower: 30, materials: "Batu kali, Pasir, Semen" },
  { id: "5", formNumber: "IJK-2025-001", project: "Renovasi Gedung Kantor Pusat", templateType: "Izin Kerja" as const, date: "2025-04-08", status: "submitted" as const, progress: 10, workToday: "Izin kerja panas (hot work permit)", manpower: 5, materials: "Mesin las, Elektroda" },
];

export const recentActivities = [
  { action: "Laporan harian submitted", project: "Aplikasi E-Learning", user: "Ahmad Susanto", time: "10 menit lalu" },
  { action: "Project progress updated", project: "Website Perusahaan", user: "Budi Hartono", time: "1 jam lalu" },
  { action: "Laporan kendala closed", project: "Aplikasi E-Learning", user: "Citra Dewi", time: "2 jam lalu" },
  { action: "New form created", project: "Dermaga Pelabuhan", user: "Dian Pratama", time: "3 jam lalu" },
  { action: "Company data updated", project: "-", user: "Citra Dewi", time: "5 jam lalu" },
];
