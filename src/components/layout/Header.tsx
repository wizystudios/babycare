import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBaby } from "@/hooks/useBaby";
import { Sun, Moon, Plus, LogOut, Settings, User } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { currentBaby, babies, switchBaby } = useBaby();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  
  // Fetch user avatar if available
  useEffect(() => {
    async function fetchAvatar() {
      if (!user) return;
      
      try {
        // Check if user has an avatar in storage
        const { data, error } = await supabase.storage
          .from('avatars')
          .download(`${user.id}.jpg`);
          
        if (error || !data) {
          // No avatar found, use initials (handled by fallback)
          return;
        }
        
        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
        
      } catch (error) {
        console.error('Error downloading avatar:', error);
      }
    }
    
    fetchAvatar();
    
    return () => {
      // Clean up object URL on unmount
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [user]);

  const handleAddBaby = () => {
    navigate("/add-baby");
  };

  const handleOpenProfile = () => {
    navigate("/profile");
  };

  const handleOpenSettings = () => {
    navigate("/settings");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/welcome");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLanguageToggle = () => {
    setLanguage(language === "en" ? "sw" : "en");
  };

  // Get initials from email
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Get background color from email
  const getAvatarColor = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  const iconVariants = {
    initial: { scale: 0.9 },
    hover: { scale: 1.1 }
  };

  return (
    <motion.header 
      className="border-b bg-gradient-to-r from-primary/15 to-baby-blue/20 p-3 sticky top-0 z-10 shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
            <DialogTrigger asChild>
              <motion.div 
                className="flex items-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.2 }}
                  className="mr-2"
                >
                  <div className="h-11 w-11 rounded-full bg-white p-0.5 shadow-md border-2 border-baby-primary flex items-center justify-center overflow-hidden">
                    <img 
                      src="/lovable-uploads/b7205a62-6702-4855-9178-d6cbe95eac27.png" 
                      alt="BabyCare Logo" 
                      className="h-full w-full object-contain"
                    />
                  </div>
                </motion.div>
                <motion.h1 
                  className="text-xl font-bold text-baby-primary"
                  whileHover={{ scale: 1.05 }}
                >
                  BabyCare
                </motion.h1>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-baby-primary text-xl">About BabyCare</DialogTitle>
                <DialogDescription>
                  Your complete solution for baby care tracking and monitoring
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4 p-4">
                <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg border-4 border-baby-primary flex items-center justify-center overflow-hidden">
                  <img 
                    src="/lovable-uploads/b7205a62-6702-4855-9178-d6cbe95eac27.png" 
                    alt="BabyCare Logo" 
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-bold text-baby-primary">BabyCare Daily</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Track your baby's feeding, diaper changes, sleep patterns, health records, and milestones all in one place. 
                    Our comprehensive app helps you monitor your baby's development and ensure their well-being.
                  </p>
                  <p className="text-baby-secondary font-medium">
                    Designed with love for parents and caregivers.
                  </p>
                </div>
                <Button 
                  onClick={() => setLogoDialogOpen(false)}
                  className="bg-baby-primary hover:bg-baby-primary/90 text-white"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {currentBaby && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 animate-fade-in bg-white/80 text-baby-primary border-baby-primary/30 hover:bg-baby-primary/5"
                >
                  {currentBaby.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="animate-scale-in">
                {babies.map((baby) => (
                  <DropdownMenuItem 
                    key={baby.id} 
                    onClick={() => switchBaby(baby.id)}
                    className={baby.id === currentBaby.id ? "bg-baby-primary/10 text-baby-primary font-medium" : ""}
                  >
                    {baby.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={handleAddBaby}>
                  <Plus className="mr-2 h-4 w-4 text-baby-primary" />
                  {t("nav.addBaby")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </motion.div>

        <motion.div 
          className="flex items-center space-x-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.div
            variants={iconVariants}
            initial="initial"
            whileHover="hover"
          >
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleThemeToggle}
              title={theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
              className="text-baby-primary hover:bg-baby-primary/10"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </motion.div>

          <motion.div
            variants={iconVariants}
            initial="initial"
            whileHover="hover"
          >
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLanguageToggle}
              className={cn(
                "font-medium hover:bg-baby-primary/10",
                language === "en" ? "text-baby-primary" : "text-baby-secondary"
              )}
            >
              {language === "en" ? "SW" : "EN"}
            </Button>
          </motion.div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-baby-primary/50">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={user.email || "User"} />
                    ) : (
                      <AvatarFallback style={{ backgroundColor: getAvatarColor(user.email || '') }}>
                        {getInitials(user.email || "U")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="animate-scale-in">
                <DropdownMenuItem onClick={handleOpenProfile}>
                  <User className="mr-2 h-4 w-4 text-baby-primary" />
                  {t("nav.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenSettings}>
                  <Settings className="mr-2 h-4 w-4 text-baby-primary" />
                  {t("nav.settings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4 text-baby-primary" />
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
};
