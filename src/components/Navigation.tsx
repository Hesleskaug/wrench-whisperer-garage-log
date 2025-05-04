
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGarage } from '@/contexts/GarageContext';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, Garage, Menu, X, Copy } from 'lucide-react';
import { toast } from 'sonner';

const Navigation = () => {
  const { garageId, leaveGarage } = useGarage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleCopyGarageId = () => {
    if (garageId) {
      navigator.clipboard.writeText(garageId);
      toast.success('Garage ID copied to clipboard');
    }
  };
  
  const handleLeaveGarage = () => {
    leaveGarage();
    navigate('/garage');
  };
  
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-mechanic-blue">
            Wrench Whisperer
          </Link>
        </div>
        
        <div className="lg:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
        
        <nav className="hidden lg:flex items-center space-x-6">
          <Link
            to="/"
            className="text-mechanic-gray hover:text-mechanic-blue transition-colors"
          >
            Garage
          </Link>
          
          {garageId ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Garage size={16} />
                  Your Garage
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="px-2 py-2 text-sm">
                  <p className="text-muted-foreground mb-1">Garage ID:</p>
                  <div className="flex items-center justify-between bg-muted p-2 rounded">
                    <code className="text-xs truncate mr-2">{garageId}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleCopyGarageId}
                      className="h-8 w-8"
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings size={16} className="mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLeaveGarage}>
                  <LogOut size={16} className="mr-2" />
                  Exit Garage
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              className="bg-mechanic-blue hover:bg-mechanic-blue/90"
              onClick={() => navigate('/garage')}
            >
              Access Garage
            </Button>
          )}
        </nav>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white pt-16 px-4">
            <div className="absolute top-3 right-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>
            
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-lg py-2 text-mechanic-gray hover:text-mechanic-blue transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Garage
              </Link>
              
              {garageId ? (
                <>
                  <div className="py-2">
                    <p className="text-sm text-muted-foreground mb-1">Garage ID:</p>
                    <div className="flex items-center justify-between bg-muted p-2 rounded">
                      <code className="text-xs truncate mr-2">{garageId}</code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleCopyGarageId}
                        className="h-8 w-8"
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>
                  <Link
                    to="/settings"
                    className="text-lg py-2 text-mechanic-gray hover:text-mechanic-blue transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings size={18} className="inline mr-2" />
                    Settings
                  </Link>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => {
                      handleLeaveGarage();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut size={18} className="mr-2" />
                    Exit Garage
                  </Button>
                </>
              ) : (
                <Button 
                  variant="default" 
                  className="bg-mechanic-blue hover:bg-mechanic-blue/90 mt-2"
                  onClick={() => {
                    navigate('/garage');
                    setMobileMenuOpen(false);
                  }}
                >
                  Access Garage
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
