
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Language } from "@/lib/i18n/translations";
import { SettingsIcon, BabyIcon } from "@/components/BabyIcons";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Moon, Sun, HelpCircle, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [supportEmail, setSupportEmail] = useState<string>("");
  const [supportMessage, setSupportMessage] = useState<string>("");
  
  // Set user email in support form if available
  useEffect(() => {
    if (user?.email) {
      setSupportEmail(user.email);
    }
  }, [user]);
  
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    
    // Show success message
    toast({
      title: t("settings.languageUpdated"),
      description: `${t("settings.languageChangedTo")} ${getLanguageName(newLanguage)}.`,
    });
  };
  
  const handleExportData = () => {
    // In a real app, this would generate a file for download
    toast({
      title: t("settings.dataExportInitiated"),
      description: t("settings.dataExportDescription"),
    });
  };
  
  const handleSendSupportEmail = () => {
    if (!supportMessage.trim()) {
      toast({
        title: t("settings.pleaseFillAllFields"),
        description: t("settings.messageRequired"),
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send an email
    toast({
      title: t("settings.messageSent"),
      description: t("settings.supportRequestSent"),
    });
    
    // Reset form
    setSupportEmail("");
    setSupportMessage("");
  };
  
  const getLanguageName = (code: Language): string => {
    const names: Record<Language, string> = {
      en: "English",
      sw: "Kiswahili",
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
        
        <Tabs defaultValue="preferences">
          <TabsList className="mb-6">
            <TabsTrigger value="preferences">{t("settings.preferences")}</TabsTrigger>
            <TabsTrigger value="help">{t("settings.helpSupport")}</TabsTrigger>
            <TabsTrigger value="about">{t("settings.about")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preferences">
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
                <h2 className="text-lg font-semibold mb-3">{t("settings.theme")}</h2>
                <RadioGroup
                  value={theme}
                  onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center">
                      <Sun className="w-4 h-4 mr-2" />
                      {t("settings.light")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center">
                      <Moon className="w-4 h-4 mr-2" />
                      {t("settings.dark")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">{t("settings.system")}</Label>
                  </div>
                </RadioGroup>
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
                  <Label htmlFor="notifications">{t("settings.enableNotifications")}</Label>
                </div>
              </div>
              
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={handleExportData}>
                  {t("settings.export")}
                </Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="help">
            <Card className="p-4 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  {t("settings.helpInstructions")}
                </h2>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>{t("settings.howAddBaby")}</AccordionTrigger>
                    <AccordionContent>
                      {t("settings.howAddBabyAnswer")}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>{t("settings.howTrackFeedings")}</AccordionTrigger>
                    <AccordionContent>
                      {t("settings.howTrackFeedingsAnswer")}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>{t("settings.howTrackDiapers")}</AccordionTrigger>
                    <AccordionContent>
                      {t("settings.howTrackDiapersAnswer")}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>{t("settings.howTrackSleep")}</AccordionTrigger>
                    <AccordionContent>
                      {t("settings.howTrackSleepAnswer")}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>{t("settings.howRecordMilestones")}</AccordionTrigger>
                    <AccordionContent>
                      {t("settings.howRecordMilestonesAnswer")}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger>{t("settings.canUseMultipleBabies")}</AccordionTrigger>
                    <AccordionContent>
                      {t("settings.canUseMultipleBabiesAnswer")}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  {t("settings.contactSupport")}
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("settings.yourEmail")}</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder={t("settings.enterEmail")}
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      readOnly={!!user?.email}
                      className={user?.email ? "bg-gray-100" : ""}
                    />
                    {user?.email && (
                      <p className="text-xs text-muted-foreground">
                        {t("settings.usingAccountEmail")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t("settings.message")}</Label>
                    <Textarea 
                      id="message" 
                      placeholder={t("settings.howCanWeHelp")}
                      rows={4}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSendSupportEmail}>
                    {t("settings.sendMessage")}
                  </Button>
                  <div className="pt-4 text-sm text-muted-foreground">
                    <p>{t("settings.emailUsDirectly")}</p>
                    <a href="mailto:babycare000001@gmail.com" className="text-primary hover:underline">
                      babycare000001@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="about">
            <Card className="p-4 space-y-6">
              <div className="border-b pb-6">
                <div className="flex items-center justify-center flex-col">
                  <BabyIcon className="w-20 h-20 text-primary mb-2" />
                  <h3 className="font-bold text-2xl">BabyCare</h3>
                  <p className="text-sm text-gray-500">{t("settings.version")} 1.0.0</p>
                  <p className="text-xs text-gray-400 mt-1">© 2025 BabyCare by NK Technology</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">{t("settings.aboutBabyCare")}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("settings.aboutBabyCareDescription")}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">{t("settings.privacyPolicy")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {t("settings.privacyPolicyDescription")}
                </p>
                <Button variant="link" className="px-0">
                  {t("settings.readFullPrivacyPolicy")}
                </Button>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">{t("settings.termsOfService")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {t("settings.termsOfServiceDescription")}
                </p>
                <Button variant="link" className="px-0">
                  {t("settings.readTermsOfService")}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
