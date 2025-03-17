
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import CreateGroup from "./pages/CreateGroup";
import GroupDetail from "./pages/GroupDetail";
import NotFound from "./pages/NotFound";
import OnboardingForm from "./components/onboarding/OnboardingForm";
import AppShell from "./components/layout/AppShell";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import LearnMore from "./pages/LearnMore";
import Contact from "./pages/Contact";
import Groups from "./pages/Groups";
import HelpButton from "./components/onboarding/HelpButton";

const queryClient = new QueryClient();

const Onboarding = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);
  
  // If logged in, redirect to dashboard
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <AppShell>
      <OnboardingForm />
    </AppShell>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="fixed bottom-4 right-4 z-50">
          <HelpButton />
        </div>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
