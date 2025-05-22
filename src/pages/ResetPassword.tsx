
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader } from '@/components/ui/loader';
import { supabase } from '@/integrations/supabase/client';
import { BottleIcon } from '@/components/BabyIcons';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a hash in the URL, indicating we're in a password reset flow
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      toast({
        title: t("auth.error"),
        description: t("auth.invalidResetLink"),
        variant: "destructive",
      });
      // Redirect to login after a delay
      setTimeout(() => navigate('/welcome'), 3000);
    }
  }, [navigate, toast, t]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast({
        title: t("auth.error"),
        description: t("auth.enterPassword"),
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: t("auth.error"),
        description: t("auth.passwordsDoNotMatch"),
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: t("auth.error"),
        description: t("auth.passwordTooShort"),
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      
      toast({
        title: t("auth.success"),
        description: t("auth.passwordResetSuccess"),
      });
      
      // Redirect to login after a delay
      setTimeout(() => navigate('/welcome'), 3000);
    } catch (error: any) {
      toast({
        title: t("auth.error"),
        description: error.message || t("auth.genericError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <BottleIcon className="h-12 w-12 text-baby-blue" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl">BabyCare Daily</CardTitle>
            <CardDescription>
              {isSuccess ? t("auth.passwordResetSuccess") : t("auth.resetYourPassword")}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isSuccess ? (
              <div className="py-6 text-center">
                <div className="mb-4 text-green-500 flex justify-center">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium">{t("auth.passwordUpdated")}</h3>
                <p className="text-sm text-gray-500 mt-2">{t("auth.redirectingToLogin")}</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t("auth.newPassword")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-offset-0 focus:ring-baby-blue focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-offset-0 focus:ring-baby-blue focus:border-transparent"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader size="small" className="mr-2" />
                      {t("auth.updating")}
                    </>
                  ) : (
                    t("auth.resetPassword")
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            <p>{t("auth.securePasswordNote")}</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
