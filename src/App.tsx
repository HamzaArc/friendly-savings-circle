
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { queryClient } from "@/lib/queryClient";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import CreateGroup from "./pages/CreateGroup";
import GroupDetail from "./pages/GroupDetail";
import NotFound from "./pages/NotFound";
import AppShell from "./components/layout/AppShell";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import LearnMore from "./pages/LearnMore";
import Contact from "./pages/Contact";
import Groups from "./pages/Groups";
import HelpButton from "./components/onboarding/HelpButton";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import OnboardingForm from "./components/onboarding/OnboardingForm";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="fixed bottom-4 right-4 z-50">
              <HelpButton />
            </div>
            <Routes>
              {/* Public pages */}
              <Route path="/" element={<AppShell><Index /></AppShell>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/learn-more" element={<AppShell><LearnMore /></AppShell>} />
              <Route path="/contact" element={<AppShell><Contact /></AppShell>} />
              <Route path="/onboarding" element={<OnboardingForm />} />
              
              {/* Protected pages */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
                <Route path="/user-dashboard" element={<AppShell><UserDashboard /></AppShell>} />
                <Route path="/create-group" element={<AppShell><CreateGroup /></AppShell>} />
                <Route path="/groups/:id" element={<AppShell><GroupDetail /></AppShell>} />
                <Route path="/reports" element={<AppShell><Reports /></AppShell>} />
                <Route path="/settings" element={<AppShell><Settings /></AppShell>} />
                <Route path="/groups" element={<AppShell><Groups /></AppShell>} />
              </Route>
              
              {/* Catch-all page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
