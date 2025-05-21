import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Diaper, DiaperType } from '@/types/models';
import { format, startOfDay, endOfDay, subDays, differenceInDays } from 'date-fns';

interface DiaperInsightsProps {
  diapers: Diaper[];
}

export const DiaperInsights: React.FC<DiaperInsightsProps> = ({ diapers }) => {
  const { t } = useLanguage();

  // Calculate diaper statistics
  const stats = useMemo(() => {
    if (!diapers.length) return null;

    // Get the date range
    const dates = diapers.map(d => d.time);
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const latestDate = new Date();
    const daysDifference = Math.max(1, differenceInDays(latestDate, earliestDate));
    
    // Diaper counts by type
    const diapersByType: Record<string, number> = {};
    diapers.forEach(diaper => {
      diapersByType[diaper.type] = (diapersByType[diaper.type] || 0) + 1;
    });
    
    // Average number of diapers per day
    const avgDiapersPerDay = diapers.length / daysDifference;
    
    // Recent data (last 7 days)
    const lastWeekStart = subDays(new Date(), 7);
    const lastWeekDiapers = diapers.filter(d => d.time >= lastWeekStart);
    
    // Distribution by time of day (morning, afternoon, evening, night)
    const timeDistribution = {
      morning: 0,   // 6am-12pm
      afternoon: 0, // 12pm-6pm
      evening: 0,   // 6pm-12am
      night: 0      // 12am-6am
    };
    
    diapers.forEach(diaper => {
      const hour = diaper.time.getHours();
      if (hour >= 6 && hour < 12) {
        timeDistribution.morning++;
      } else if (hour >= 12 && hour < 18) {
        timeDistribution.afternoon++;
      } else if (hour >= 18 && hour < 24) {
        timeDistribution.evening++;
      } else {
        timeDistribution.night++;
      }
    });
    
    return {
      totalDiapers: diapers.length,
      diapersByType,
      avgDiapersPerDay,
      lastWeekDiapers,
      timeDistribution,
      dayRange: daysDifference
    };
  }, [diapers]);

  // Format diaper data for the pie chart
  const pieChartData = useMemo(() => {
    if (!stats) return [];
    
    return Object.entries(stats.diapersByType).map(([type, count]) => ({
      name: getDiaperTypeName(type as DiaperType),
      value: count
    }));
  }, [stats]);

  // Format diaper data for the bar chart (last 7 days)
  const barChartData = useMemo(() => {
    if (!stats) return [];
    
    const daysMap: Record<string, Record<string, number>> = {};
    
    // Initialize days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'MM-dd');
      daysMap[dateKey] = {
        date: format(date, 'MMM d'),
        total: 0,
        wet: 0,
        dirty: 0,
        mixed: 0
      };
    }
    
    // Add diaper counts
    stats.lastWeekDiapers.forEach(diaper => {
      const dateKey = format(diaper.time, 'MM-dd');
      if (daysMap[dateKey]) {
        daysMap[dateKey].total++;
        daysMap[dateKey][diaper.type]++;
      }
    });
    
    return Object.values(daysMap);
  }, [stats]);

  // Format time distribution data
  const timeDistributionData = useMemo(() => {
    if (!stats) return [];
    
    return [
      { name: t('insights.morning'), value: stats.timeDistribution.morning },
      { name: t('insights.afternoon'), value: stats.timeDistribution.afternoon },
      { name: t('insights.evening'), value: stats.timeDistribution.evening },
      { name: t('insights.night'), value: stats.timeDistribution.night }
    ];
  }, [stats, t]);

  // Helper to get human-readable diaper type names
  function getDiaperTypeName(type: DiaperType): string {
    switch(type) {
      case 'wet':
        return t('diaper.wet');
      case 'dirty':
        return t('diaper.dirty');
      case 'mixed':
        return t('diaper.mixed');
      default:
        return type;
    }
  }

  // Colors for the pie charts
  const TYPE_COLORS = ['#36A2EB', '#FFCE56', '#FF6384'];
  const TIME_COLORS = ['#FFD700', '#FF7F50', '#6A5ACD', '#2E8B57'];

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('insights.diaperInsights')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p>{t('insights.notEnoughData')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('insights.diaperInsights')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-600">{t('insights.avgDiapersPerDay')}</p>
            <p className="text-2xl font-bold">{stats.avgDiapersPerDay.toFixed(1)}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-green-600">{t('insights.wetDiapers')}</p>
            <p className="text-2xl font-bold">{stats.diapersByType.wet || 0}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-sm text-purple-600">{t('insights.dirtyDiapers')}</p>
            <p className="text-2xl font-bold">{stats.diapersByType.dirty || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diaper Type Distribution Pie Chart */}
          <div>
            <h3 className="font-medium mb-3 text-center">{t('insights.diaperDistribution')}</h3>
            <div className="h-[300px]">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">{t('insights.noData')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Time of Day Distribution */}
          <div>
            <h3 className="font-medium mb-3 text-center">{t('insights.timeDistribution')}</h3>
            <div className="h-[300px]">
              {timeDistributionData.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {timeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TIME_COLORS[index % TIME_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">{t('insights.noData')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Trends */}
        <div className="mt-6">
          <h3 className="font-medium mb-3 text-center">{t('insights.weeklyTrends')}</h3>
          <div className="h-[300px]">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="wet" name={t('diaper.wet')} fill="#36A2EB" />
                  <Bar dataKey="dirty" name={t('diaper.dirty')} fill="#FFCE56" />
                  <Bar dataKey="mixed" name={t('diaper.mixed')} fill="#FF6384" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">{t('insights.noData')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-sm">
          <p className="text-gray-500">
            {t('insights.basedOnData', { days: stats.dayRange })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
