import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/admin/hooks/useAdminAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import LiveChat from "@/components/LiveChat"; // Import LiveChat component

// Layouts
import PublicLayout from "@/layouts/PublicLayout";
import StudentLayout from "@/layouts/StudentLayout";
import AdminLayout from "@/admin/components/AdminLayout";

// Pages
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ProgrammesPage from "@/pages/ProgrammesPage";
import AdmissionsPage from "@/pages/AdmissionsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import NotFound from "@/pages/NotFound";

// Student Pages
import StudentDashboard from "@/pages/student/StudentDashboard";
import ApplicationForm from "@/pages/student/ApplicationForm";
import DocumentsPage from "@/pages/student/DocumentsPage";
import ProfilePage from "@/pages/student/ProfilePage";

// Admin Pages
import AdminDashboard from "@/admin/pages/AdminDashboardNew";
import ApplicationsManagement from "@/admin/pages/Applications";
import AdminLogin from "@/admin/pages/AdminLogin";
import StudentsManagement from "@/admin/pages/Students";
import AdmissionsManagement from "@/admin/pages/Admissions";
import Applicants from "@/admin/pages/Applicants";
import Payments from "@/admin/pages/Payments";
import Documents from "@/admin/pages/Documents";
import Reports from "@/admin/pages/Reports";
import Settings from "@/admin/pages/Settings";
import AdminUsers from "@/admin/pages/AdminUsers";

import ProtectedRoute from "@/admin/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="duapa-theme">
        <BrowserRouter>
          <AuthProvider>
            <AdminAuthProvider>
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/programmes" element={<ProgrammesPage />} />
                  <Route path="/admissions" element={<AdmissionsPage />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Student Dashboard Routes */}
                <Route path="/dashboard" element={<StudentLayout />}>
                  <Route index element={<StudentDashboard />} />
                  <Route path="application" element={<ApplicationForm />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="applications" element={<ApplicationsManagement />} />
                  <Route path="applicants" element={<Applicants />} />
                  <Route path="students" element={<StudentsManagement />} />
                  <Route path="admissions" element={<AdmissionsManagement />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <LiveChat /> {/* Global Live Chat component */}
              <Toaster />
              <Sonner />
            </AdminAuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;


