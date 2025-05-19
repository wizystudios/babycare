
import React from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BabyIcon } from "../BabyIcons";

export const Header = () => {
  const location = useLocation();
  const { t } = useLanguage();

  // Define titles based on routes
  const getTitleByPath = (path: string) => {
    const routes: Record<string, string> = {
      "/": "app.name",
      "/feeding": "feeding.title",
      "/diaper": "diaper.title",
      "/sleep": "sleep.title",
      "/health": "health.title",
      "/milestones": "milestone.title",
      "/settings": "settings.title",
    };

    return routes[path] || "app.name";
  };

  const title = t(getTitleByPath(location.pathname));

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <BabyIcon className="h-8 w-8 text-primary" />
        <h1 className="text-lg font-bold text-primary">{title}</h1>
      </div>
      <div className="flex items-center space-x-2">
        {/* You can add action buttons here like notifications, etc. */}
      </div>
    </header>
  );
};
