
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Feeding } from '@/types/models';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, getRelativeDateLabel } from '@/lib/date-utils';

interface FeedingInsightsProps {
  feedingEntries: Feeding[];
}

export const FeedingInsights: React.FC<FeedingInsightsProps> = ({ feedingEntries }) => {
  const { t } = useLanguage();

  // Calculate statistics from feeding entries
  const stats = useMemo(() => {
    if (!feedingEntries.length) return { total: 0, totalAmount: 0, averageAmount: 0, typeBreakdown: {}, dailyAvg: 0 };

    // Sort entries by date for calculations
    const sortedEntries = [...feedingEntries].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    const total = sortedEntries.length;
    
    // Calculate days between first and last entry
    const firstDate = new Date(sortedEntries[0].time);
    const lastDate = new Date(sortedEntries[sortedEntries.length - 1].time);
    const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate total and average amounts
    let totalAmount = 0;
    const typeBreakdown: Record<string, number> = {};
    
    sortedEntries.forEach(feeding => {
      const amount = Number(feeding.amount) || 0;
      totalAmount += amount;
      
      const type = feeding.type || 'Unknown';
      typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
    });
    
    const averageAmount = total > 0 ? totalAmount / total : 0;
    const dailyAvg = total / daysDiff;

    return {
      total,
      totalAmount,
      averageAmount,
      typeBreakdown,
      dailyAvg
    };
  }, [feedingEntries]);

  // Prepare data for charts
  const typeChartData = useMemo(() => {
    return Object.entries(stats.typeBreakdown).map(([name, value]) => ({
      name,
      value: Number(value), // Ensure this is a number
    }));
  }, [stats.typeBreakdown]);

  // Daily breakdown
  const dailyData = useMemo(() => {
    const last7Days = new Map<string, { date: string, count: number, amount: number }>();
    
    // Initialize last 7 days with 0 counts
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = formatDate(date);
      last7Days.set(dateKey, { date: dateKey, count: 0, amount: 0 });
    }
    
    // Fill in actual counts and amounts
    feedingEntries.forEach(feeding => {
      const date = new Date(feeding.time);
      const dateKey = formatDate(date);
      
      if (last7Days.has(dateKey)) {
        const current = last7Days.get(dateKey)!;
        const amount = Number(feeding.amount) || 0;
        last7Days.set(dateKey, { 
          ...current, 
          count: current.count + 1,
          amount: current.amount + amount
        });
      }
    });
    
    return Array.from(last7Days.values()).map(item => ({
      name: getRelativeDateLabel(item.date),
      count: item.count,
      amount: item.amount
    }));
  }, [feedingEntries]);

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("insights.feedingOverview")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <h3 className="text-muted-foreground">{t("insights.totalFeedings")}</h3>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <h3 className="text-muted-foreground">{t("insights.avgPerDay")}</h3>
              <p className="text-3xl font-bold">{stats.dailyAvg.toFixed(1)}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <h3 className="text-muted-foreground">{t("insights.avgAmount")}</h3>
              <p className="text-3xl font-bold">{stats.averageAmount.toFixed(1)} ml</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("insights.feedingTypes")}</CardTitle>
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
                  <Tooltip formatter={(value) => [value, t("insights.feedings")]} />
                  <Legend />
                  <Bar dataKey="count" name={t("insights.feedings")} fill="#8884d8" />
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
    </div>
  );
};
