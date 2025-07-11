import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/ui/loader";
import { AppLogo } from "@/components/ui/AppLogo";

const Auth = () => {
  const { t } = useLanguage();
  const { user, isLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState("login");
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Brand */}
          <div className="flex flex-col items-center space-y-4">
            <AppLogo size="lg" />
          </div>

          {/* Auth Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-baby-primary">
                {selectedTab === "login" ? t("auth.signIn") : t("auth.register")}
              </CardTitle>
              <CardDescription className="text-center">
                {selectedTab === "login" 
                  ? t("auth.signInDescription")
                  : t("auth.createAccount")
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t("auth.signIn")}</TabsTrigger>
                  <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <LoginForm />
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-3 px-4 text-center bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-primary/10">
        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
          <span>Powered by</span>
          <img 
            src="/lovable-uploads/10a31bb6-5b94-43dd-829b-c00dd01ddb89.png" 
            alt="KN Technology" 
            className="w-4 h-4"
          />
          <span className="font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">KN Technology</span>
        </div>
      </footer>
    </div>
  );
};

export default Auth;