import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Types
export interface PersonData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string; // resolved name
  companyId?: string | null;
  jobTitle: string;
  role: string;
  avatar: string;
  progress: number;
  startDate: string;
}

export interface CompanyData {
  id: string;
  name: string;
  lineOfBusiness: string;
  phone: string;
  email: string;
  website: string;
  employeeCount: number;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  company: string;
  companyId?: string | null;
  startDate: string;
  endDate: string;
  progress: number;
  status: "planned" | "wip" | "completed";
  memberCount: number;
}

export interface TaskData {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  assignee: string;
  assigneeId?: string | null;
  status: "planned" | "wip" | "completed";
  startDate: string;
  endDate: string;
  progress: number;
}

export interface FormData {
  id: string;
  formNumber: string;
  project: string;
  projectId?: string;
  templateType: "Laporan Harian" | "Laporan Kendala" | "Izin Kerja";
  date: string;
  status: "draft" | "submitted" | "closed";
  progress: number;
  workToday: string;
  manpower: number;
  materials: string;
  reporterName: string;
  reporterPhone: string;
  reporterAvatar: string;
  reportPhotos: string[];
  submittedBy?: string | null;
  createdAt?: string;
}

export interface FileData {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  date: string;
}

export interface ActivityData {
  id: string;
  action: string;
  project: string;
  user: string;
  userAvatar?: string;
  time: string;
  timestamp: number;
}

export interface ProjectFileData {
  id: string;
  projectId: string;
  projectName: string;
  files: FileData[];
}

interface SharedDataContextType {
  people: PersonData[];
  companies: CompanyData[];
  projects: ProjectData[];
  tasks: TaskData[];
  forms: FormData[];
  projectFiles: ProjectFileData[];
  activities: ActivityData[];
  loading: boolean;
  addPerson: (person: Omit<PersonData, "id">) => Promise<void>;
  updatePerson: (id: string, person: Partial<PersonData>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  addCompany: (company: Omit<CompanyData, "id" | "employeeCount">) => Promise<void>;
  addProject: (project: Omit<ProjectData, "id">) => Promise<void>;
  updateProject: (id: string, project: Partial<ProjectData>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addForm: (form: Omit<FormData, "id">) => Promise<void>;
  updateForm: (id: string, data: Partial<FormData>) => Promise<void>;
  deleteForm: (id: string) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addActivity: (activity: Omit<ActivityData, "id" | "time" | "timestamp">) => void;
  addFileToProject: (projectName: string, file: FileData) => Promise<void>;
  deleteProjectFile: (projectId: string, fileId: string) => Promise<void>;
  refreshFromRegistrations: () => void;
  getFormCount: () => number;
}

const SharedDataContext = createContext<SharedDataContextType | null>(null);

let formCounter = 0;
function generateFormNumber(): string {
  formCounter++;
  return `DLR-2025-${String(formCounter).padStart(3, "0")}`;
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("shared_data_sync") : null;

export function SharedDataProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<PersonData[]>([]);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [forms, setForms] = useState<FormData[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFileData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>(() => {
    try { return JSON.parse(localStorage.getItem("shared_activities") || "[]"); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);

  // Persist activities locally (admin-only feed)
  useEffect(() => { localStorage.setItem("shared_activities", JSON.stringify(activities)); }, [activities]);

  const fetchAll = useCallback(async () => {
    const [comp, peep, proj, tsk, frm, pf, prof] = await Promise.all([
      supabase.from("companies").select("*").order("created_at", { ascending: false }),
      supabase.from("people").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("forms").select("*").order("created_at", { ascending: false }),
      supabase.from("project_files").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id,email,avatar_url,project,company"),
    ]);

    const profilesData = (prof.data || []) as Array<{ user_id: string; email: string; avatar_url: string | null; project: string | null; company: string | null }>;
    const profileByEmail = new Map(profilesData.map(p => [(p.email || "").toLowerCase(), p]));

    const companiesData: CompanyData[] = (comp.data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      lineOfBusiness: c.line_of_business || "",
      phone: c.phone || "",
      email: c.email || "",
      website: c.website || "",
      employeeCount: 0,
    }));

    const peopleData: PersonData[] = (peep.data || []).map((p: any) => {
      const company = companiesData.find(c => c.id === p.company_id);
      // Sync avatar from user's profile if exists (so admin sees same photo as user)
      const matchProfile = profileByEmail.get((p.email || "").toLowerCase());
      const avatar = matchProfile?.avatar_url || p.avatar_url || "";
      return {
        id: p.id,
        name: p.name,
        email: p.email || "",
        phone: p.phone || "",
        company: company?.name || "",
        companyId: p.company_id,
        jobTitle: p.job_title || "",
        role: p.role || "viewer",
        avatar,
        progress: p.progress || 0,
        startDate: p.start_date || "",
      };
    });

    // employee counts
    companiesData.forEach(c => {
      c.employeeCount = peopleData.filter(p => p.companyId === c.id).length;
    });

    const projectsData: ProjectData[] = (proj.data || []).map((p: any) => {
      const company = companiesData.find(c => c.id === p.company_id);
      return {
        id: p.id,
        name: p.name,
        description: p.description || "",
        company: company?.name || "",
        companyId: p.company_id,
        startDate: p.start_date || "",
        endDate: p.end_date || "",
        progress: p.progress || 0,
        status: (p.status as ProjectData["status"]) || "planned",
        memberCount: 0,
      };
    });

    const tasksData: TaskData[] = (tsk.data || []).map((t: any) => {
      const project = projectsData.find(p => p.id === t.project_id);
      const assignee = peopleData.find(p => p.id === t.assignee_id);
      return {
        id: t.id,
        projectId: t.project_id,
        projectName: project?.name || "",
        title: t.title,
        assignee: assignee?.name || "-",
        assigneeId: t.assignee_id,
        status: (t.status as TaskData["status"]) || "planned",
        startDate: t.start_date || "",
        endDate: t.end_date || "",
        progress: t.progress || 0,
      };
    });

    const formsData: FormData[] = (frm.data || []).map((f: any) => {
      const project = projectsData.find(p => p.id === f.project_id);
      // submitted_by is auth.uid() -> resolve via profiles.email -> people
      const submitterProfile = profilesData.find(p => p.user_id === f.submitted_by);
      const submitterEmail = (submitterProfile?.email || "").toLowerCase();
      const reporter = submitterEmail
        ? peopleData.find(p => p.email.toLowerCase() === submitterEmail)
        : undefined;
      const reporterAvatarFromProfile = submitterProfile?.avatar_url || "";
      let photos: string[] = [];
      try {
        const m = (f.materials || "").match(/__PHOTOS__:(.+)$/);
        if (m) photos = JSON.parse(m[1]);
      } catch { /* ignore */ }
      return {
        id: f.id,
        formNumber: f.form_number,
        project: project?.name || "",
        projectId: f.project_id,
        templateType: (f.template_type as FormData["templateType"]) || "Laporan Harian",
        date: f.date || "",
        status: (f.status as FormData["status"]) || "draft",
        progress: f.progress || 0,
        workToday: f.work_today || "",
        manpower: f.manpower || 0,
        materials: (f.materials || "").replace(/__PHOTOS__:.*$/, "").trim(),
        reporterName: reporter?.name || submitterProfile?.email?.split("@")[0] || "User",
        reporterPhone: reporter?.phone || "-",
        reporterAvatar: reporter?.avatar || reporterAvatarFromProfile || "",
        reportPhotos: photos,
        submittedBy: f.submitted_by,
      };
    });
    formCounter = formsData.length;

    // Compute member count per project = distinct people from tasks (assignee) + forms (submitter via email->people)
    const submitterEmailByUserId = new Map(profilesData.map(p => [p.user_id, (p.email || "").toLowerCase()]));
    projectsData.forEach(proj => {
      const memberIds = new Set<string>();
      tasksData.filter(t => t.projectId === proj.id && t.assigneeId).forEach(t => memberIds.add(t.assigneeId!));
      formsData.filter(f => f.projectId === proj.id && f.submittedBy).forEach(f => {
        const email = submitterEmailByUserId.get(f.submittedBy!);
        if (email) {
          const person = peopleData.find(p => p.email.toLowerCase() === email);
          if (person) memberIds.add(person.id);
        }
      });
      proj.memberCount = memberIds.size;
    });

    // Group project_files by project
    const pfMap = new Map<string, ProjectFileData>();
    (pf.data || []).forEach((file: any) => {
      const project = projectsData.find(p => p.id === file.project_id);
      const projectName = project?.name || "Unknown";
      const key = file.project_id;
      if (!pfMap.has(key)) {
        pfMap.set(key, { id: key, projectId: key, projectName, files: [] });
      }
      pfMap.get(key)!.files.push({
        id: file.id,
        name: file.name,
        url: file.url,
        uploadedBy: "",
        date: file.date || "",
      });
    });

    setCompanies(companiesData);
    setPeople(peopleData);
    setProjects(projectsData);
    setTasks(tasksData);
    setForms(formsData);
    setProjectFiles(Array.from(pfMap.values()));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    const ch = supabase
      .channel("shared-data-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "companies" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "people" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "forms" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "project_files" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchAll)
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [fetchAll]);

  // Cross-tab activity sync
  useEffect(() => {
    if (!channel) return;
    const handler = (e: MessageEvent) => {
      const { type, data } = e.data;
      if (type === "new_activity") {
        setActivities(prev => prev.find(a => a.id === data.id) ? prev : [data, ...prev].slice(0, 50));
      }
    };
    channel.addEventListener("message", handler);
    return () => channel.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => prev.map(a => ({ ...a, time: formatTimeAgo(a.timestamp) })));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const findCompanyId = useCallback((name: string): string | null => {
    if (!name) return null;
    const c = companies.find(x => x.name.toLowerCase() === name.toLowerCase());
    return c?.id || null;
  }, [companies]);

  const addPerson = useCallback(async (person: Omit<PersonData, "id">) => {
    const company_id = person.companyId || findCompanyId(person.company);
    await supabase.from("people").insert({
      name: person.name, email: person.email, phone: person.phone,
      company_id, job_title: person.jobTitle, role: person.role,
      avatar_url: person.avatar, progress: person.progress, start_date: person.startDate || null,
    });
    await fetchAll();
  }, [findCompanyId, fetchAll]);

  const updatePerson = useCallback(async (id: string, data: Partial<PersonData>) => {
    const upd: any = {};
    if (data.name !== undefined) upd.name = data.name;
    if (data.email !== undefined) upd.email = data.email;
    if (data.phone !== undefined) upd.phone = data.phone;
    if (data.jobTitle !== undefined) upd.job_title = data.jobTitle;
    if (data.role !== undefined) upd.role = data.role;
    if (data.avatar !== undefined) upd.avatar_url = data.avatar;
    if (data.progress !== undefined) upd.progress = data.progress;
    if (data.startDate !== undefined) upd.start_date = data.startDate || null;
    if (data.company !== undefined) upd.company_id = findCompanyId(data.company);
    await supabase.from("people").update(upd).eq("id", id);
    await fetchAll();
  }, [findCompanyId, fetchAll]);

  const deletePerson = useCallback(async (id: string) => {
    await supabase.from("people").delete().eq("id", id);
    await fetchAll();
  }, [fetchAll]);

  const addCompany = useCallback(async (company: Omit<CompanyData, "id" | "employeeCount">) => {
    await supabase.from("companies").insert({
      name: company.name, line_of_business: company.lineOfBusiness,
      phone: company.phone, email: company.email, website: company.website,
    });
    await fetchAll();
  }, [fetchAll]);

  const deleteCompany = useCallback(async (id: string) => {
    await supabase.from("companies").delete().eq("id", id);
    await fetchAll();
  }, [fetchAll]);

  const addProject = useCallback(async (project: Omit<ProjectData, "id">) => {
    const company_id = project.companyId || findCompanyId(project.company);
    await supabase.from("projects").insert({
      name: project.name, description: project.description, company_id,
      start_date: project.startDate || null, end_date: project.endDate || null,
      progress: project.progress, status: project.status,
    });
    await fetchAll();
  }, [findCompanyId, fetchAll]);

  const updateProject = useCallback(async (id: string, data: Partial<ProjectData>) => {
    const upd: any = {};
    if (data.name !== undefined) upd.name = data.name;
    if (data.description !== undefined) upd.description = data.description;
    if (data.startDate !== undefined) upd.start_date = data.startDate || null;
    if (data.endDate !== undefined) upd.end_date = data.endDate || null;
    if (data.progress !== undefined) upd.progress = data.progress;
    if (data.status !== undefined) upd.status = data.status;
    if (data.company !== undefined) upd.company_id = findCompanyId(data.company);
    await supabase.from("projects").update(upd).eq("id", id);
    await fetchAll();
  }, [findCompanyId, fetchAll]);

  const deleteProject = useCallback(async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    await fetchAll();
  }, [fetchAll]);

  const deleteTask = useCallback(async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    await fetchAll();
  }, [fetchAll]);

  const addForm = useCallback(async (form: Omit<FormData, "id">) => {
    const project = projects.find(p => p.name === form.project);
    const { data: { user } } = await supabase.auth.getUser();
    const photosTag = form.reportPhotos?.length ? `\n__PHOTOS__:${JSON.stringify(form.reportPhotos)}` : "";
    if (!project) return;
    await supabase.from("forms").insert({
      form_number: form.formNumber, project_id: project.id,
      template_type: form.templateType, date: form.date || null,
      status: form.status, progress: form.progress, work_today: form.workToday,
      manpower: form.manpower, materials: (form.materials || "") + photosTag,
      submitted_by: user?.id || null,
    });
    // Auto-save report photos as project files (Berkas) folder = project name
    if (form.reportPhotos && form.reportPhotos.length > 0) {
      const rows = form.reportPhotos.map((url, i) => ({
        project_id: project.id,
        name: `Laporan ${form.reporterName || "User"} - ${form.date || ""} (${i + 1}).png`,
        url,
        date: form.date || null,
      }));
      await supabase.from("project_files").insert(rows);
    }
    await fetchAll();
  }, [projects, fetchAll]);

  const updateForm = useCallback(async (id: string, data: Partial<FormData>) => {
    const upd: any = {};
    if (data.workToday !== undefined) upd.work_today = data.workToday;
    if (data.manpower !== undefined) upd.manpower = data.manpower;
    if (data.status !== undefined) upd.status = data.status;
    if (data.progress !== undefined) upd.progress = data.progress;
    if (data.date !== undefined) upd.date = data.date || null;
    if (data.materials !== undefined || data.reportPhotos !== undefined) {
      const cur = forms.find(f => f.id === id);
      const materials = data.materials !== undefined ? data.materials : (cur?.materials || "");
      const photos = data.reportPhotos !== undefined ? data.reportPhotos : (cur?.reportPhotos || []);
      const photosTag = photos.length ? `\n__PHOTOS__:${JSON.stringify(photos)}` : "";
      upd.materials = (materials || "") + photosTag;
    }
    await supabase.from("forms").update(upd).eq("id", id);

    // Sync photos to project_files (Berkas) when reportPhotos is edited
    if (data.reportPhotos !== undefined) {
      const cur = forms.find(f => f.id === id);
      if (cur) {
        const project = projects.find(p => p.name === cur.project);
        if (project) {
          // Remove old auto-generated report files for this form's date+reporter, then re-insert
          const namePrefix = `Laporan ${cur.reporterName || "User"} - ${cur.date || ""}`;
          await supabase.from("project_files")
            .delete()
            .eq("project_id", project.id)
            .like("name", `${namePrefix}%`);
          if (data.reportPhotos.length > 0) {
            const rows = data.reportPhotos.map((url, i) => ({
              project_id: project.id,
              name: `${namePrefix} (${i + 1}).png`,
              url,
              date: cur.date || null,
            }));
            await supabase.from("project_files").insert(rows);
          }
        }
      }
    }
    await fetchAll();
  }, [forms, projects, fetchAll]);

  const deleteForm = useCallback(async (id: string) => {
    const cur = forms.find(f => f.id === id);
    if (cur) {
      const project = projects.find(p => p.name === cur.project);
      if (project) {
        const namePrefix = `Laporan ${cur.reporterName || "User"} - ${cur.date || ""}`;
        await supabase.from("project_files")
          .delete()
          .eq("project_id", project.id)
          .like("name", `${namePrefix}%`);
      }
    }
    await supabase.from("forms").delete().eq("id", id);
    await fetchAll();
  }, [forms, projects, fetchAll]);

  const addFileToProject = useCallback(async (projectName: string, file: FileData) => {
    const project = projects.find(p => p.name === projectName);
    if (!project) return;
    await supabase.from("project_files").insert({
      project_id: project.id, name: file.name, url: file.url, date: file.date || null,
    });
    await fetchAll();
  }, [projects, fetchAll]);

  const addActivity = useCallback((activity: Omit<ActivityData, "id" | "time" | "timestamp">) => {
    const newActivity: ActivityData = {
      ...activity,
      id: crypto.randomUUID(),
      time: "Baru saja",
      timestamp: Date.now(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
    channel?.postMessage({ type: "new_activity", data: newActivity });
  }, []);

  const refreshFromRegistrations = useCallback(() => { fetchAll(); }, [fetchAll]);
  const getFormCount = useCallback(() => formCounter, []);

  const deleteProjectFile = useCallback(async (projectId: string, fileId: string) => {
    const { error } = await supabase.from("project_files").delete().eq("id", fileId);
    if (error) { console.error(error); throw error; }
    setProjectFiles(prev => prev.map(pf => pf.projectId === projectId
      ? { ...pf, files: pf.files.filter(f => f.id !== fileId) }
      : pf));
    channel?.postMessage({ type: "data_refresh" });
  }, []);

  return (
    <SharedDataContext.Provider value={{
      people, companies, projects, tasks, forms, projectFiles, activities, loading,
      addPerson, updatePerson, deletePerson, addCompany, addProject, updateProject, deleteProject,
      addForm, updateForm, deleteForm, deleteCompany, deleteTask,
      addActivity, addFileToProject, deleteProjectFile, refreshFromRegistrations, getFormCount,
    }}>
      {children}
    </SharedDataContext.Provider>
  );
}

export function useSharedData() {
  const ctx = useContext(SharedDataContext);
  if (!ctx) throw new Error("useSharedData must be used within SharedDataProvider");
  return ctx;
}

export { generateFormNumber };
