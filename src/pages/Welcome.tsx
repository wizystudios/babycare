
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-4 md:px-6 flex justify-center border-b">
        <div className="container max-w-screen-xl flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/35d286c5-a006-4d46-8d1b-5b194dddf7f2.png" 
              alt="NK Technology Logo" 
              className="h-8 mr-2" 
            />
            <h1 className="text-2xl font-bold text-baby-blue">BabyCare</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row">
        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Karibu kwenye BabyCare Daily</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Tumia programu yetu kutunza afya na maendeleo ya mtoto wako. Fuatilia kila kitu kutoka 
              kulisha, kulala, kubadilisha nepi, na zaidi kutoka mahali popote.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Fuatilia lishe, muda wa kulala na kubadilisha nepi</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Weka kumbukumbu za hatua muhimu za ukuaji wa mtoto wako</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Fuatilia maendeleo na grafu za ukuaji</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Shiriki taarifa na watu wanaomtunza mtoto</span>
              </li>
            </ul>
            <div className="border-t pt-6 text-center">
              <p className="text-sm mb-2">
                Imetengenezwa na timu ya wataalamu wenye uzoefu wa elimu ya watoto na afya
              </p>
              <p className="text-sm font-semibold">
                NK Technology
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-gray-50 dark:bg-gray-800">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Karibu Tena</CardTitle>
              <CardDescription>Ingia au jiandikishe kuanza kutumia programu</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="login">Ingia</TabsTrigger>
                  <TabsTrigger value="register">Jiandikishe</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <p className="text-sm text-gray-500">
                Kwa kujiandikisha, unakubali masharti na sera zetu za matumizi
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="py-4 px-6 border-t text-center text-sm text-gray-500">
        <p>© 2025 BabyCare - Haki zote zimehifadhiwa. Imesanifiwa na NK Technology</p>
      </footer>
    </div>
  );
};

export default Welcome;
