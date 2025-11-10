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
import { motion, AnimatePresence } from 'framer-motion';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      <form onSubmit={handleSubmit} className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1.5"
          >
            <Label htmlFor="email" className="text-xs">{t("auth.email")}</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="example@email.com" 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (!showPassword && e.target.value) {
                  setShowPassword(true);
                }
              }}
              className="h-8 text-xs"
            />
          </motion.div>

          {showPassword && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1.5"
            >
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs">{t("auth.password")}</Label>
                <button 
                  type="button" 
                  className="text-[10px] text-primary hover:underline"
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
                className="h-8 text-xs"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {showPassword && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              type="submit" 
              className="w-full h-8 text-xs" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size="small" className="mr-1.5" />
                  {t("auth.loggingIn")}
                </>
              ) : (
                t("auth.login")
              )}
            </Button>
          </motion.div>
        )}
      </form>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{t("auth.resetPasswordTitle")}</DialogTitle>
            <DialogDescription className="text-xs">{t("auth.resetPasswordInstructions")}</DialogDescription>
          </DialogHeader>
          {resetSuccess ? (
            <motion.div 
              className="py-4 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-3 text-green-500 flex justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-sm font-medium">{t("auth.emailSent")}</h3>
              <p className="text-xs text-muted-foreground mt-1.5">{t("auth.checkInbox")}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="space-y-1.5 py-3">
                <Label htmlFor="reset-email" className="text-xs">{t("auth.email")}</Label>
                <Input 
                  id="reset-email" 
                  type="email" 
                  placeholder="example@email.com" 
                  value={resetEmail} 
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <DialogFooter className="mt-3">
                <Button type="button" variant="outline" onClick={() => setIsResetDialogOpen(false)} className="h-8 text-xs">
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isResetLoading} className="h-8 text-xs">
                  {isResetLoading ? (
                    <>
                      <Loader size="small" className="mr-1.5" />
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