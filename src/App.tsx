
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GarageProvider } from "@/contexts/GarageContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import VehicleDetails from "./pages/VehicleDetails";
import GarageAccess from "./pages/GarageAccess";
import UserSettings from "./pages/UserSettings";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import GarageRoute from "./components/GarageRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GarageProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Routes>
                <Route 
                  path="/garage" 
                  element={<GarageAccess />} 
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
                              <GarageRoute>
                                <Index />
                              </GarageRoute>
                            } 
                          />
                          <Route 
                            path="/vehicle/:id" 
                            element={
                              <GarageRoute>
                                <VehicleDetails />
                              </GarageRoute>
                            } 
                          />
                          <Route 
                            path="/settings" 
                            element={
                              <GarageRoute>
                                <UserSettings />
                              </GarageRoute>
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
      </LanguageProvider>
    </GarageProvider>
  </QueryClientProvider>
);

export default App;
