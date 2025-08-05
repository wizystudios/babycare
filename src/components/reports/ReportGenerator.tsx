
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Eye, ArrowDown } from 'lucide-react';
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
    const reportContent = generateHTMLReportContent(data, start, end);
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baby-report-${format(start, 'yyyy-MM-dd')}-to-${format(end, 'yyyy-MM-dd')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateHTMLReportContent = (data: any, start: Date, end: Date) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baby Care Report</title>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #fafafa; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { color: hsl(262.1 83.3% 57.8%); font-size: 2.5rem; margin-bottom: 10px; }
        .header .period { color: hsl(215.4 16.3% 46.9%); font-size: 1.1rem; }
        .header .generated { color: hsl(215.4 16.3% 56.9%); font-size: 0.9rem; }
        .section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .section-title { color: hsl(222.2 84% 4.9%); font-size: 1.4rem; font-weight: 600; margin-bottom: 16px; border-bottom: 2px solid hsl(262.1 83.3% 57.8%); padding-bottom: 8px; }
        .record { padding: 12px 0; border-bottom: 1px solid hsl(214.3 31.8% 91.4%); }
        .record:last-child { border-bottom: none; }
        .record-time { color: hsl(262.1 83.3% 57.8%); font-weight: 600; }
        .record-details { color: hsl(215.4 16.3% 46.9%); margin-top: 4px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
        .stat-card { background: hsl(262.1 83.3% 57.8%); color: white; padding: 16px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; }
        .stat-label { font-size: 0.9rem; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍼 Baby Care Report</h1>
        <div class="period">Period: ${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}</div>
        <div class="generated">Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}</div>
    </div>

    ${data.feedings?.length > 0 ? `
    <div class="section">
        <h2 class="section-title">🍼 Feeding Records (${data.feedings.length})</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${data.feedings.length}</div>
                <div class="stat-label">Total Feedings</div>
            </div>
        </div>
        ${data.feedings.map((feeding: any) => `
        <div class="record">
            <div class="record-time">${format(new Date(feeding.start_time), 'MMM dd, HH:mm')}</div>
            <div class="record-details">
                Type: ${feeding.type}
                ${feeding.duration ? ` • Duration: ${feeding.duration} min` : ''}
                ${feeding.amount ? ` • Amount: ${feeding.amount} ml` : ''}
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${data.diapers?.length > 0 ? `
    <div class="section">
        <h2 class="section-title">🧷 Diaper Changes (${data.diapers.length})</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${data.diapers.length}</div>
                <div class="stat-label">Total Changes</div>
            </div>
        </div>
        ${data.diapers.map((diaper: any) => `
        <div class="record">
            <div class="record-time">${format(new Date(diaper.time), 'MMM dd, HH:mm')}</div>
            <div class="record-details">Type: ${diaper.type}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${data.sleeps?.length > 0 ? `
    <div class="section">
        <h2 class="section-title">😴 Sleep Records (${data.sleeps.length})</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${data.sleeps.length}</div>
                <div class="stat-label">Sleep Sessions</div>
            </div>
        </div>
        ${data.sleeps.map((sleep: any) => `
        <div class="record">
            <div class="record-time">${format(new Date(sleep.start_time), 'MMM dd, HH:mm')}</div>
            <div class="record-details">
                Type: ${sleep.type}
                ${sleep.duration ? ` • Duration: ${sleep.duration} min` : ''}
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${data.health?.length > 0 ? `
    <div class="section">
        <h2 class="section-title">🏥 Health Records (${data.health.length})</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${data.health.length}</div>
                <div class="stat-label">Health Entries</div>
            </div>
        </div>
        ${data.health.map((health: any) => `
        <div class="record">
            <div class="record-time">${format(new Date(health.date), 'MMM dd, yyyy')}</div>
            <div class="record-details">
                Type: ${health.type}
                ${health.value ? ` • Value: ${health.value}` : ''}
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${data.milestones?.length > 0 ? `
    <div class="section">
        <h2 class="section-title">🎉 Milestones (${data.milestones.length})</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${data.milestones.length}</div>
                <div class="stat-label">Achievements</div>
            </div>
        </div>
        ${data.milestones.map((milestone: any) => `
        <div class="record">
            <div class="record-time">${format(new Date(milestone.date), 'MMM dd, yyyy')}</div>
            <div class="record-details">${milestone.title}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>
    `;
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
            size="icon"
            className="shrink-0"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {reportData && (
          <div className="mt-4 p-4 bg-card border rounded-lg max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-4 text-primary">📊 Report Preview</h3>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: generateHTMLReportContent(
                  reportData, 
                  startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
                  endDate || new Date()
                ).replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*$/, '')
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
