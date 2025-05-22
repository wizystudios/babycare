
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Diaper } from '@/types/models';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, getRelativeTimeLabel } from '@/lib/date-utils';

interface DiaperInsightsProps {
  diaperEntries: Diaper[];
}

export const DiaperInsights: React.FC<DiaperInsightsProps> = ({ diaperEntries }) => {
  const { t } = useLanguage();
  
  // Calculate statistics from diaper entries
  const stats = useMemo(() => {
    if (!diaperEntries.length) return { total: 0, average: 0, dailyAvg: 0, typeBreakdown: {}, wetCount: 0, dirtyCount: 0, mixedCount: 0 };
    
    // Sort entries by date for calculations
    const sortedEntries = [...diaperEntries].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    const total = sortedEntries.length;
    
    // Calculate days between first and last entry
    const firstDate = new Date(sortedEntries[0].time);
    const lastDate = new Date(sortedEntries[sortedEntries.length - 1].time);
    const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Type counts
    const typeBreakdown: Record<string, number> = {};
    let wetCount = 0;
    let dirtyCount = 0;
    let mixedCount = 0;
    
    sortedEntries.forEach(diaper => {
      const type = diaper.type || 'Unknown';
      typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
      
      if (type === 'wet') wetCount++;
      if (type === 'dirty') dirtyCount++;
      if (type === 'mixed') mixedCount++;
    });
    
    // Daily average
    const dailyAvg = total / daysDiff;
    
    return {
      total,
      dailyAvg,
      typeBreakdown,
      wetCount,
      dirtyCount,
      mixedCount
    };
  }, [diaperEntries]);
  
  // Prepare data for charts
  const typeChartData = useMemo(() => {
    return Object.entries(stats.typeBreakdown).map(([name, value]) => ({
      name,
      value: Number(value), // Ensure this is a number
    }));
  }, [stats.typeBreakdown]);
  
  // Daily breakdown
  const dailyData = useMemo(() => {
    const last7Days = new Map<string, { date: string, count: number }>();
    
    // Initialize last 7 days with 0 counts
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = formatDate(date);
      last7Days.set(dateKey, { date: dateKey, count: 0 });
    }
    
    // Fill in actual counts
    diaperEntries.forEach(diaper => {
      const date = new Date(diaper.time);
      const dateKey = formatDate(date);
      
      if (last7Days.has(dateKey)) {
        const current = last7Days.get(dateKey)!;
        last7Days.set(dateKey, { ...current, count: current.count + 1 });
      }
    });
    
    return Array.from(last7Days.values()).map(item => ({
      name: getRelativeTimeLabel(new Date(item.date)),
      count: item.count
    }));
  }, [diaperEntries]);
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("insights.diaperOverview")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <h3 className="text-muted-foreground">{t("insights.totalDiapers")}</h3>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <h3 className="text-muted-foreground">{t("insights.avgPerDay")}</h3>
              <p className="text-3xl font-bold">{stats.dailyAvg.toFixed(1)}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <h3 className="text-muted-foreground">{t("insights.mostCommonType")}</h3>
              <p className="text-3xl font-bold capitalize">
                {Object.entries(stats.typeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("insights.diaperTypes")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, t("insights.count")]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">{t("insights.noData")}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("insights.last7Days")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {dailyData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [value, t("insights.diapers")]} />
                  <Legend />
                  <Bar dataKey="count" name={t("insights.diapers")} fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">{t("insights.noData")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("insights.diaperTypeBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <h3 className="text-muted-foreground capitalize">{t("common.wet")}</h3>
              <p className="text-3xl font-bold">{stats.wetCount}</p>
              <p className="text-sm text-muted-foreground">
                {stats.total > 0 ? `${((stats.wetCount / stats.total) * 100).toFixed(0)}%` : '0%'}
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <h3 className="text-muted-foreground capitalize">{t("common.dirty")}</h3>
              <p className="text-3xl font-bold">{stats.dirtyCount}</p>
              <p className="text-sm text-muted-foreground">
                {stats.total > 0 ? `${((stats.dirtyCount / stats.total) * 100).toFixed(0)}%` : '0%'}
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <h3 className="text-muted-foreground capitalize">{t("common.mixed")}</h3>
              <p className="text-3xl font-bold">{stats.mixedCount}</p>
              <p className="text-sm text-muted-foreground">
                {stats.total > 0 ? `${((stats.mixedCount / stats.total) * 100).toFixed(0)}%` : '0%'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
