
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

// Sample data for the charts
const feedingData = [
  { day: "Mon", amount: 120, duration: 15 },
  { day: "Tue", amount: 150, duration: 20 },
  { day: "Wed", amount: 130, duration: 18 },
  { day: "Thu", amount: 140, duration: 17 },
  { day: "Fri", amount: 160, duration: 22 },
  { day: "Sat", amount: 170, duration: 25 },
  { day: "Sun", amount: 155, duration: 21 },
];

const sleepData = [
  { day: "Mon", hours: 8, quality: 7 },
  { day: "Tue", hours: 7.5, quality: 6 },
  { day: "Wed", hours: 8.5, quality: 8 },
  { day: "Thu", hours: 6.5, quality: 5 },
  { day: "Fri", hours: 7, quality: 6 },
  { day: "Sat", hours: 9, quality: 9 },
  { day: "Sun", hours: 8, quality: 8 },
];

const diaperData = [
  { day: "Mon", wet: 5, dirty: 2 },
  { day: "Tue", wet: 6, dirty: 1 },
  { day: "Wed", wet: 4, dirty: 2 },
  { day: "Thu", wet: 5, dirty: 3 },
  { day: "Fri", wet: 6, dirty: 2 },
  { day: "Sat", wet: 5, dirty: 1 },
  { day: "Sun", wet: 4, dirty: 2 },
];

export const GraphComponent = () => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-baby-primary">BabyCare Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="feeding">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feeding">Feeding</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
            <TabsTrigger value="diaper">Diaper</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feeding" className="pt-4">
            <h3 className="font-medium mb-2">Feeding Trends (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
              <LineChart data={feedingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="amount" 
                  name="Amount (ml)" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="duration" 
                  name="Duration (min)" 
                  stroke="#82ca9d" 
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="sleep" className="pt-4">
            <h3 className="font-medium mb-2">Sleep Patterns (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
              <LineChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  name="Sleep (hours)" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="quality" 
                  name="Quality (1-10)" 
                  stroke="#82ca9d" 
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="diaper" className="pt-4">
            <h3 className="font-medium mb-2">Diaper Changes (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
              <BarChart data={diaperData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="wet" name="Wet Diapers" fill="#8884d8" />
                <Bar dataKey="dirty" name="Dirty Diapers" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GraphComponent;
