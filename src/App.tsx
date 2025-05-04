
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import VehicleDetails from "./pages/VehicleDetails";
import Auth from "./pages/Auth";
import UserSettings from "./pages/UserSettings";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import PrivateRoute from "./components/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Routes>
              <Route 
                path="/auth" 
                element={<Auth />} 
              />
              <Route 
                path="/*" 
                element={
                  <>
                    <Navigation />
                    <main className="flex-1">
                      <Routes>
                        <Route 
                          path="/" 
                          element={
                            <PrivateRoute>
                              <Index />
                            </PrivateRoute>
                          } 
                        />
                        <Route 
                          path="/vehicle/:id" 
                          element={
                            <PrivateRoute>
                              <VehicleDetails />
                            </PrivateRoute>
                          } 
                        />
                        <Route 
                          path="/settings" 
                          element={
                            <PrivateRoute>
                              <UserSettings />
                            </PrivateRoute>
                          } 
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </>
                } 
              />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
