
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraphComponent } from "@/components/charts/GraphComponent";
import ChatComponent from "@/components/chat/ChatComponent";
import { useIsMobile } from "@/hooks/use-mobile";

const InsightsPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className="space-y-6 p-4">
        <h1 className="text-2xl font-bold text-baby-primary">BabyCare Insights</h1>
        
        <Tabs defaultValue="graphs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="graphs">Analytics</TabsTrigger>
            <TabsTrigger value="support">Support Chat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="graphs" className="pt-4">
            <GraphComponent />
          </TabsContent>
          
          <TabsContent value="support" className="pt-4">
            <ChatComponent />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default InsightsPage;
