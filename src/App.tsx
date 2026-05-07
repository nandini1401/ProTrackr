import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserSettingsProvider } from "@/contexts/UserSettingsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SharedDataProvider } from "@/contexts/SharedDataContext";
import Dashboard from "./pages/Dashboard";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import FormsPage from "./pages/FormsPage";
import CompaniesPage from "./pages/CompaniesPage";
import PeoplePage from "./pages/PeoplePage";
import MessagesPage from "./pages/MessagesPage";
import FilesPage from "./pages/FilesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserReportPage from "./pages/UserReportPage";
import UserHistoryPage from "./pages/UserHistoryPage";
import UserProfilePage from "./pages/UserProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading || (isAuthenticated && role === null)) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/user" replace />;
  return <>{children}</>;
}

function UserRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading || (isAuthenticated && role === null)) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== "user") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading || (isAuthenticated && role === null)) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (isAuthenticated) return <Navigate to={role === "admin" ? "/" : "/user"} replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SharedDataProvider>
        <UserSettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                <Route path="/user" element={<UserRoute><UserReportPage /></UserRoute>} />
                <Route path="/user/history" element={<UserRoute><UserHistoryPage /></UserRoute>} />
                <Route path="/user/profile" element={<UserRoute><UserProfilePage /></UserRoute>} />
                <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
                <Route path="/projects" element={<AdminRoute><ProjectsPage /></AdminRoute>} />
                <Route path="/projects/:id" element={<AdminRoute><ProjectDetailPage /></AdminRoute>} />
                <Route path="/people" element={<AdminRoute><PeoplePage /></AdminRoute>} />
                <Route path="/messages" element={<AdminRoute><MessagesPage /></AdminRoute>} />
                <Route path="/companies" element={<AdminRoute><CompaniesPage /></AdminRoute>} />
                <Route path="/forms" element={<AdminRoute><FormsPage /></AdminRoute>} />
                <Route path="/files" element={<AdminRoute><FilesPage /></AdminRoute>} />
                <Route path="/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
                <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </UserSettingsProvider>
      </SharedDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
