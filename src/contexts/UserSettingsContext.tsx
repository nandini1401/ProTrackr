import { createContext, useContext, useState, ReactNode } from "react";

interface UserSettings {
  fullName: string;
  email: string;
  jobTitle: string;
  phone: string;
  avatarUrl?: string;
}

interface UserSettingsContextType {
  settings: UserSettings;
  updateSettings: (s: UserSettings) => void;
}

const STORAGE_KEY = "user_settings";

function getInitialSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    fullName: "Admin User",
    email: "admin@company.com",
    jobTitle: "System Administrator",
    phone: "+62 812 3456 7890",
    avatarUrl: "",
  };
}

const UserSettingsContext = createContext<UserSettingsContextType>({
  settings: getInitialSettings(),
  updateSettings: () => {},
});

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(getInitialSettings);

  const updateSettings = (s: UserSettings) => {
    setSettings(s);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      console.warn("Failed to save settings", e);
    }
  };

  return (
    <UserSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export const useUserSettings = () => useContext(UserSettingsContext);
