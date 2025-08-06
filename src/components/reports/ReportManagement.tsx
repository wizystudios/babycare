import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Share2, Calendar, User, Baby, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ReportRequest {
  id: string;
  doctor_id: string;
  parent_id: string;
  baby_id: string;
  period_start: string;
  period_end: string;
  report_type: string;
  message: string | null;
  status: string;
  created_at: string;
  parent_profile?: any;
  baby?: any;
}

interface BabyReport {
  id: string;
  baby_id: string;
  parent_id: string;
  doctor_id: string | null;
  period_start: string;
  period_end: string;
  title: string;
  report_type: string;
  data: any;
  shared_at: string | null;
  created_at: string;
  baby?: any;
  parent_profile?: any;
}

const ReportManagement = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ReportRequest[]>([]);
  const [myReports, setMyReports] = useState<BabyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ReportRequest | null>(null);
  const [reportDialog, setReportDialog] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');

  useEffect(() => {
    if (user) {
      fetchReportRequests();
      fetchMyReports();
    }
  }, [user]);

  const fetchReportRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('report_requests')
        .select(`
          *,
          parent_profile:profiles!report_requests_parent_id_fkey(full_name),
          baby:babies(name)
        `)
        .eq('doctor_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching report requests:', error);
      toast({
        title: "Error",
        description: "Failed to load report requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReports = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('baby_reports')
        .select(`
          *,
          baby:babies(name),
          parent_profile:profiles!baby_reports_parent_id_fkey(full_name)
        `)
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyReports((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching my reports:', error);
    }
  };

  const handleCreateReport = async () => {
    if (!selectedRequest || !reportTitle.trim() || !reportContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and content for the report",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create the report
      const { data: reportData, error: reportError } = await supabase
        .from('baby_reports')
        .insert({
          baby_id: selectedRequest.baby_id,
          parent_id: selectedRequest.parent_id,
          doctor_id: user!.id,
          period_start: selectedRequest.period_start,
          period_end: selectedRequest.period_end,
          title: reportTitle,
          report_type: selectedRequest.report_type,
          data: {
            content: reportContent,
            created_by_doctor: true,
            request_id: selectedRequest.id
          },
          shared_at: new Date().toISOString()
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Update the request status
      const { error: updateError } = await supabase
        .from('report_requests')
        .update({ status: 'completed' })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      // Send notification to parent
      await supabase
        .from('real_time_notifications')
        .insert({
          user_id: selectedRequest.parent_id,
          type: 'report_shared',
          title: 'New Report Available',
          message: `Dr. has shared a new ${selectedRequest.report_type} report for your baby.`,
          data: {
            report_id: reportData.id,
            report_type: selectedRequest.report_type,
            baby_id: selectedRequest.baby_id
          }
        });

      toast({
        title: "Success",
        description: "Report created and shared with the parent"
      });

      setReportDialog(false);
      setSelectedRequest(null);
      setReportTitle('');
      setReportContent('');
      fetchReportRequests();
      fetchMyReports();
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive"
      });
    }
  };

  const shareExistingReport = async (reportId: string, parentId: string) => {
    try {
      const { error } = await supabase
        .from('baby_reports')
        .update({ 
          shared_at: new Date().toISOString(),
          doctor_id: user!.id 
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report shared successfully"
      });
      
      fetchMyReports();
    } catch (error) {
      console.error('Error sharing report:', error);
      toast({
        title: "Error",
        description: "Failed to share report",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (userRole !== 'doctor') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Report management is only available for doctors</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Requests */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Report Requests</h2>
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No pending report requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <Card key={request.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {request.parent_profile?.full_name || 'Parent'}
                        </h3>
                        {request.baby && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Baby className="w-4 h-4 mr-1" />
                            For: {request.baby.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge>{request.report_type}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {formatDate(request.period_start)} - {formatDate(request.period_end)}
                      </span>
                    </div>
                  </div>
                  
                  {request.message && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                      <p className="text-sm text-gray-600">{request.message}</p>
                    </div>
                  )}
                  
                  <Dialog open={reportDialog} onOpenChange={setReportDialog}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Create Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Report</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Report Title</label>
                          <input
                            type="text"
                            value={reportTitle}
                            onChange={(e) => setReportTitle(e.target.value)}
                            placeholder="Enter report title..."
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Report Content</label>
                          <Textarea
                            value={reportContent}
                            onChange={(e) => setReportContent(e.target.value)}
                            placeholder="Enter your detailed report and recommendations..."
                            className="min-h-[150px]"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleCreateReport}
                            disabled={!reportTitle.trim() || !reportContent.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Create & Share
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setReportDialog(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My Reports */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Reports</h2>
        {myReports.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No reports created yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myReports.map(report => (
              <Card key={report.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-sm text-gray-600">
                        For: {report.baby?.name} • Parent: {report.parent_profile?.full_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={report.shared_at ? "default" : "secondary"}>
                        {report.shared_at ? "Shared" : "Draft"}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {formatDate(report.period_start)} - {formatDate(report.period_end)}
                      </span>
                    </div>
                    
                    {!report.shared_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => shareExistingReport(report.id, report.parent_id)}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportManagement;