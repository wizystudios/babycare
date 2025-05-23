
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar } from '@/components/ui/avatar';
import { BottleIcon } from '@/components/BabyIcons';
import { motion } from 'framer-motion';

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState<'intro' | 'auth'>('intro');
  
  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <Layout hideNavigation={true}>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-baby-blue/20 to-background/90">
        <header className="py-6 px-4 md:px-6 flex justify-center">
          <motion.div 
            className="container max-w-screen-xl flex justify-center items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center">
              <motion.div 
                className="mb-2 h-24 w-24 rounded-full bg-white p-2 shadow-md border-2 border-baby-primary flex items-center justify-center overflow-hidden"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src="/lovable-uploads/35d286c5-a006-4d46-8d1b-5b194dddf7f2.png" 
                  alt="BabyCare Logo" 
                  className="h-full w-full object-contain"
                />
              </motion.div>
              <motion.h1 
                className="text-3xl font-bold text-baby-primary text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                BabyCare
              </motion.h1>
            </div>
          </motion.div>
        </header>

        <main className="flex-1 flex flex-col px-4 pb-8">
          {step === 'intro' ? (
            <motion.div 
              className="flex-1 flex flex-col items-center justify-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="max-w-md w-full">
                <motion.h2 
                  className="text-2xl md:text-3xl font-bold mb-4 text-center"
                  variants={itemVariants}
                >
                  Karibu kwenye BabyCare Daily
                </motion.h2>
                <motion.p 
                  className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center"
                  variants={itemVariants}
                >
                  Tumia programu yetu kutunza afya na maendeleo ya mtoto wako
                </motion.p>
                <motion.div variants={itemVariants} className="space-y-3 mb-8">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Fuatilia lishe, muda wa kulala na kubadilisha nepi</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Weka kumbukumbu za hatua muhimu za ukuaji wa mtoto wako</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Shiriki taarifa na watu wanaomtunza mtoto</span>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex flex-col space-y-3">
                  <Button 
                    className="w-full bg-baby-primary hover:bg-baby-primary/90 text-white py-6 text-lg rounded-xl"
                    onClick={() => setStep('auth')}
                  >
                    Anza Kutumia
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full py-6 text-lg rounded-xl"
                    onClick={() => navigate('/auth')}
                  >
                    Tayari nina akaunti
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="flex-1 flex flex-col items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-md w-full">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-center">Jiandikishe</CardTitle>
                    <CardDescription className="text-center">Unda akaunti yako ya BabyCare</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-3 py-6"
                        onClick={() => navigate('/auth')}
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                        </svg>
                        Ingia na Google
                      </Button>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2">AU</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-baby-primary hover:bg-baby-primary/90 text-white py-6"
                        onClick={() => navigate('/auth')}
                      >
                        Jiandikishe kwa barua pepe
                      </Button>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <span className="text-sm text-muted-foreground">
                        Tayari una akaunti?{' '}
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-baby-primary"
                          onClick={() => navigate('/auth')}
                        >
                          Ingia
                        </Button>
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-4 text-center">
                  <Button 
                    variant="link" 
                    className="text-muted-foreground"
                    onClick={() => setStep('intro')}
                  >
                    Rudi nyuma
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </main>

        <footer className="py-4 px-6 text-center text-sm text-gray-500">
          <p>© 2025 BabyCare - Haki zote zimehifadhiwa</p>
        </footer>
      </div>
    </Layout>
  );
};

export default Welcome;
