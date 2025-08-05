import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import PrescriptionManager from '@/components/healthcare/PrescriptionManager';
import EmergencyContacts from '@/components/healthcare/EmergencyContacts';
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics';
import { Pill, Phone, TrendingUp, FileText } from 'lucide-react';

const Healthcare = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Healthcare</h1>
          <p className="text-muted-foreground">
            Manage prescriptions, emergency contacts, and view advanced analytics
          </p>
        </div>
        
        <Tabs defaultValue="prescriptions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="prescriptions" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions">
            <PrescriptionManager />
          </TabsContent>

          <TabsContent value="emergency">
            <EmergencyContacts />
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="documents">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Medical Documents</h3>
              <p className="text-muted-foreground">Coming soon - Upload and manage medical documents</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Healthcare;