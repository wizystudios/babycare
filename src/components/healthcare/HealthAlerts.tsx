import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import { useBaby } from '@/hooks/useBaby';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HealthAlert {
  type: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionable: string;
}

export const HealthAlerts = () => {
  const { selectedBaby } = useBaby();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalAlerts: 0, highSeverity: 0, mediumSeverity: 0, lowSeverity: 0 });

  const checkHealth = async () => {
    if (!selectedBaby) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('health-monitor', {
        body: { babyId: selectedBaby.id },
      });

      if (error) throw error;

      setAlerts(data.alerts || []);
      setSummary(data.summary || { totalAlerts: 0, highSeverity: 0, mediumSeverity: 0, lowSeverity: 0 });
      
      if (data.alerts.length === 0) {
        toast({ title: 'All good!', description: 'No health concerns detected.' });
      }
    } catch (error) {
      console.error('Error checking health:', error);
      toast({ title: 'Error checking health', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBaby) {
      checkHealth();
    }
  }, [selectedBaby]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'feeding': return <Activity className="h-3 w-3" />;
      case 'sleep': return <Activity className="h-3 w-3" />;
      case 'growth': return <TrendingUp className="h-3 w-3" />;
      default: return <AlertTriangle className="h-3 w-3" />;
    }
  };

  if (!selectedBaby) {
    return <div className="text-xs text-muted-foreground p-2">Please select a baby</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          AI Health Monitoring
        </h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={checkHealth} 
          disabled={loading}
          className="h-6 text-[10px]"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Check Now
        </Button>
      </div>

      {summary.totalAlerts > 0 && (
        <div className="flex gap-1">
          {summary.highSeverity > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">
              {summary.highSeverity} High
            </span>
          )}
          {summary.mediumSeverity > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
              {summary.mediumSeverity} Medium
            </span>
          )}
          {summary.lowSeverity > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
              {summary.lowSeverity} Low
            </span>
          )}
        </div>
      )}

      {alerts.length === 0 ? (
        <Card className="p-2">
          <p className="text-xs text-muted-foreground text-center">No health alerts at this time</p>
        </Card>
      ) : (
        <div className="space-y-1">
          {alerts.map((alert, index) => (
            <Card key={index} className={`p-2 border ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{getIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{alert.title}</p>
                  <p className="text-[10px] mt-0.5">{alert.message}</p>
                  <div className="mt-1 p-1 rounded bg-white/50">
                    <p className="text-[9px] font-medium">Action:</p>
                    <p className="text-[9px]">{alert.actionable}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
