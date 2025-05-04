
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGarage } from '@/contexts/GarageContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Settings, LogOut, Copy, Menu, X, Home, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const { garageId, leaveGarage } = useGarage();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const form = useForm({
    defaultValues: {
      email: '',
    },
  });
  
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
  
  const handleSendEmail = async (values: { email: string }) => {
    if (!garageId) return;
    
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-garage-id', {
        body: { email: values.email, garageId }
      });
      
      if (error) throw error;
      
      toast.success('Garage ID sent to your email');
      setEmailDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
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
            {t('garage')}
          </Link>
          
          {garageId ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Home size={16} />
                  {t('yourGarage')}
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
                <DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
                  <Mail size={16} className="mr-2" />
                  {t('emailGarageId')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings size={16} className="mr-2" />
                  {t('settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLeaveGarage}>
                  <LogOut size={16} className="mr-2" />
                  {t('exitGarage')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              className="bg-mechanic-blue hover:bg-mechanic-blue/90"
              onClick={() => navigate('/garage')}
            >
              {t('accessGarage')}
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
                {t('garage')}
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
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => {
                      setEmailDialogOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Mail size={18} className="mr-2" />
                    {t('emailGarageId')}
                  </Button>
                  <Link
                    to="/settings"
                    className="text-lg py-2 text-mechanic-gray hover:text-mechanic-blue transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings size={18} className="inline mr-2" />
                    {t('settings')}
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
                    {t('exitGarage')}
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
                  {t('accessGarage')}
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
      
      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('emailYourGarageId')}</DialogTitle>
            <DialogDescription>
              {t('emailDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendEmail)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                rules={{ 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('emailAddress')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        type="email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEmailDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isSending}>
                  {isSending ? t('sending') : t('sendEmail')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Navigation;
