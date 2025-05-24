
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader } from '@/components/ui/loader';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const { signIn, signUp, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Initial splash screen effect
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 2.5 seconds then fade out
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (showSplash) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-baby-blue/30 to-background/90">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="h-36 w-36 rounded-full bg-white p-3 shadow-lg border-2 border-baby-primary flex items-center justify-center overflow-hidden mb-6">
            <img 
              src="/lovable-uploads/35d286c5-a006-4d46-8d1b-5b194dddf7f2.png" 
              alt="BabyCare Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          
          <motion.h1 
            className="text-3xl font-bold text-baby-primary text-center mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            BabyCare Daily
          </motion.h1>
          
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            From KN Technology
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <Layout hideNavigation={true}>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-baby-blue/20 to-background/90 p-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link 
            to="#" 
            className="flex items-center justify-center mb-6"
            onClick={(e) => {
              e.preventDefault();
              setLogoDialogOpen(true);
            }}
          >
            <motion.div 
              className="h-16 w-16 rounded-full bg-white p-1.5 shadow-md border-2 border-baby-primary flex items-center justify-center overflow-hidden"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src="/lovable-uploads/35d286c5-a006-4d46-8d1b-5b194dddf7f2.png" 
                alt="BabyCare Logo" 
                className="h-full w-full object-contain"
              />
            </motion.div>
          </Link>
          
          <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">BabyCare Daily</CardTitle>
              <CardDescription>
                {t('auth.loginDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                  <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.email')}</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password">{t('auth.password')}</Label>
                        <Link to="/reset-password" className="text-xs text-baby-primary hover:underline">
                          {t('auth.forgotPassword')}
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-baby-primary hover:bg-baby-primary/90">{t('auth.signIn')}</Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t('auth.name')}</Label>
                      <Input 
                        id="signup-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('auth.email')}</Label>
                      <Input 
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('auth.password')}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-baby-primary hover:bg-baby-primary/90">{t('auth.signUp')}</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col text-center text-sm text-muted-foreground space-y-4">
              <div className="flex items-center gap-4 w-full">
                <div className="h-px bg-border flex-1"></div>
                <span>or</span>
                <div className="h-px bg-border flex-1"></div>
              </div>
              
              <Button variant="outline" className="w-full" disabled>
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                {t('auth.signInGoogle')}
              </Button>
              
              <div className="mt-4">
                <Link to="/welcome" className="text-baby-primary hover:underline">
                  ← {t('auth.backToWelcome')}
                </Link>
              </div>
            </CardFooter>
          </Card>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            <p>© 2025 BabyCare by KN Technology</p>
          </div>
        </motion.div>
      </div>

      {/* Logo Dialog */}
      <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center p-4">
            <div className="h-24 w-24 rounded-full bg-white p-2 shadow-md border-2 border-baby-primary flex items-center justify-center overflow-hidden mb-4">
              <img 
                src="/lovable-uploads/35d286c5-a006-4d46-8d1b-5b194dddf7f2.png" 
                alt="BabyCare Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            
            <h2 className="text-xl font-bold text-baby-primary text-center mb-2">BabyCare Daily</h2>
            
            <p className="text-center text-muted-foreground mb-4">
              BabyCare Daily helps you track your baby's daily activities, growth, and milestones. Designed to make parenting easier with intuitive tracking and helpful insights.
            </p>

            <p className="text-sm font-medium text-muted-foreground">
              Developed by KN Technology
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Auth;
