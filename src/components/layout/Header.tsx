
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useBaby } from "@/hooks/useBaby";
import { Sun, Moon, Plus, LogOut, Settings, User } from "lucide-react";

export const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { currentBaby, babies, switchBaby } = useBaby();
  const navigate = useNavigate();

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

  return (
    <header className="border-b bg-background p-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 
            className="text-xl font-bold cursor-pointer text-baby-blue"
            onClick={() => navigate("/")}
          >
            BabyCare
          </h1>
          {currentBaby && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">
                  {currentBaby.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {babies.map((baby) => (
                  <DropdownMenuItem 
                    key={baby.id} 
                    onClick={() => switchBaby(baby.id)}
                    className={baby.id === currentBaby.id ? "bg-muted" : ""}
                  >
                    {baby.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={handleAddBaby}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("nav.addBaby")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleThemeToggle}
            title={theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLanguageToggle}
          >
            {language === "en" ? "SW" : "EN"}
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback style={{ backgroundColor: getAvatarColor(user.email || '') }}>
                    {getInitials(user.email || "U")}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenProfile}>
                  <User className="mr-2 h-4 w-4" />
                  {t("nav.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t("nav.settings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
