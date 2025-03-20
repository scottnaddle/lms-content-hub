
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import LTIConfigPage from "./pages/LTIConfigPage";
import ContentTypePage from "./pages/ContentTypePage";
import ContentDetailsPage from "./pages/ContentDetailsPage";
import EditContentPage from "./pages/EditContentPage";
import RecentlyViewedPage from "./pages/RecentlyViewedPage";
import StatisticsPage from "./pages/StatisticsPage";
import SearchPage from "./pages/SearchPage";
import TagsPage from "./pages/TagsPage";
import AuthPage from "./pages/AuthPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route 
                path="/upload" 
                element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/lti-configuration" 
                element={
                  <ProtectedRoute>
                    <LTIConfigPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/recently-viewed" element={<RecentlyViewedPage />} />
              <Route path="/:type" element={<ContentTypePage />} />
              <Route 
                path="/content/:type/:id" 
                element={
                  <ProtectedRoute>
                    <ContentDetailsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit/:type/:id" 
                element={
                  <ProtectedRoute>
                    <EditContentPage />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
