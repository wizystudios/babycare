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
import { Sun, Moon, Plus, LogOut, Settings, User, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppLogo } from "@/components/ui/AppLogo";
import { getAgeDisplay } from "@/lib/date-utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, signOut, isAdmin } = useAuth();
  const { selectedBaby, babies, switchBaby } = useBaby();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
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

  const handleOpenAdmin = () => {
    console.log('Admin button clicked, isAdmin:', isAdmin());
    if (isAdmin()) {
      navigate("/admin");
    }
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
      className="border-b border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 backdrop-blur-xl p-2 sm:p-3 sticky top-0 z-10 shadow-glow"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-1 sm:space-x-2"
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
                <AppLogo size={isMobile ? "sm" : "md"} showText={!isMobile} />
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
                <AppLogo size="lg" />
                <div className="text-center space-y-3">
                  <p className="text-gray-600 dark:text-gray-400">
                    Track your baby's feeding, diaper changes, sleep patterns, health records, and milestones all in one place. 
                    Our comprehensive app helps you monitor your baby's development and ensure their well-being.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <span>Powered by</span>
                    <img 
                      src="/lovable-uploads/10a31bb6-5b94-43dd-829b-c00dd01ddb89.png" 
                      alt="KN Technology" 
                      className="w-4 h-4"
                    />
                    <span className="font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">KN Technology</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setLogoDialogOpen(false)}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-glow"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {selectedBaby && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size={isMobile ? "xs" : "sm"}
                  className={cn(
                    "ml-1 sm:ml-2 animate-fade-in bg-white/80 text-primary border-primary/30 hover:bg-primary/10 shadow-soft",
                    isMobile ? "text-xs px-2" : ""
                  )}
                >
                  {selectedBaby.name} • {getAgeDisplay(selectedBaby.birthDate)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="animate-scale-in">
                {babies.map((baby) => (
                  <DropdownMenuItem 
                    key={baby.id} 
                    onClick={() => {
                      console.log('Switching to baby:', baby.name, baby.id);
                      switchBaby(baby.id);
                    }}
                    className={baby.id === selectedBaby.id ? "bg-primary/10 text-primary font-medium" : ""}
                  >
                    {baby.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={handleAddBaby}>
                  <Plus className="mr-2 h-4 w-4 text-primary" />
                  {t("nav.addBaby")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </motion.div>

        <motion.div 
          className="flex items-center space-x-1 sm:space-x-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {!isMobile && (
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
                className="text-primary hover:bg-primary/10"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
          )}

          {!isMobile && (
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
                  "font-medium hover:bg-primary/10",
                  language === "en" ? "text-primary" : "text-secondary"
                )}
              >
                {language === "en" ? "SW" : "EN"}
              </Button>
            </motion.div>
          )}

          <NotificationBell />

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Avatar className={cn(
                    "cursor-pointer border-2 border-primary/50 shadow-soft",
                    isMobile ? "h-8 w-8" : "h-9 w-9"
                  )}>
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
                  <User className="mr-2 h-4 w-4 text-primary" />
                  {t("nav.profile")}
                </DropdownMenuItem>
                {isAdmin() && (
                  <DropdownMenuItem onClick={handleOpenAdmin}>
                    <Shield className="mr-2 h-4 w-4 text-primary" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleOpenSettings}>
                  <Settings className="mr-2 h-4 w-4 text-primary" />
                  {t("nav.settings")}
                </DropdownMenuItem>
                {isMobile && (
                  <>
                    <DropdownMenuItem onClick={handleThemeToggle}>
                      {theme === "dark" ? (
                        <Sun className="mr-2 h-4 w-4 text-primary" />
                      ) : (
                        <Moon className="mr-2 h-4 w-4 text-primary" />
                      )}
                      {theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLanguageToggle}>
                      <span className="mr-2 w-4 h-4 inline-flex items-center justify-center text-primary font-bold text-xs">
                        {language === "en" ? "SW" : "EN"}
                      </span>
                      {language === "en" ? "Switch to Swahili" : "Switch to English"}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4 text-primary" />
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </motion.div>
      </div>
      
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </motion.header>
  );
};
