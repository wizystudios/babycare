import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useBaby } from '@/hooks/useBaby';
import { getAdvancedAnalytics, type AnalyticsInsights, type TrendAnalysis, type GrowthPercentile } from '@/services/advancedAnalyticsService';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdvancedAnalytics = () => {
  const { selectedBaby } = useBaby();
  const [analytics, setAnalytics] = useState<AnalyticsInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedBaby?.id) {
      fetchAnalytics();
    }
  }, [selectedBaby?.id]);

  const fetchAnalytics = async () => {
    if (!selectedBaby?.id) return;
    
    try {
      setLoading(true);
      const data = await getAdvancedAnalytics(selectedBaby.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: TrendAnalysis['trend']) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'stable': return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPercentileColor = (category: GrowthPercentile['category']) => {
    switch (category) {
      case 'below_3rd': return 'text-destructive';
      case 'below_10th': return 'text-warning';
      case 'normal': return 'text-success';
      case 'above_90th': return 'text-warning';
      case 'above_97th': return 'text-destructive';
    }
  };

  const getAlertIcon = (level: 'info' | 'warning' | 'critical') => {
    switch (level) {
      case 'info': return <Info className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatMetricName = (metric: string) => {
    switch (metric) {
      case 'weight': return 'Weight';
      case 'height': return 'Height';
      case 'headCircumference': return 'Head Circumference';
      default: return metric;
    }
  };

  if (!selectedBaby) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No Baby Selected</h3>
          <p className="text-muted-foreground">Please select a baby to view analytics</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Unable to Load Analytics</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Advanced Analytics</h2>
        <p className="text-muted-foreground">
          Comprehensive growth analysis for {selectedBaby.name}
        </p>
      </div>

      {/* Alerts */}
      {analytics.alerts.length > 0 && (
        <div className="space-y-2">
          {analytics.alerts.map((alert, index) => (
            <Alert key={index} variant={alert.level === 'critical' ? 'destructive' : 'default'}>
              {getAlertIcon(alert.level)}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Growth Trends</TabsTrigger>
          <TabsTrigger value="percentiles">Percentiles</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analytics.trends.map((trend) => (
              <Card key={trend.metric}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    {formatMetricName(trend.metric)}
                    {getTrendIcon(trend.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trend</span>
                    <Badge variant={trend.trend === 'increasing' ? 'default' : trend.trend === 'decreasing' ? 'destructive' : 'secondary'}>
                      {trend.trend}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Change Rate</span>
                    <span className="text-sm font-medium">
                      {trend.changeRate > 0 ? '+' : ''}{trend.changeRate}/month
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <span className="text-sm font-medium">
                      {Math.round(trend.confidence * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="percentiles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {analytics.percentiles.map((percentile) => (
              <Card key={percentile.metric}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{formatMetricName(percentile.metric)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getPercentileColor(percentile.category)}`}>
                      {percentile.percentile}
                      <span className="text-sm font-normal">th</span>
                    </div>
                    <p className="text-sm text-muted-foreground">percentile</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Z-Score</span>
                    <span className="font-medium">{percentile.zscore}</span>
                  </div>
                  <Badge 
                    variant={percentile.category === 'normal' ? 'default' : 'secondary'}
                    className="w-full justify-center"
                  >
                    {percentile.category.replace('_', ' ')}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {analytics.trends.map((trend) => (
              <Card key={trend.metric}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {formatMetricName(trend.metric)} Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {trend.predictions.oneMonth}
                      </div>
                      <p className="text-sm text-muted-foreground">1 Month</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {trend.predictions.threeMonths}
                      </div>
                      <p className="text-sm text-muted-foreground">3 Months</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {trend.predictions.sixMonths}
                      </div>
                      <p className="text-sm text-muted-foreground">6 Months</p>
                    </div>
                  </div>
                  {trend.confidence < 0.5 && (
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Predictions have low confidence. More data points needed for accurate forecasting.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analytics.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;