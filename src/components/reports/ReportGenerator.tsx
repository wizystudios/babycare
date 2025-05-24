
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReportGeneratorProps {
  babyId: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ babyId }) => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<'feeding' | 'diaper' | 'sleep' | 'health' | 'milestones' | 'all'>('all');
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('week');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async (download = false) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let start = new Date();
      let end = new Date();
      
      if (period === 'custom') {
        if (!startDate || !endDate) {
          alert('Please select start and end dates for custom period');
          return;
        }
        start = startDate;
        end = endDate;
      } else {
        // Calculate date range based on period
        switch (period) {
          case 'day':
            start = new Date();
            start.setHours(0, 0, 0, 0);
            end = new Date();
            end.setHours(23, 59, 59, 999);
            break;
          case 'week':
            start = new Date();
            start.setDate(start.getDate() - 7);
            break;
          case 'month':
            start = new Date();
            start.setMonth(start.getMonth() - 1);
            break;
          case 'year':
            start = new Date();
            start.setFullYear(start.getFullYear() - 1);
            break;
        }
      }

      const data: any = {};

      // Fetch data based on report type
      if (reportType === 'all' || reportType === 'feeding') {
        const { data: feedings } = await supabase
          .from('feedings')
          .select('*')
          .eq('baby_id', babyId)
          .eq('user_id', user.id)
          .gte('start_time', start.toISOString())
          .lte('start_time', end.toISOString())
          .order('start_time', { ascending: false });
        data.feedings = feedings || [];
      }

      if (reportType === 'all' || reportType === 'diaper') {
        const { data: diapers } = await supabase
          .from('diapers')
          .select('*')
          .eq('baby_id', babyId)
          .eq('user_id', user.id)
          .gte('time', start.toISOString())
          .lte('time', end.toISOString())
          .order('time', { ascending: false });
        data.diapers = diapers || [];
      }

      if (reportType === 'all' || reportType === 'sleep') {
        const { data: sleeps } = await supabase
          .from('sleeps')
          .select('*')
          .eq('baby_id', babyId)
          .eq('user_id', user.id)
          .gte('start_time', start.toISOString())
          .lte('start_time', end.toISOString())
          .order('start_time', { ascending: false });
        data.sleeps = sleeps || [];
      }

      if (reportType === 'all' || reportType === 'health') {
        const { data: health } = await supabase
          .from('health_records')
          .select('*')
          .eq('baby_id', babyId)
          .eq('user_id', user.id)
          .gte('date', start.toISOString())
          .lte('date', end.toISOString())
          .order('date', { ascending: false });
        data.health = health || [];
      }

      if (reportType === 'all' || reportType === 'milestones') {
        const { data: milestones } = await supabase
          .from('milestones')
          .select('*')
          .eq('baby_id', babyId)
          .eq('user_id', user.id)
          .gte('date', start.toISOString())
          .lte('date', end.toISOString())
          .order('date', { ascending: false });
        data.milestones = milestones || [];
      }

      setReportData(data);

      if (download) {
        downloadReport(data, start, end);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (data: any, start: Date, end: Date) => {
    const reportContent = generateReportContent(data, start, end);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baby-report-${format(start, 'yyyy-MM-dd')}-to-${format(end, 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = (data: any, start: Date, end: Date) => {
    let content = `Baby Care Report\n`;
    content += `Period: ${format(start, 'yyyy-MM-dd')} to ${format(end, 'yyyy-MM-dd')}\n`;
    content += `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;

    if (data.feedings?.length > 0) {
      content += `=== FEEDING RECORDS (${data.feedings.length}) ===\n`;
      data.feedings.forEach((feeding: any) => {
        content += `${format(new Date(feeding.start_time), 'yyyy-MM-dd HH:mm')} - ${feeding.type}`;
        if (feeding.duration) content += ` (${feeding.duration} min)`;
        if (feeding.amount) content += ` (${feeding.amount} ml)`;
        content += '\n';
      });
      content += '\n';
    }

    if (data.diapers?.length > 0) {
      content += `=== DIAPER CHANGES (${data.diapers.length}) ===\n`;
      data.diapers.forEach((diaper: any) => {
        content += `${format(new Date(diaper.time), 'yyyy-MM-dd HH:mm')} - ${diaper.type}\n`;
      });
      content += '\n';
    }

    if (data.sleeps?.length > 0) {
      content += `=== SLEEP RECORDS (${data.sleeps.length}) ===\n`;
      data.sleeps.forEach((sleep: any) => {
        content += `${format(new Date(sleep.start_time), 'yyyy-MM-dd HH:mm')} - ${sleep.type}`;
        if (sleep.duration) content += ` (${sleep.duration} min)`;
        content += '\n';
      });
      content += '\n';
    }

    if (data.health?.length > 0) {
      content += `=== HEALTH RECORDS (${data.health.length}) ===\n`;
      data.health.forEach((health: any) => {
        content += `${format(new Date(health.date), 'yyyy-MM-dd')} - ${health.type}`;
        if (health.value) content += ` (${health.value})`;
        content += '\n';
      });
      content += '\n';
    }

    if (data.milestones?.length > 0) {
      content += `=== MILESTONES (${data.milestones.length}) ===\n`;
      data.milestones.forEach((milestone: any) => {
        content += `${format(new Date(milestone.date), 'yyyy-MM-dd')} - ${milestone.title}\n`;
      });
      content += '\n';
    }

    return content;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="feeding">Feeding</SelectItem>
                <SelectItem value="diaper">Diaper</SelectItem>
                <SelectItem value="sleep">Sleep</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="milestones">Milestones</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Period</label>
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={() => generateReport(false)} 
            disabled={loading}
            className="flex-1"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview Report
          </Button>
          <Button 
            onClick={() => generateReport(true)} 
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>

        {reportData && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Report Preview</h3>
            <pre className="text-sm whitespace-pre-wrap">
              {generateReportContent(reportData, startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), endDate || new Date())}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
