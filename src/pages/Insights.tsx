
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { FeedingInsights } from "@/components/insights/FeedingInsights";
import { DiaperInsights } from "@/components/insights/DiaperInsights";
import { GraphComponent } from "@/components/charts/GraphComponent";
import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBaby } from "@/hooks/useBaby";
import { getFeedingsByBabyId } from "@/services/feedingService";
import { getDiapersByBabyId } from "@/services/diaperService";

const Insights = () => {
  const { selectedBaby } = useBaby();

  // Fetch feeding data for insights
  const { data: feedingEntries = [] } = useQuery({
    queryKey: ['feedings', selectedBaby?.id],
    queryFn: () => selectedBaby ? getFeedingsByBabyId(selectedBaby.id) : Promise.resolve([]),
    enabled: !!selectedBaby,
  });

  // Fetch diaper data for insights
  const { data: diaperEntries = [] } = useQuery({
    queryKey: ['diapers', selectedBaby?.id],
    queryFn: () => selectedBaby ? getDiapersByBabyId(selectedBaby.id) : Promise.resolve([]),
    enabled: !!selectedBaby,
  });

  if (!selectedBaby) {
    return (
      <Layout>
        <div className="p-4 max-w-md mx-auto">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2 text-foreground">No Baby Selected</h2>
            <p className="text-muted-foreground">Please add a baby to view insights.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">Insights & Reports</h1>
          <p className="text-muted-foreground">Track {selectedBaby.name}'s patterns and growth</p>
        </div>

        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="space-y-6">
              <FeedingInsights feedingEntries={feedingEntries} />
              <DiaperInsights diaperEntries={diaperEntries} />
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth & Activity Charts</CardTitle>
              </CardHeader>
              <CardContent>
                <GraphComponent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportGenerator babyId={selectedBaby.id} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Insights;
