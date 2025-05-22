
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: t("auth.error"),
        description: t("auth.fillAllFields"),
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t("auth.success"),
        description: t("auth.loginSuccess")
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = t("auth.genericError");
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = t("auth.invalidCredentials");
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = t("auth.emailNotConfirmed");
        }
      }
      
      toast({
        title: t("auth.error"),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: t("auth.error"),
        description: t("auth.enterEmail"),
        variant: "destructive"
      });
      return;
    }
    
    setIsResetLoading(true);
    
    try {
      // Use Supabase's resetPasswordForEmail method with the site URL
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        throw error;
      }
      
      setResetSuccess(true);
      
      toast({
        title: t("auth.resetPasswordTitle"),
        description: t("auth.resetPasswordSuccess"),
      });
      
      // Don't close dialog immediately so user can see success message
      setTimeout(() => {
        setIsResetDialogOpen(false);
        setResetSuccess(false);
      }, 3000);
    } catch (error: any) {
      toast({
        title: t("auth.error"),
        description: error.message || t("auth.genericError"),
        variant: "destructive"
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="example@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="transition-all duration-200 focus:ring-2 focus:ring-offset-0 focus:ring-baby-blue focus:border-transparent"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <button 
              type="button" 
              className="text-xs text-blue-600 hover:underline transition-colors"
              onClick={() => setIsResetDialogOpen(true)}
            >
              {t("auth.forgotPassword")}
            </button>
          </div>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="transition-all duration-200 focus:ring-2 focus:ring-offset-0 focus:ring-baby-blue focus:border-transparent"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full hover:shadow-md transition-all duration-200" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader size="small" className="mr-2" />
              {t("auth.loggingIn")}
            </>
          ) : (
            t("auth.login")
          )}
        </Button>
      </form>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("auth.resetPasswordTitle")}</DialogTitle>
            <DialogDescription>{t("auth.resetPasswordInstructions")}</DialogDescription>
          </DialogHeader>
          {resetSuccess ? (
            <motion.div 
              className="py-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4 text-green-500 flex justify-center">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium">{t("auth.emailSent")}</h3>
              <p className="text-sm text-gray-500 mt-2">{t("auth.checkInbox")}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="space-y-2 py-4">
                <Label htmlFor="reset-email">{t("auth.email")}</Label>
                <Input 
                  id="reset-email" 
                  type="email" 
                  placeholder="example@email.com" 
                  value={resetEmail} 
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-offset-0 focus:ring-baby-blue focus:border-transparent"
                />
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isResetLoading}>
                  {isResetLoading ? (
                    <>
                      <Loader size="small" className="mr-2" />
                      {t("auth.sending")}
                    </>
                  ) : (
                    t("auth.sendResetLink")
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
