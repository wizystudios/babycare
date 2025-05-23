
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  HomeIcon,
  BottleIcon,
  DiaperIcon,
  SleepIcon,
  HealthIcon,
  MilestoneIcon,
  SettingsIcon,
} from "@/components/BabyIcons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { to: "/", icon: HomeIcon, label: "nav.home" },
  { to: "/feeding", icon: BottleIcon, label: "nav.feeding" },
  { to: "/diaper", icon: DiaperIcon, label: "nav.diaper" },
  { to: "/sleep", icon: SleepIcon, label: "nav.sleep" },
  { to: "/health", icon: HealthIcon, label: "nav.health" },
  { to: "/milestones", icon: MilestoneIcon, label: "nav.milestones" },
  { to: "/settings", icon: SettingsIcon, label: "nav.settings" },
];

export const BottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const currentPath = location.pathname;
  const [logoDialogOpen, setLogoDialogOpen] = React.useState(false);
  const isMobile = useIsMobile();

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around bg-gradient-to-r from-white to-baby-blue/10 dark:from-gray-900 dark:to-baby-primary/20 border-t border-baby-primary/20 h-16 px-1 sm:px-8 z-50 shadow-md">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 hidden sm:block">
        <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
          <DialogTrigger asChild>
            <Link to="/" className="flex items-center group">
              <div className="h-10 w-10 rounded-full bg-white p-0.5 shadow-md border-2 border-baby-primary flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                <img 
                  src="/lovable-uploads/b7205a62-6702-4855-9178-d6cbe95eac27.png" 
                  alt="BabyCare Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="ml-2 text-sm font-bold text-baby-primary group-hover:scale-105 transition-transform">BabyCare</span>
            </Link>
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
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Improved mobile navigation layout */}
      <div className="flex items-center justify-around w-full">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center px-1 py-1 rounded-md transition-colors",
              currentPath === item.to
                ? "text-baby-primary font-medium"
                : "text-gray-500 hover:text-baby-primary"
            )}
          >
            <item.icon
              className={cn(
                isMobile ? "w-5 h-5" : "w-6 h-6",
                currentPath === item.to ? "text-baby-primary" : "text-gray-500"
              )}
            />
            <span className={cn(
              isMobile ? "text-[8px]" : "text-[10px]", 
              "mt-0.5 truncate max-w-[40px] sm:max-w-none text-center"
            )}>
              {t(item.label)}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
