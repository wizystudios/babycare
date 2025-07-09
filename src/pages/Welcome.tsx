import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Sparkles, Baby, Moon, Sun } from 'lucide-react';

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState<'intro' | 'auth'>('intro');
  
  // Magical splash effect
  const [showSplash, setShowSplash] = useState(true);
  const [sparkleCount, setSparkleCount] = useState(0);
  
  useEffect(() => {
    // Create magical sparkle effect
    const sparkleInterval = setInterval(() => {
      setSparkleCount(prev => (prev + 1) % 3);
    }, 800);
    
    // Show splash for 3 seconds then transition
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(sparkleInterval);
    };
  }, []);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Magical animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-5, 5, -5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const Sparkle = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
      className="absolute text-secondary text-lg"
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{ 
        opacity: [0, 1, 0], 
        scale: [0, 1, 0], 
        rotate: [0, 180, 360] 
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        delay,
        ease: "easeInOut"
      }}
    >
      ✨
    </motion.div>
  );

  if (showSplash) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/15 overflow-hidden font-poppins">
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="flex flex-col items-center relative"
        >
          {/* Magical glow effect */}
          <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full animate-gentle-pulse" />
          
          <div className="relative h-48 w-48 rounded-full bg-white/80 backdrop-blur-sm p-6 shadow-dreamy border-2 border-primary/30 flex items-center justify-center overflow-hidden mb-8">
            <motion.img 
              src="/lovable-uploads/35d286c5-a006-4d46-8d1b-5b194dddf7f2.png" 
              alt="BabyCare Logo" 
              className="h-full w-full object-contain"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            {/* Sparkles around logo */}
            <Sparkle delay={0} />
            <Sparkle delay={0.5} />
            <Sparkle delay={1} />
          </div>
          
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold font-caveat bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
              BabyCare Daily ✨
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-2xl font-dancing">
              <Heart className="text-pink-400 animate-heartbeat" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Made with Love
              </span>
              <Heart className="text-pink-400 animate-heartbeat" />
            </div>
            
            <motion.p
              className="text-lg text-muted-foreground font-medium font-poppins"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              by KN Technology 🚀
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Loading animation */}
        <motion.div
          className="mt-12 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="w-3 h-3 bg-primary rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-3 h-3 bg-secondary rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-3 h-3 bg-accent rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <Layout hideNavigation={true} showFooterAttribution={true}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/10 font-poppins overflow-hidden">
        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-6xl opacity-5"
              style={{
                left: `${15 + (i * 12)}%`,
                top: `${20 + (i * 8)}%`,
              }}
              variants={floatingVariants}
              animate="animate"
              transition={{ delay: i * 0.5 }}
            >
              {i % 4 === 0 ? '🍼' : i % 4 === 1 ? '👶' : i % 4 === 2 ? '🌟' : '💕'}
            </motion.div>
          ))}
        </div>

        <header className="py-8 px-4 md:px-6 flex justify-center relative z-10">
          <motion.div 
            className="container max-w-screen-xl flex justify-center items-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center">
              <motion.div 
                className="relative mb-6 h-32 w-32 rounded-full bg-white/90 backdrop-blur-sm p-4 shadow-dreamy border-2 border-primary/30 flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img 
                  src="/lovable-uploads/35d286c5-a006-4d46-8d1b-5b194dddf7f2.png" 
                  alt="BabyCare Logo" 
                  className="h-full w-full object-contain"
                />
                <div className="absolute -top-1 -right-1 text-yellow-400 animate-sparkle">⭐</div>
              </motion.div>
              
              <motion.h1 
                className="text-5xl font-bold font-caveat bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                BabyCare ✨
              </motion.h1>
            </div>
          </motion.div>
        </header>

        <main className="flex-1 flex flex-col px-4 pb-8 relative z-10">
          <AnimatePresence mode="wait">
            {step === 'intro' ? (
              <motion.div 
                key="intro"
                className="flex-1 flex flex-col items-center justify-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -100 }}
              >
                <div className="max-w-lg w-full">
                  <motion.div 
                    className="text-center mb-8"
                    variants={itemVariants}
                  >
                    <h2 className="text-4xl font-bold font-caveat mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Karibu kwenye BabyCare Daily! 🌟
                    </h2>
                    <p className="text-xl text-muted-foreground font-medium">
                      Tumia programu yetu ya kupendeza kutunza afya na maendeleo ya mtoto wako 👶💕
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-6 mb-12">
                    {[
                      { icon: '🍼', text: 'Fuatilia lishe, muda wa kulala na kubadilisha nepi', gradient: 'from-primary/20 to-accent/20' },
                      { icon: '📈', text: 'Weka kumbukumbu za hatua muhimu za ukuaji wa mtoto wako', gradient: 'from-secondary/20 to-primary/20' },
                      { icon: '🤝', text: 'Shiriki taarifa na watu wanaomtunza mtoto', gradient: 'from-accent/20 to-secondary/20' }
                    ].map((feature, index) => (
                      <motion.div 
                        key={index}
                        className={`baby-card p-6 bg-gradient-to-r ${feature.gradient} relative overflow-hidden`}
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="flex items-center">
                          <motion.div 
                            className="text-4xl mr-4"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                          >
                            {feature.icon}
                          </motion.div>
                          <span className="font-medium text-lg">{feature.text}</span>
                        </div>
                        <div className="absolute top-2 right-2 text-xs opacity-30">✨</div>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="flex flex-col space-y-4">
                    <Button 
                      className="baby-button w-full py-8 text-xl rounded-3xl font-semibold relative overflow-hidden group"
                      onClick={() => setStep('auth')}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        🚀 Anza Kutumia
                      </span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full py-6 text-lg rounded-3xl border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/10 font-medium transition-all duration-500 hover:scale-105 hover:shadow-glow"
                      onClick={() => navigate('/auth')}
                    >
                      <span className="flex items-center justify-center gap-2">
                        👋 Tayari nina akaunti
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="auth"
                className="flex-1 flex flex-col items-center justify-center"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5 }}
              >
                <div className="max-w-md w-full">
                  <Card className="baby-card shadow-dreamy border-2 border-primary/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                    
                    <CardHeader className="text-center pb-6 relative z-10">
                      <motion.div
                        className="text-6xl mb-4"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        🌟
                      </motion.div>
                      <CardTitle className="text-3xl font-bold font-caveat bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        Jiandikishe! ✨
                      </CardTitle>
                      <CardDescription className="text-muted-foreground font-medium text-lg">
                        Unda akaunti yako ya BabyCare 👶💕
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-8 relative z-10">
                      <div className="space-y-6">
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-3 py-6 rounded-2xl border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/10 font-medium transition-all duration-500 hover:scale-105 hover:shadow-glow group"
                          onClick={() => navigate('/auth')}
                        >
                          <svg className="h-6 w-6 group-hover:animate-bounce" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                          </svg>
                          🚀 Ingia na Google
                        </Button>
                        
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t-2 border-primary/20"></span>
                          </div>
                          <div className="relative flex justify-center text-sm uppercase">
                            <span className="bg-card px-4 font-bold text-primary">✨ AU ✨</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="baby-button w-full py-6 rounded-2xl font-semibold text-lg group"
                          onClick={() => navigate('/auth')}
                        >
                          <span className="flex items-center justify-center gap-2">
                            📧 Jiandikishe kwa barua pepe
                          </span>
                        </Button>
                      </div>
                      
                      <div className="mt-8 text-center">
                        <span className="text-sm text-muted-foreground">
                          Tayari una akaunti? 🤔{' '}
                          <Button 
                            variant="link" 
                            className="p-0 h-auto bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold hover:scale-110 transition-transform"
                            onClick={() => navigate('/auth')}
                          >
                            Ingia! 🎉
                          </Button>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="mt-6 text-center">
                    <Button 
                      variant="link" 
                      className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
                      onClick={() => setStep('intro')}
                    >
                      ← Rudi nyuma
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </Layout>
  );
};

export default Welcome;