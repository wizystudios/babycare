
import React, { useState } from "react";
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
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Moon, Sun, HelpCircle, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [supportEmail, setSupportEmail] = useState<string>("");
  const [supportMessage, setSupportMessage] = useState<string>("");
  
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
    toast({
      title: "Data export initiated",
      description: "Your data will be prepared for download shortly.",
    });
  };
  
  const handleSendSupportEmail = () => {
    if (!supportEmail.trim() || !supportMessage.trim()) {
      toast({
        title: "Please fill all fields",
        description: "Email and message are required.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send an email
    toast({
      title: "Message sent",
      description: "Your support request has been sent. We'll get back to you soon.",
    });
    
    // Reset form
    setSupportEmail("");
    setSupportMessage("");
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
        
        <Tabs defaultValue="preferences">
          <TabsList className="mb-6">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="help">Help & Support</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
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
                  <Label htmlFor="notifications">{t("settings.notifications")}</Label>
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
                  Help & Instructions
                </h2>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I add a new baby?</AccordionTrigger>
                    <AccordionContent>
                      To add a new baby, tap on the "Add Your Baby" button from the home screen or Profile page. 
                      Fill in your baby's details including name, birth date, gender, and optionally weight and height.
                      You can also add a photo if you wish. Once you save, your baby will be added to your account.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I track feedings?</AccordionTrigger>
                    <AccordionContent>
                      Go to the "Feeding" page from the bottom navigation. Tap the "New Feeding" button to record 
                      a new feeding. You can select the type (breast, bottle, formula, or solid), 
                      enter the start and end times, amount (for bottle/formula), and add any notes.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I track diapers?</AccordionTrigger>
                    <AccordionContent>
                      Navigate to the "Diaper" page from the bottom navigation. Tap the "New Diaper" button and 
                      record the type (wet, dirty, or mixed), time, and any notes you want to add.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How do I track sleep?</AccordionTrigger>
                    <AccordionContent>
                      Go to the "Sleep" page and tap "New Sleep" to record sleep sessions. 
                      You can specify if it's a nap or night sleep, along with start and end times. 
                      Optionally, add location, mood, and notes.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How do I record milestones?</AccordionTrigger>
                    <AccordionContent>
                      Navigate to the "Milestones" page and tap "New Milestone". Add a title, date, 
                      category (e.g., Social, Motor Skills), and an optional description. 
                      This helps you keep track of your baby's development achievements.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger>Can I use the app for multiple babies?</AccordionTrigger>
                    <AccordionContent>
                      Yes! You can add multiple babies to your account and track information for each separately. 
                      Use the dropdown menu on each tracking page to switch between babies.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Support
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="How can we help you?"
                      rows={4}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSendSupportEmail}>
                    Send Message
                  </Button>
                  <div className="pt-4 text-sm text-muted-foreground">
                    <p>You can also email us directly at:</p>
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
                  <p className="text-sm text-gray-500">Version 1.0.0</p>
                  <p className="text-xs text-gray-400 mt-1">© 2025 BabyCare</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">About BabyCare</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  BabyCare is a comprehensive baby tracking application designed to help parents 
                  monitor their baby's daily activities and development. Track feedings, diapers, 
                  sleep patterns, growth, health records, and milestones all in one place.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Privacy Policy</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  At BabyCare, we take your privacy seriously. The data you enter about your baby is 
                  securely stored and is only accessible by you. We do not share or sell your data to 
                  third parties.
                </p>
                <Button variant="link" className="px-0">
                  Read Full Privacy Policy
                </Button>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Terms of Service</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  By using BabyCare, you agree to our terms of service. These terms outline how 
                  the application should be used and your rights as a user.
                </p>
                <Button variant="link" className="px-0">
                  Read Terms of Service
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
