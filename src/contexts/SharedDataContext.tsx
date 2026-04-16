import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { companies as mockCompanies, people as mockPeople, projects as mockProjects, tasks as mockTasks, forms as mockForms, projectFiles as mockProjectFiles } from "@/lib/mockData";


// Types
export interface PersonData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
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
  startDate: string;
  endDate: string;
  progress: number;
  status: "planned" | "wip" | "completed";
}

export interface TaskData {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  assignee: string;
  status: "planned" | "wip" | "completed";
  startDate: string;
  endDate: string;
  progress: number;
}

export interface FormData {
  id: string;
  formNumber: string;
  project: string;
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
  addPerson: (person: PersonData) => void;
  updatePerson: (id: string, person: Partial<PersonData>) => void;
  deletePerson: (id: string) => void;
  addCompany: (company: CompanyData) => void;
  addProject: (project: ProjectData) => void;
  updateProject: (id: string, project: Partial<ProjectData>) => void;
  deleteProject: (id: string) => void;
  addForm: (form: FormData) => void;
  updateForm: (id: string, data: Partial<FormData>) => void;
  deleteForm: (id: string) => void;
  deleteCompany: (id: string) => void;
  deleteTask: (id: string) => void;
  addActivity: (activity: Omit<ActivityData, "id" | "time" | "timestamp">) => void;
  addFileToProject: (projectName: string, file: FileData) => void;
  refreshFromRegistrations: () => void;
  getFormCount: () => number;
}

const SharedDataContext = createContext<SharedDataContextType | null>(null);

// Generate form number
let formCounter = mockForms.length;
function generateFormNumber(): string {
  formCounter++;
  return `DLR-2025-${String(formCounter).padStart(3, "0")}`;
}

// Convert mock forms to enriched format
function getInitialForms(): FormData[] {
  const storedForms = localStorage.getItem("shared_forms");
  if (storedForms) {
    try { return JSON.parse(storedForms); } catch { /* fall through */ }
  }
  return mockForms.map((f, i) => {
    const reporter = mockPeople[i % mockPeople.length];
    return {
      ...f,
      reporterName: reporter.name,
      reporterPhone: reporter.phone,
      reporterAvatar: reporter.avatar,
      reportPhotos: [`https://picsum.photos/seed/form${f.id}/600/400`],
    };
  });
}

function getInitialProjectFiles(): ProjectFileData[] {
  const stored = localStorage.getItem("shared_project_files");
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  return mockProjectFiles;
}

function getRegisteredUsers(): Array<{ id: string; fullName: string; email: string; phone: string; position: string; company: string; project: string; avatarUrl?: string }> {
  try {
    return JSON.parse(localStorage.getItem("registered_users") || "[]");
  } catch { return []; }
}

function getInitialPeople(): PersonData[] {
  const stored = localStorage.getItem("shared_people");
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  // Merge mock + registered users
  const base = [...mockPeople] as PersonData[];
  const users = getRegisteredUsers();
  users.forEach(u => {
    const existing = base.find(p => p.email === u.email);
    if (existing) {
      existing.name = u.fullName;
      if (u.avatarUrl) existing.avatar = u.avatarUrl;
    } else {
      base.push({
        id: u.id,
        name: u.fullName,
        email: u.email,
        phone: u.phone,
        company: u.company,
        jobTitle: u.position,
        role: "viewer",
        avatar: u.avatarUrl || `https://i.pravatar.cc/150?u=${u.email}`,
        progress: 0,
        startDate: new Date().toISOString().split("T")[0],
      });
    }
  });
  return base;
}

function getInitialCompanies(): CompanyData[] {
  const stored = localStorage.getItem("shared_companies");
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  const base = [...mockCompanies] as CompanyData[];
  const users = getRegisteredUsers();
  users.forEach(u => {
    if (u.company && !base.find(c => c.name.toLowerCase() === u.company.toLowerCase())) {
      base.push({
        id: `company-${crypto.randomUUID()}`,
        name: u.company,
        lineOfBusiness: "-",
        phone: u.phone,
        email: u.email,
        website: "-",
        employeeCount: 1,
      });
    }
  });
  // Update employee counts
  const allPeople = getInitialPeople();
  base.forEach(c => {
    c.employeeCount = allPeople.filter(p => p.company.toLowerCase() === c.name.toLowerCase()).length;
  });
  return base;
}

function getInitialProjects(): ProjectData[] {
  const stored = localStorage.getItem("shared_projects");
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  return [...mockProjects] as ProjectData[];
}

function getInitialTasks(): TaskData[] {
  const stored = localStorage.getItem("shared_tasks");
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  return [...mockTasks] as TaskData[];
}

function getInitialActivities(): ActivityData[] {
  const stored = localStorage.getItem("shared_activities");
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  return [];
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

// BroadcastChannel for cross-tab real-time sync
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("shared_data_sync") : null;

export function SharedDataProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<PersonData[]>(getInitialPeople);
  const [companies, setCompanies] = useState<CompanyData[]>(getInitialCompanies);
  const [projects, setProjects] = useState<ProjectData[]>(getInitialProjects);
  const [tasks, setTasks] = useState<TaskData[]>(getInitialTasks);
  const [forms, setForms] = useState<FormData[]>(getInitialForms);
  const [projectFiles, setProjectFiles] = useState<ProjectFileData[]>(getInitialProjectFiles);
  const [activities, setActivities] = useState<ActivityData[]>(getInitialActivities);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem("shared_people", JSON.stringify(people)); }, [people]);
  useEffect(() => { localStorage.setItem("shared_companies", JSON.stringify(companies)); }, [companies]);
  useEffect(() => { localStorage.setItem("shared_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("shared_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("shared_forms", JSON.stringify(forms)); }, [forms]);
  useEffect(() => { localStorage.setItem("shared_project_files", JSON.stringify(projectFiles)); }, [projectFiles]);
  useEffect(() => { localStorage.setItem("shared_activities", JSON.stringify(activities)); }, [activities]);

  // Listen for cross-tab updates via BroadcastChannel
  useEffect(() => {
    if (!channel) return;
    const handler = (e: MessageEvent) => {
      const { type, data } = e.data;
      if (type === "new_form") {
        setForms(prev => {
          if (prev.find(f => f.id === data.id)) return prev;
          return [data, ...prev];
        });
      }
      if (type === "new_activity") {
        setActivities(prev => {
          if (prev.find(a => a.id === data.id)) return prev;
          return [data, ...prev].slice(0, 50);
        });
      }
      if (type === "refresh_all") {
        setPeople(getInitialPeople());
        setCompanies(getInitialCompanies());
        setForms(getInitialForms());
        setActivities(getInitialActivities());
        setProjectFiles(getInitialProjectFiles());
      }
    };
    channel.addEventListener("message", handler);
    return () => channel.removeEventListener("message", handler);
  }, []);

  // Update time-ago labels every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => prev.map(a => ({ ...a, time: formatTimeAgo(a.timestamp) })));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshFromRegistrations = useCallback(() => {
    const users = getRegisteredUsers();
    
    setPeople(prev => {
      const updated = [...prev];
      users.forEach(u => {
        const existing = updated.find(p => p.email === u.email);
        if (existing) {
          existing.name = u.fullName;
          if (u.avatarUrl) existing.avatar = u.avatarUrl;
          existing.phone = u.phone;
          existing.jobTitle = u.position || existing.jobTitle;
        } else {
          updated.push({
            id: u.id,
            name: u.fullName,
            email: u.email,
            phone: u.phone,
            company: u.company,
            jobTitle: u.position,
            role: "viewer",
            avatar: u.avatarUrl || `https://i.pravatar.cc/150?u=${u.email}`,
            progress: 0,
            startDate: new Date().toISOString().split("T")[0],
          });
        }
      });
      return updated;
    });

    setCompanies(prev => {
      const updated = [...prev];
      users.forEach(u => {
        if (u.company && !updated.find(c => c.name.toLowerCase() === u.company.toLowerCase())) {
          updated.push({
            id: `company-${crypto.randomUUID()}`,
            name: u.company,
            lineOfBusiness: "-",
            phone: u.phone,
            email: u.email,
            website: "-",
            employeeCount: 1,
          });
        }
      });
      return updated;
    });
  }, []);

  const addPerson = useCallback((person: PersonData) => {
    setPeople(prev => [...prev, person]);
  }, []);

  const updatePerson = useCallback((id: string, data: Partial<PersonData>) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deletePerson = useCallback((id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id));
  }, []);

  const addCompany = useCallback((company: CompanyData) => {
    setCompanies(prev => [...prev, company]);
  }, []);

  const addProject = useCallback((project: ProjectData) => {
    setProjects(prev => [...prev, project]);
  }, []);

  const updateProject = useCallback((id: string, data: Partial<ProjectData>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

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

  const addForm = useCallback((form: FormData) => {
    setForms(prev => [form, ...prev]);
    channel?.postMessage({ type: "new_form", data: form });
  }, []);

  const addFileToProject = useCallback((projectName: string, file: FileData) => {
    setProjectFiles(prev => {
      const updated = [...prev];
      const existing = updated.find(pf => pf.projectName === projectName);
      if (existing) {
        existing.files = [...existing.files, file];
      } else {
        const project = projects.find(p => p.name === projectName);
        updated.push({
          id: crypto.randomUUID(),
          projectId: project?.id || crypto.randomUUID(),
          projectName,
          files: [file],
        });
      }
      return updated;
    });
  }, [projects]);

  const getFormCount = useCallback(() => formCounter, []);

  return (
    <SharedDataContext.Provider value={{
      people, companies, projects, tasks, forms, projectFiles, activities,
      addPerson, updatePerson, deletePerson, addCompany, addProject, updateProject, deleteProject,
      addForm, addActivity, addFileToProject, refreshFromRegistrations, getFormCount,
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
