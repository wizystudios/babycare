import { supabase } from '@/integrations/supabase/client';
import { Growth } from '@/types/models';

export interface TrendAnalysis {
  metric: 'weight' | 'height' | 'headCircumference';
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number; // Change per month
  confidence: number; // 0-1
  predictions: {
    oneMonth: number;
    threeMonths: number;
    sixMonths: number;
  };
}

export interface GrowthPercentile {
  metric: 'weight' | 'height' | 'headCircumference';
  percentile: number;
  zscore: number;
  category: 'below_3rd' | 'below_10th' | 'normal' | 'above_90th' | 'above_97th';
}

export interface AnalyticsInsights {
  trends: TrendAnalysis[];
  percentiles: GrowthPercentile[];
  recommendations: string[];
  alerts: {
    level: 'info' | 'warning' | 'critical';
    message: string;
    metric?: string;
  }[];
}

// WHO Growth Standards data (simplified for demo)
const WHO_STANDARDS = {
  weight: {
    male: [
      { age: 0, p3: 2.5, p10: 2.8, p50: 3.3, p90: 3.9, p97: 4.3 },
      { age: 1, p3: 3.4, p10: 3.9, p50: 4.5, p90: 5.1, p97: 5.6 },
      { age: 2, p3: 4.3, p10: 4.9, p50: 5.6, p90: 6.3, p97: 6.9 },
      { age: 3, p3: 5.0, p10: 5.7, p50: 6.4, p90: 7.2, p97: 7.9 },
      { age: 6, p3: 6.4, p10: 7.3, p50: 8.0, p90: 8.8, p97: 9.5 },
      { age: 12, p3: 8.4, p10: 9.4, p50: 10.2, p90: 11.1, p97: 11.8 },
    ],
    female: [
      { age: 0, p3: 2.4, p10: 2.7, p50: 3.2, p90: 3.7, p97: 4.1 },
      { age: 1, p3: 3.2, p10: 3.6, p50: 4.2, p90: 4.8, p97: 5.3 },
      { age: 2, p3: 3.9, p10: 4.5, p50: 5.1, p90: 5.8, p97: 6.4 },
      { age: 3, p3: 4.5, p10: 5.2, p50: 5.8, p90: 6.6, p97: 7.2 },
      { age: 6, p3: 5.7, p10: 6.5, p50: 7.3, p90: 8.2, p97: 8.9 },
      { age: 12, p3: 7.0, p10: 8.1, p50: 9.0, p90: 10.1, p97: 10.9 },
    ],
  },
  height: {
    male: [
      { age: 0, p3: 46.1, p10: 47.5, p50: 49.9, p90: 52.3, p97: 53.7 },
      { age: 1, p3: 50.8, p10: 52.3, p50: 54.7, p90: 57.1, p97: 58.6 },
      { age: 2, p3: 54.4, p10: 56.0, p50: 58.4, p90: 60.8, p97: 62.4 },
      { age: 3, p3: 57.3, p10: 59.0, p50: 61.4, p90: 63.8, p97: 65.5 },
      { age: 6, p3: 63.3, p10: 65.1, p50: 67.6, p90: 70.1, p97: 71.9 },
      { age: 12, p3: 71.0, p10: 73.0, p50: 75.7, p90: 78.4, p97: 80.5 },
    ],
    female: [
      { age: 0, p3: 45.4, p10: 46.8, p50: 49.1, p90: 51.4, p97: 52.9 },
      { age: 1, p3: 49.8, p10: 51.2, p50: 53.7, p90: 56.1, p97: 57.6 },
      { age: 2, p3: 53.0, p10: 54.6, p50: 57.1, p90: 59.5, p97: 61.1 },
      { age: 3, p3: 55.6, p10: 57.3, p50: 59.8, p90: 62.2, p97: 63.9 },
      { age: 6, p3: 61.2, p10: 63.0, p50: 65.7, p90: 68.3, p97: 70.2 },
      { age: 12, p3: 68.9, p10: 70.8, p50: 74.0, p90: 77.1, p97: 79.2 },
    ],
  },
};

const calculateAgeInMonths = (birthDate: Date, measurementDate: Date): number => {
  const diffTime = measurementDate.getTime() - birthDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.round(diffDays / 30.44); // Average days per month
};

const interpolatePercentile = (age: number, value: number, gender: 'male' | 'female', metric: 'weight' | 'height'): GrowthPercentile => {
  const standards = WHO_STANDARDS[metric][gender];
  
  // Find the two closest age points
  let lowerPoint = standards[0];
  let upperPoint = standards[standards.length - 1];
  
  for (let i = 0; i < standards.length - 1; i++) {
    if (age >= standards[i].age && age <= standards[i + 1].age) {
      lowerPoint = standards[i];
      upperPoint = standards[i + 1];
      break;
    }
  }
  
  // Simple interpolation
  const ageRatio = (age - lowerPoint.age) / (upperPoint.age - lowerPoint.age);
  const p3 = lowerPoint.p3 + (upperPoint.p3 - lowerPoint.p3) * ageRatio;
  const p10 = lowerPoint.p10 + (upperPoint.p10 - lowerPoint.p10) * ageRatio;
  const p50 = lowerPoint.p50 + (upperPoint.p50 - lowerPoint.p50) * ageRatio;
  const p90 = lowerPoint.p90 + (upperPoint.p90 - lowerPoint.p90) * ageRatio;
  const p97 = lowerPoint.p97 + (upperPoint.p97 - lowerPoint.p97) * ageRatio;
  
  // Calculate percentile and z-score
  let percentile = 50;
  let category: GrowthPercentile['category'] = 'normal';
  
  if (value < p3) {
    percentile = 1.5;
    category = 'below_3rd';
  } else if (value < p10) {
    percentile = 6.5;
    category = 'below_10th';
  } else if (value > p97) {
    percentile = 98.5;
    category = 'above_97th';
  } else if (value > p90) {
    percentile = 93.5;
    category = 'above_90th';
  } else {
    // Linear interpolation between percentiles
    if (value <= p50) {
      percentile = 10 + ((value - p10) / (p50 - p10)) * 40;
    } else {
      percentile = 50 + ((value - p50) / (p90 - p50)) * 40;
    }
  }
  
  // Simple z-score calculation
  const zscore = (value - p50) / ((p90 - p10) / 2.56); // Approximate SD
  
  return {
    metric,
    percentile: Math.round(percentile),
    zscore: Math.round(zscore * 100) / 100,
    category,
  };
};

const calculateTrend = (records: Growth[], metric: 'weight' | 'height' | 'headCircumference'): TrendAnalysis => {
  if (records.length < 2) {
    return {
      metric,
      trend: 'stable',
      changeRate: 0,
      confidence: 0,
      predictions: { oneMonth: 0, threeMonths: 0, sixMonths: 0 },
    };
  }
  
  // Sort by date
  const sortedRecords = [...records].sort((a, b) => a.date.getTime() - b.date.getTime());
  const values = sortedRecords.map(r => {
    switch (metric) {
      case 'weight': return r.weight || 0;
      case 'height': return r.height || 0;
      case 'headCircumference': return r.headCircumference || 0;
    }
  });
  
  // Calculate linear regression
  const n = values.length;
  const x = Array.from({length: n}, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.map((xi, i) => xi * values[i]).reduce((a, b) => a + b, 0);
  const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Convert slope to monthly rate (assuming measurements are roughly monthly)
  const changeRate = slope;
  const lastValue = values[values.length - 1];
  
  return {
    metric,
    trend: changeRate > 0.1 ? 'increasing' : changeRate < -0.1 ? 'decreasing' : 'stable',
    changeRate: Math.round(changeRate * 100) / 100,
    confidence: Math.min(n / 5, 1), // Higher confidence with more data points
    predictions: {
      oneMonth: Math.round((lastValue + changeRate) * 100) / 100,
      threeMonths: Math.round((lastValue + changeRate * 3) * 100) / 100,
      sixMonths: Math.round((lastValue + changeRate * 6) * 100) / 100,
    },
  };
};

export const getAdvancedAnalytics = async (babyId: string): Promise<AnalyticsInsights> => {
  // Get baby info and growth records
  const [babyResult, growthResult] = await Promise.all([
    supabase.from('babies').select('*').eq('id', babyId).single(),
    supabase.from('growth_records').select('*').eq('baby_id', babyId).order('date', { ascending: true })
  ]);
  
  if (babyResult.error) throw babyResult.error;
  if (growthResult.error) throw growthResult.error;
  
  const baby = babyResult.data;
  const growthRecords: Growth[] = growthResult.data.map(record => ({
    id: record.id,
    babyId: record.baby_id,
    date: new Date(record.date),
    weight: record.weight,
    height: record.height,
    headCircumference: record.head_circumference,
    note: record.note,
  }));
  
  if (growthRecords.length === 0) {
    return {
      trends: [],
      percentiles: [],
      recommendations: ['Add growth measurements to see analytics'],
      alerts: [],
    };
  }
  
  const latestRecord = growthRecords[growthRecords.length - 1];
  const ageInMonths = calculateAgeInMonths(new Date(baby.birth_date), latestRecord.date);
  const gender = baby.gender as 'male' | 'female';
  
  // Calculate trends
  const trends: TrendAnalysis[] = [];
  if (latestRecord.weight) {
    trends.push(calculateTrend(growthRecords.filter(r => r.weight), 'weight'));
  }
  if (latestRecord.height) {
    trends.push(calculateTrend(growthRecords.filter(r => r.height), 'height'));
  }
  if (latestRecord.headCircumference) {
    trends.push(calculateTrend(growthRecords.filter(r => r.headCircumference), 'headCircumference'));
  }
  
  // Calculate percentiles
  const percentiles: GrowthPercentile[] = [];
  if (latestRecord.weight) {
    percentiles.push(interpolatePercentile(ageInMonths, latestRecord.weight, gender, 'weight'));
  }
  if (latestRecord.height) {
    percentiles.push(interpolatePercentile(ageInMonths, latestRecord.height, gender, 'height'));
  }
  
  // Generate recommendations and alerts
  const recommendations: string[] = [];
  const alerts: AnalyticsInsights['alerts'] = [];
  
  percentiles.forEach(p => {
    if (p.category === 'below_3rd') {
      alerts.push({
        level: 'critical',
        message: `${p.metric} is below 3rd percentile`,
        metric: p.metric,
      });
      recommendations.push(`Consult pediatrician about ${p.metric} being below normal range`);
    } else if (p.category === 'above_97th') {
      alerts.push({
        level: 'warning',
        message: `${p.metric} is above 97th percentile`,
        metric: p.metric,
      });
    }
  });
  
  trends.forEach(t => {
    if (t.trend === 'decreasing' && t.confidence > 0.6) {
      alerts.push({
        level: 'warning',
        message: `${t.metric} shows declining trend`,
        metric: t.metric,
      });
    }
  });
  
  if (recommendations.length === 0) {
    recommendations.push('Growth patterns appear normal');
    recommendations.push('Continue regular measurements');
  }
  
  return {
    trends,
    percentiles,
    recommendations,
    alerts,
  };
};