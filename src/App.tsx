import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import MyHerdPage from "@/pages/MyHerdPage";
import MilkRecordsPage from "@/pages/MilkRecordsPage";
import FeedingPage from "@/pages/FeedingPage";
import HealthPage from "@/pages/HealthPage";
import NotesPage from "@/pages/NotesPage";
import BreedingPage from "@/pages/BreedingPage";
import AlertsPage from "@/pages/AlertsPage";
import ReportsPage from "@/pages/ReportsPage";
import ExpensesPage from "@/pages/ExpensesPage";
import IncomePage from "@/pages/IncomePage";
import WorkersPage from "@/pages/WorkersPage";
import CommunicationPage from "@/pages/CommunicationPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import NotFound from "@/pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CowProvider } from "./contexts/CowContext";
import { RecordProvider } from "./contexts/RecordContext";

const queryClient = new QueryClient();

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <LoginPage />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CowProvider>
        <RecordProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route element={<AuthWrapper><AppLayout /></AuthWrapper>}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/my-herd" element={<MyHerdPage />} />
                  <Route path="/milk-records" element={<MilkRecordsPage />} />
                  <Route path="/feeding" element={<FeedingPage />} />
                  <Route path="/health" element={<HealthPage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/breeding" element={<BreedingPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/income" element={<IncomePage />} />
                  <Route path="/workers" element={<WorkersPage />} />
                  <Route path="/communication" element={<CommunicationPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RecordProvider>
      </CowProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
