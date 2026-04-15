import { createContext, useContext, useState, ReactNode } from "react";

export interface RegisteredUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  company: string;
  project: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  role: "admin" | "user" | null;
  currentUser: RegisteredUser | null;
  login: (username: string, password: string, role: "admin" | "user") => boolean;
  logout: () => void;
  register: (user: Omit<RegisteredUser, "id">) => boolean;
  getRegisteredUsers: () => RegisteredUser[];
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  role: null,
  currentUser: null,
  login: () => false,
  logout: () => {},
  register: () => false,
  getRegisteredUsers: () => [],
});

function getStoredUsers(): RegisteredUser[] {
  try {
    return JSON.parse(localStorage.getItem("registered_users") || "[]");
  } catch { return []; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem("auth") === "true");
  const [role, setRole] = useState<"admin" | "user" | null>(() => sessionStorage.getItem("auth_role") as any || null);
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(() => {
    try { return JSON.parse(sessionStorage.getItem("current_user") || "null"); } catch { return null; }
  });

  const login = (username: string, password: string, loginRole: "admin" | "user"): boolean => {
    if (loginRole === "admin") {
      if (username === "Admin" && password === "Admin2026") {
        setIsAuthenticated(true);
        setRole("admin");
        setCurrentUser(null);
        sessionStorage.setItem("auth", "true");
        sessionStorage.setItem("auth_role", "admin");
        sessionStorage.removeItem("current_user");
        return true;
      }
      return false;
    } else {
      // User login by email + password
      const users = getStoredUsers();
      const found = users.find(u => u.email === username && u.password === password);
      if (found) {
        setIsAuthenticated(true);
        setRole("user");
        setCurrentUser(found);
        sessionStorage.setItem("auth", "true");
        sessionStorage.setItem("auth_role", "user");
        sessionStorage.setItem("current_user", JSON.stringify(found));
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setCurrentUser(null);
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("auth_role");
    sessionStorage.removeItem("current_user");
  };

  const register = (userData: Omit<RegisteredUser, "id">): boolean => {
    const users = getStoredUsers();
    if (users.find(u => u.email === userData.email)) return false;
    const newUser: RegisteredUser = { ...userData, id: crypto.randomUUID() };
    users.push(newUser);
    localStorage.setItem("registered_users", JSON.stringify(users));
    return true;
  };

  const getRegisteredUsers = () => getStoredUsers();

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, currentUser, login, logout, register, getRegisteredUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
