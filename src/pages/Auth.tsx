
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
    <div className="min-h-screen bg-gradient-to-br from-baby-blue/20 to-baby-pink/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-white p-2 shadow-lg border-4 border-baby-primary flex items-center justify-center overflow-hidden">
            <img 
              src="/lovable-uploads/b7205a62-6702-4855-9178-d6cbe95eac27.png" 
              alt="BabyCare Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-baby-primary">BabyCare Daily</h1>
            <p className="text-gray-600 mt-2">{t("auth.tagline")}</p>
          </div>
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

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>{t("common.poweredBy")} KN Technology</p>
          <div className="flex items-center justify-center mt-2 space-x-2">
            <div className="w-6 h-6 rounded-full bg-white p-0.5 shadow-sm border flex items-center justify-center overflow-hidden">
              <img 
                src="/lovable-uploads/b7205a62-6702-4855-9178-d6cbe95eac27.png" 
                alt="KN Technology Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xs">KN Technology</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
