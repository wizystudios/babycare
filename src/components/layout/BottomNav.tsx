
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
  BabyIcon,
} from "@/components/BabyIcons";

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-16 px-2 sm:px-8 z-50">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 hidden sm:block">
        <Link to="/" className="flex items-center">
          <BabyIcon className="w-6 h-6 text-primary" />
          <span className="ml-1 text-sm font-bold">BabyCare</span>
        </Link>
      </div>
      
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            "flex flex-col items-center justify-center px-2 py-1 rounded-md transition-colors",
            currentPath === item.to
              ? "text-primary font-medium"
              : "text-gray-500 hover:text-primary"
          )}
        >
          <item.icon
            className={cn(
              "w-6 h-6",
              currentPath === item.to ? "text-primary" : "text-gray-500"
            )}
          />
          <span className="text-[10px] mt-1">{t(item.label)}</span>
        </Link>
      ))}
    </nav>
  );
};
