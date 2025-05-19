
import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Language } from "@/lib/i18n/translations";
import { SettingsIcon, BabyIcon } from "@/components/BabyIcons";
import { toast } from "@/components/ui/use-toast";

const SettingsPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    
    // Show success message
    toast({
      title: "Language updated",
      description: `The app language has been changed to ${getLanguageName(newLanguage)}.`,
    });
  };
  
  const handleExportData = () => {
    // In a real app, this would generate a file for download
    // For our demo, we'll just show a toast
    toast({
      title: "Data export initiated",
      description: "Your data will be prepared for download shortly.",
    });
  };
  
  const getLanguageName = (code: Language): string => {
    const names: Record<Language, string> = {
      en: "English",
      sw: "Swahili",
      fr: "Français",
      es: "Español",
      zh: "中文",
    };
    return names[code];
  };
  
  return (
    <Layout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        
        <Card className="p-4 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">{t("settings.language")}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {["en", "sw", "fr", "es", "zh"].map((lang) => (
                <Button
                  key={lang}
                  variant={language === lang ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleLanguageChange(lang as Language)}
                >
                  {getLanguageName(lang as Language)}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">{t("settings.units")}</h2>
            <RadioGroup
              value={units}
              onValueChange={(value) => setUnits(value as "metric" | "imperial")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="metric" id="metric" />
                <Label htmlFor="metric">{t("settings.metric")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="imperial" id="imperial" />
                <Label htmlFor="imperial">{t("settings.imperial")}</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">{t("settings.notifications")}</h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
              <Label htmlFor="notifications">{t("settings.notifications")}</Label>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">{t("settings.theme")}</h2>
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">{t("settings.light")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">{t("settings.dark")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">{t("settings.system")}</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="pt-2">
            <Button variant="outline" className="w-full" onClick={handleExportData}>
              {t("settings.export")}
            </Button>
          </div>
          
          <div className="border-t pt-6">
            <div className="flex items-center justify-center flex-col">
              <BabyIcon className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-bold text-lg">BabyCare Daily</h3>
              <p className="text-sm text-gray-500">Version 1.0.0</p>
              <p className="text-xs text-gray-400 mt-1">© 2025 BabyCare</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
