
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User, Menu, X } from 'lucide-react';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <User size={16} />
                  {user.email?.split('@')[0] || 'Account'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings size={16} className="mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              className="bg-mechanic-blue hover:bg-mechanic-blue/90"
              onClick={() => navigate('/auth')}
            >
              Sign In
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
              
              {user ? (
                <>
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
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  variant="default" 
                  className="bg-mechanic-blue hover:bg-mechanic-blue/90 mt-2"
                  onClick={() => {
                    navigate('/auth');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign In
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
