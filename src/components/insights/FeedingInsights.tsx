
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Feeding, FeedingType } from '@/types/models';
import { format, startOfDay, endOfDay, subDays, differenceInDays } from 'date-fns';

interface FeedingInsightsProps {
  feedings: Feeding[];
}

export const FeedingInsights: React.FC<FeedingInsightsProps> = ({ feedings }) => {
  const { t } = useLanguage();

  // Calculate feeding statistics
  const stats = useMemo(() => {
    if (!feedings.length) return null;

    // Get the date range
    const dates = feedings.map(f => f.startTime);
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const latestDate = new Date();
    const daysDifference = Math.max(1, differenceInDays(latestDate, earliestDate));
    
    // Feeding counts by type
    const feedingsByType: Record<string, number> = {};
    feedings.forEach(feeding => {
      feedingsByType[feeding.type] = (feedingsByType[feeding.type] || 0) + 1;
    });
    
    // Average number of feedings per day
    const avgFeedingsPerDay = feedings.length / daysDifference;
    
    // Average amounts for bottle/formula feedings
    const bottleFeedings = feedings.filter(f => 
      (f.type === 'bottle' || f.type === 'formula') && f.amount !== undefined
    );
    
    const avgAmount = bottleFeedings.length > 0 
      ? bottleFeedings.reduce((sum, f) => sum + (f.amount || 0), 0) / bottleFeedings.length
      : 0;
    
    // Average duration for breastfeedings
    const breastFeedings = feedings.filter(f => 
      (f.type === 'breast-left' || f.type === 'breast-right') && f.duration !== undefined
    );
    
    const avgDuration = breastFeedings.length > 0
      ? breastFeedings.reduce((sum, f) => sum + (f.duration || 0), 0) / breastFeedings.length
      : 0;
    
    // Recent data (last 7 days)
    const lastWeekStart = subDays(new Date(), 7);
    const lastWeekFeedings = feedings.filter(f => f.startTime >= lastWeekStart);
    
    return {
      totalFeedings: feedings.length,
      feedingsByType,
      avgFeedingsPerDay,
      avgAmount,
      avgDuration,
      lastWeekFeedings,
      dayRange: daysDifference
    };
  }, [feedings]);

  // Format feeding data for the pie chart
  const pieChartData = useMemo(() => {
    if (!stats) return [];
    
    return Object.entries(stats.feedingsByType).map(([type, count]) => ({
      name: getFeedingTypeName(type as FeedingType),
      value: count
    }));
  }, [stats]);

  // Format feeding data for the bar chart (last 7 days)
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
        breast: 0,
        bottle: 0,
        solid: 0
      };
    }
    
    // Add feeding counts
    stats.lastWeekFeedings.forEach(feeding => {
      const dateKey = format(feeding.startTime, 'MM-dd');
      if (daysMap[dateKey]) {
        daysMap[dateKey].total++;
        
        if (feeding.type === 'breast-left' || feeding.type === 'breast-right') {
          daysMap[dateKey].breast++;
        } else if (feeding.type === 'bottle' || feeding.type === 'formula') {
          daysMap[dateKey].bottle++;
        } else if (feeding.type === 'solid') {
          daysMap[dateKey].solid++;
        }
      }
    });
    
    return Object.values(daysMap);
  }, [stats]);

  // Helper to get human-readable feeding type names
  function getFeedingTypeName(type: FeedingType): string {
    switch(type) {
      case 'breast-left':
        return t('feeding.breastLeft');
      case 'breast-right':
        return t('feeding.breastRight');
      case 'bottle':
        return t('feeding.bottle');
      case 'formula':
        return t('feeding.formula');
      case 'solid':
        return t('feeding.solid');
      default:
        return type;
    }
  }

  // Colors for the pie chart
  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('insights.feedingInsights')}</CardTitle>
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
        <CardTitle>{t('insights.feedingInsights')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-600">{t('insights.avgFeedingsPerDay')}</p>
            <p className="text-2xl font-bold">{stats.avgFeedingsPerDay.toFixed(1)}</p>
          </div>
          
          {stats.avgAmount > 0 && (
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-600">{t('insights.avgBottleAmount')}</p>
              <p className="text-2xl font-bold">{stats.avgAmount.toFixed(0)} ml</p>
            </div>
          )}
          
          {stats.avgDuration > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-purple-600">{t('insights.avgBreastfeedingDuration')}</p>
              <p className="text-2xl font-bold">{stats.avgDuration.toFixed(0)} min</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feeding Distribution Pie Chart */}
          <div>
            <h3 className="font-medium mb-3 text-center">{t('insights.feedingDistribution')}</h3>
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

          {/* Weekly Feeding Trends */}
          <div>
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
                    <Bar dataKey="breast" name={t('insights.breastfeeding')} fill="#8884d8" />
                    <Bar dataKey="bottle" name={t('insights.bottleFeeding')} fill="#82ca9d" />
                    <Bar dataKey="solid" name={t('insights.solidFood')} fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">{t('insights.noData')}</p>
                </div>
              )}
            </div>
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
