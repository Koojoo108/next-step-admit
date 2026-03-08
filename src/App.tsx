import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PublicLayout from "@/layouts/PublicLayout";
import StudentLayout from "@/layouts/StudentLayout";
import AdminLayout from "@/layouts/AdminLayout";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ProgrammesPage from "@/pages/ProgrammesPage";
import AdmissionsPage from "@/pages/AdmissionsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import ApplicationForm from "@/pages/student/ApplicationForm";
import DocumentsPage from "@/pages/student/DocumentsPage";
import ProfilePage from "@/pages/student/ProfilePage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ApplicantsPage from "@/pages/admin/ApplicantsPage";
import ProgrammesAdmin from "@/pages/admin/ProgrammesAdmin";
import AnnouncementsAdmin from "@/pages/admin/AnnouncementsAdmin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/programmes" element={<ProgrammesPage />} />
              <Route path="/admissions" element={<AdmissionsPage />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Dashboard */}
            <Route path="/dashboard" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="application" element={<ApplicationForm />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="applicants" element={<ApplicantsPage />} />
              <Route path="programmes" element={<ProgrammesAdmin />} />
              <Route path="announcements" element={<AnnouncementsAdmin />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
