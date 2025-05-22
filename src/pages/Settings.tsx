
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
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <SettingsIcon className="w-6 h-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        </div>
        
        <Tabs defaultValue="preferences" className="space-y-6">
          <TabsList className="w-full justify-start gap-2 mb-6 rounded-xl p-1 bg-muted/80 overflow-x-auto">
            <TabsTrigger value="preferences" className="rounded-lg">{t("settings.preferences")}</TabsTrigger>
            <TabsTrigger value="help" className="rounded-lg">{t("settings.helpSupport")}</TabsTrigger>
            <TabsTrigger value="about" className="rounded-lg">{t("settings.about")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preferences" className="space-y-6 animation-fade-in">
            <Card className="overflow-hidden border-none shadow-md">
              <div className="p-4 bg-primary/10 border-b">
                <h2 className="text-lg font-semibold">{t("settings.language")}</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {["en", "sw", "fr", "es", "zh"].map((lang) => (
                    <Button
                      key={lang}
                      variant={language === lang ? "default" : "outline"}
                      className="justify-center h-12"
                      onClick={() => handleLanguageChange(lang as Language)}
                    >
                      {getLanguageName(lang as Language)}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
            
            <Card className="overflow-hidden border-none shadow-md">
              <div className="p-4 bg-primary/10 border-b">
                <h2 className="text-lg font-semibold">{t("settings.theme")}</h2>
              </div>
              <div className="p-4">
                <RadioGroup
                  value={theme}
                  onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center cursor-pointer">
                      <Sun className="w-4 h-4 mr-2" />
                      {t("settings.light")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center cursor-pointer">
                      <Moon className="w-4 h-4 mr-2" />
                      {t("settings.dark")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="cursor-pointer">{t("settings.system")}</Label>
                  </div>
                </RadioGroup>
              </div>
            </Card>
            
            <Card className="overflow-hidden border-none shadow-md">
              <div className="p-4 bg-primary/10 border-b">
                <h2 className="text-lg font-semibold">{t("settings.units")}</h2>
              </div>
              <div className="p-4">
                <RadioGroup
                  value={units}
                  onValueChange={(value) => setUnits(value as "metric" | "imperial")}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 px-5 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="metric" id="metric" />
                    <Label htmlFor="metric" className="cursor-pointer">{t("settings.metric")}</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 px-5 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="imperial" id="imperial" />
                    <Label htmlFor="imperial" className="cursor-pointer">{t("settings.imperial")}</Label>
                  </div>
                </RadioGroup>
              </div>
            </Card>
            
            <Card className="overflow-hidden border-none shadow-md">
              <div className="p-4 bg-primary/10 border-b">
                <h2 className="text-lg font-semibold">{t("settings.notifications")}</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                  <Label htmlFor="notifications" className="cursor-pointer">{t("settings.enableNotifications")}</Label>
                </div>
              </div>
            </Card>
            
            <Card className="overflow-hidden border-none shadow-md">
              <div className="p-4 bg-primary/10 border-b">
                <h2 className="text-lg font-semibold">{t("settings.dataManagement")}</h2>
              </div>
              <div className="p-4">
                <Button variant="outline" className="w-full" onClick={handleExportData}>
                  {t("settings.export")}
                </Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="help" className="space-y-6 animation-fade-in">
            <Card className="overflow-hidden border-none shadow-md">
              <div className="p-4 bg-primary/10 border-b flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                <h2 className="text-lg font-semibold">{t("settings.helpInstructions")}</h2>
              </div>
              
              <div className="p-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="hover:bg-muted/50 p-3 rounded-lg">
                      {t("settings.howAddBaby")}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      {t("settings.howAddBabyAnswer")}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="hover:bg-muted/50 p-3 rounded-lg">
                      {t("settings.howTrackFeedings")}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      {t("settings.howTrackFeedingsAnswer")}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="hover:bg-muted/50 p-3 rounded-lg">
                      {t("settings.howTrackDiapers")}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      {t("settings.howTrackDiapersAnswer")}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="hover:bg-muted/50 p-3 rounded-lg">
                      {t("settings.howTrackSleep")}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      {t("settings.howTrackSleepAnswer")}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger className="hover:bg-muted/50 p-3 rounded-lg">
                      {t("settings.howRecordMilestones")}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      {t("settings.howRecordMilestonesAnswer")}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger className="hover:bg-muted/50 p-3 rounded-lg">
                      {t("settings.canUseMultipleBabies")}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      {t("settings.canUseMultipleBabiesAnswer")}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </Card>
            
            <Card className="overflow-hidden border-none shadow-md">
              <div className="p-4 bg-primary/10 border-b flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                <h2 className="text-lg font-semibold">{t("settings.contactSupport")}</h2>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  {user?.email ? (
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <p className="font-medium">{t("settings.yourEmail")}:</p>
                      <p>{user.email}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("settings.yourEmail")}</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder={t("settings.enterEmail")}
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">{t("settings.message")}</Label>
                    <Textarea 
                      id="message" 
                      placeholder={t("settings.howCanWeHelp")}
                      rows={4}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                  
                  <Button onClick={handleSendSupportEmail} className="w-full sm:w-auto">
                    {t("settings.sendMessage")}
                  </Button>
                  
                  <div className="pt-4 mt-4 border-t text-sm">
                    <p className="font-medium mb-1">{t("settings.emailUsDirectly")}:</p>
                    <a href="mailto:babycare000001@gmail.com" className="text-primary hover:underline flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      babycare000001@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="about" className="animation-fade-in">
            <Card className="overflow-hidden border-none shadow-md">
              <div className="p-6 flex items-center justify-center flex-col border-b">
                <div className="w-24 h-24 flex items-center justify-center bg-primary/10 rounded-full mb-3">
                  <BabyIcon className="w-16 h-16 text-primary" />
                </div>
                <h2 className="font-bold text-3xl mb-1">BabyCare</h2>
                <p className="text-sm text-muted-foreground">{t("settings.version")} 1.0.0</p>
                <p className="text-xs text-muted-foreground mt-1">© 2025 BabyCare</p>
              </div>
              
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("settings.aboutBabyCare")}</h3>
                  <p className="text-muted-foreground">
                    {t("settings.aboutBabyCareDescription")}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("settings.privacyPolicy")}</h3>
                  <p className="text-muted-foreground mb-2">
                    {t("settings.privacyPolicyDescription")}
                  </p>
                  <Button variant="link" className="px-0">
                    {t("settings.readFullPrivacyPolicy")} →
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("settings.termsOfService")}</h3>
                  <p className="text-muted-foreground mb-2">
                    {t("settings.termsOfServiceDescription")}
                  </p>
                  <Button variant="link" className="px-0">
                    {t("settings.readTermsOfService")} →
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
