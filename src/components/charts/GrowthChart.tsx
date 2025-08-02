
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Growth } from '@/types/models';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

// WHO percentile data (simplified version)
// Values represent the 3rd, 15th, 50th, 85th, and 97th percentiles
const boyPercentiles = {
  weight: {
    0: [2.9, 3.2, 3.5, 3.9, 4.2], // birth
    1: [3.9, 4.3, 4.7, 5.1, 5.5], // 1 month
    2: [4.9, 5.4, 5.9, 6.4, 6.9],
    3: [5.7, 6.2, 6.8, 7.4, 8.0],
    6: [7.0, 7.6, 8.2, 8.9, 9.5], 
    9: [8.0, 8.7, 9.4, 10.2, 11.0],
    12: [8.9, 9.7, 10.5, 11.3, 12.2], // 12 months
    18: [10.0, 10.9, 11.8, 12.8, 13.7], // 18 months
    24: [11.0, 12.0, 13.0, 14.0, 15.2], // 24 months
  },
  height: {
    0: [46.0, 48.0, 50.0, 52.0, 53.5], // birth
    1: [50.0, 52.0, 54.0, 56.0, 58.0], // 1 month
    2: [53.0, 55.0, 57.0, 59.0, 61.0],
    3: [56.0, 58.5, 60.5, 62.5, 64.5],
    6: [63.0, 65.5, 68.0, 70.5, 72.5],
    9: [68.0, 70.5, 73.0, 76.0, 78.0],
    12: [71.5, 74.0, 76.5, 79.5, 82.0], // 12 months
    18: [77.0, 80.0, 83.0, 86.0, 89.0], // 18 months
    24: [82.0, 85.5, 88.5, 92.0, 95.0], // 24 months
  }
};

const girlPercentiles = {
  weight: {
    0: [2.8, 3.1, 3.4, 3.7, 4.0], // birth
    1: [3.6, 4.0, 4.3, 4.7, 5.0], // 1 month
    2: [4.5, 4.9, 5.4, 5.8, 6.2],
    3: [5.2, 5.7, 6.2, 6.7, 7.2],
    6: [6.4, 7.0, 7.6, 8.2, 8.8],
    9: [7.3, 7.9, 8.6, 9.3, 10.0],
    12: [8.1, 8.8, 9.6, 10.4, 11.2], // 12 months
    18: [9.1, 10.0, 10.9, 11.9, 12.8], // 18 months
    24: [10.2, 11.2, 12.2, 13.3, 14.4], // 24 months
  },
  height: {
    0: [45.5, 47.0, 49.0, 51.0, 52.5], // birth
    1: [49.0, 51.0, 53.0, 55.0, 56.5], // 1 month
    2: [51.5, 54.0, 56.0, 58.0, 60.0],
    3: [54.5, 57.0, 59.0, 61.5, 63.5],
    6: [61.0, 63.5, 66.0, 68.5, 70.5],
    9: [66.0, 68.5, 71.0, 73.5, 76.0],
    12: [69.5, 72.0, 75.0, 78.0, 80.5], // 12 months
    18: [75.0, 78.0, 81.0, 84.0, 87.0], // 18 months
    24: [80.0, 84.0, 87.0, 90.5, 94.0], // 24 months
  }
};

interface GrowthChartProps {
  growthData: Growth[];
  gender: 'male' | 'female' | 'other';
  birthDate: Date;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ growthData, gender, birthDate }) => {
  const [metric, setMetric] = useState<'weight' | 'height' | 'headCircumference'>('weight');
  const { t } = useLanguage();

  // Calculate age in months for each data point
  const dataWithAge = growthData.map(record => {
    const recordDate = record.date;
    const ageInMonths = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 + 
                       (recordDate.getMonth() - birthDate.getMonth());
    
    return {
      ...record,
      ageInMonths,
      displayDate: format(recordDate, 'MMM d, yyyy')
    };
  }).sort((a, b) => a.ageInMonths - b.ageInMonths);

  // Format data for chart
  const chartData = dataWithAge.map(record => {
    return {
      ageInMonths: record.ageInMonths,
      [metric]: record[metric],
      date: record.displayDate
    };
  });

  // Get percentile data
  const percentileData = gender === 'female' ? girlPercentiles : boyPercentiles;
  
  // Generate percentile lines (simplified version)
  const getPercentilePoints = () => {
    const months = Object.keys(percentileData[metric as keyof typeof percentileData]).map(Number).sort((a, b) => a - b);
    const points = [];
    
    for (const month of months) {
      if (month > 24) continue; // Limit to first 24 months for simplicity
      
      const monthData = percentileData[metric as keyof typeof percentileData][month as keyof typeof percentileData[keyof typeof percentileData]];
      
      if (!monthData) continue;
      
      points.push({
        ageInMonths: month,
        p3: monthData[0],
        p15: monthData[1],
        p50: monthData[2],
        p85: monthData[3],
        p97: monthData[4]
      });
    }
    
    return points;
  };

  const percentilePoints = getPercentilePoints();
  
  // Get the unit for the selected metric
  const getUnit = () => {
    switch (metric) {
      case 'weight':
        return 'kg';
      case 'height':
        return 'cm';
      case 'headCircumference':
        return 'cm';
      default:
        return '';
    }
  };
  
  const getMetricName = () => {
    switch (metric) {
      case 'weight':
        return t('growth.weight');
      case 'height':
        return t('growth.height');
      case 'headCircumference':
        return t('growth.headCircumference');
      default:
        return '';
    }
  };

  return (
    <Card className="w-full max-w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle>{t('growth.chartTitle')}</CardTitle>
          <Select value={metric} onValueChange={(value: 'weight' | 'height' | 'headCircumference') => setMetric(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weight">{t('growth.weight')}</SelectItem>
              <SelectItem value="height">{t('growth.height')}</SelectItem>
              <SelectItem value="headCircumference">{t('growth.headCircumference')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full overflow-hidden">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData}
                margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
              >
                {/* Percentile lines */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="ageInMonths" 
                  name="Age" 
                  domain={[0, 'dataMax']}
                  type="number"
                  label={{ value: t('growth.ageInMonths'), position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']} 
                  label={{ value: `${getMetricName()} (${getUnit()})`, angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} ${getUnit()}`, getMetricName()]}
                  labelFormatter={(value) => `${t('growth.age')}: ${value} ${t('growth.months')}`}
                />
                <Legend />
                
                {/* Percentile lines */}
                <Line 
                  data={percentilePoints} 
                  type="monotone" 
                  dataKey="p3" 
                  name="3%" 
                  stroke="#d1d5db" 
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line 
                  data={percentilePoints} 
                  type="monotone" 
                  dataKey="p15" 
                  name="15%" 
                  stroke="#9ca3af" 
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line 
                  data={percentilePoints} 
                  type="monotone" 
                  dataKey="p50" 
                  name="50%" 
                  stroke="#6b7280" 
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line 
                  data={percentilePoints} 
                  type="monotone" 
                  dataKey="p85" 
                  name="85%" 
                  stroke="#9ca3af" 
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line 
                  data={percentilePoints} 
                  type="monotone" 
                  dataKey="p97" 
                  name="97%" 
                  stroke="#d1d5db" 
                  strokeDasharray="5 5"
                  dot={false}
                />
                
                {/* Baby's data */}
                <Line 
                  data={chartData} 
                  type="monotone" 
                  dataKey={metric} 
                  name={getMetricName()}
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">{t('growth.noData')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
