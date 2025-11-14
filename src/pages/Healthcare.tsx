import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import PrescriptionManager from '@/components/healthcare/PrescriptionManager';
import EmergencyContacts from '@/components/healthcare/EmergencyContacts';
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics';
import ReportManagement from '@/components/reports/ReportManagement';
import { MedicationTracker } from '@/components/healthcare/MedicationTracker';
import { HealthAlerts } from '@/components/healthcare/HealthAlerts';
import { useAuth } from '@/contexts/AuthContext';

const Healthcare = () => {
  const { userRole } = useAuth();
  
  return (
    <Layout>
      <div className="space-y-2">
        <div>
          <h1 className="text-sm font-bold">Healthcare</h1>
          <p className="text-[10px] text-muted-foreground">
            Manage medications, track health, and view analytics
          </p>
        </div>
        
        <Tabs defaultValue="medications" className="space-y-2">
          <TabsList className="grid w-full grid-cols-6 h-7">
            <TabsTrigger value="medications" className="text-[10px]">Medications</TabsTrigger>
            <TabsTrigger value="alerts" className="text-[10px]">AI Alerts</TabsTrigger>
            <TabsTrigger value="prescriptions" className="text-[10px]">Prescriptions</TabsTrigger>
            <TabsTrigger value="emergency" className="text-[10px]">Emergency</TabsTrigger>
            <TabsTrigger value="analytics" className="text-[10px]">Analytics</TabsTrigger>
            <TabsTrigger value="documents" className="text-[10px]">
              {userRole === 'doctor' ? 'Reports' : 'Documents'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="medications" className="space-y-2 m-0">
            <MedicationTracker />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-2 m-0">
            <HealthAlerts />
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-2 m-0">
            <PrescriptionManager />
          </TabsContent>

          <TabsContent value="emergency" className="space-y-2 m-0">
            <EmergencyContacts />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-2 m-0">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="documents" className="space-y-2 m-0">
            {userRole === 'doctor' ? (
              <ReportManagement />
            ) : (
              <p className="text-xs text-center text-muted-foreground p-2">
                Documents feature coming soon
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Healthcare;