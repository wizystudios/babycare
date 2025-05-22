
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BottleIcon } from '@/components/BabyIcons';
import { motion } from 'framer-motion';

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/90">
      <header className="py-6 px-4 md:px-6 flex justify-center border-b">
        <motion.div 
          className="container max-w-screen-xl flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <motion.div 
              className="mr-2"
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <BottleIcon className="h-8 w-8 text-baby-blue" />
            </motion.div>
            <motion.h1 
              className="text-2xl font-bold text-baby-blue"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              BabyCare
            </motion.h1>
          </div>
        </motion.div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row">
        <motion.div 
          className="flex-1 flex items-center justify-center p-6 md:p-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-xl">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              variants={itemVariants}
            >
              Karibu kwenye BabyCare Daily
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 dark:text-gray-300 mb-6"
              variants={itemVariants}
            >
              Tumia programu yetu kutunza afya na maendeleo ya mtoto wako. Fuatilia kila kitu kutoka 
              kulisha, kulala, kubadilisha nepi, na zaidi kutoka mahali popote.
            </motion.p>
            <motion.ul className="space-y-3 mb-6" variants={containerVariants}>
              <motion.li className="flex items-start" variants={itemVariants}>
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Fuatilia lishe, muda wa kulala na kubadilisha nepi</span>
              </motion.li>
              <motion.li className="flex items-start" variants={itemVariants}>
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Weka kumbukumbu za hatua muhimu za ukuaji wa mtoto wako</span>
              </motion.li>
              <motion.li className="flex items-start" variants={itemVariants}>
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Fuatilia maendeleo na grafu za ukuaji</span>
              </motion.li>
              <motion.li className="flex items-start" variants={itemVariants}>
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Shiriki taarifa na watu wanaomtunza mtoto</span>
              </motion.li>
            </motion.ul>
            <motion.div 
              className="border-t pt-6 text-center"
              variants={itemVariants}
            >
              <p className="text-sm mb-4">
                Imetengenezwa na timu ya wataalamu wenye uzoefu wa elimu ya watoto na afya
              </p>
              <div className="flex justify-center items-center">
                <Avatar className="h-12 w-12 mr-2">
                  <AvatarImage 
                    src="/lovable-uploads/2a13b9aa-f2eb-4f9b-af50-10ea1112fb20.png" 
                    alt="NK Technology Logo" 
                    className="object-cover"
                  />
                  <AvatarFallback>NK</AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold">
                  NK Technology
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="flex-1 flex items-center justify-center p-6 md:p-10 bg-gray-50 dark:bg-gray-800"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle>Karibu Tena</CardTitle>
              <CardDescription>Ingia au jiandikishe kuanza kutumia programu</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="login">Ingia</TabsTrigger>
                  <TabsTrigger value="register">Jiandikishe</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <p className="text-sm text-gray-500">
                Kwa kujiandikisha, unakubali masharti na sera zetu za matumizi
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </main>

      <footer className="py-4 px-6 border-t text-center text-sm text-gray-500">
        <p>© 2025 BabyCare - Haki zote zimehifadhiwa. Imesanifiwa na NK Technology</p>
      </footer>
    </div>
  );
};

export default Welcome;
