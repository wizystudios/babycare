import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Baby, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface ConsultationRequest {
  id: string;
  patient_id: string;
  baby_id: string | null;
  requested_date: string;
  requested_time_slot: string;
  status: string;
  reason: string;
  created_at: string;
  updated_at?: string;
  patient_profile?: {
    full_name: string | null;
  } | null;
  baby?: {
    name: string;
  } | null;
}

const DoctorDashboard = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [response, setResponse] = useState<'accept' | 'decline' | ''>('');
  const [responseMessage, setResponseMessage] = useState('');
  const [suggestedDate, setSuggestedDate] = useState('');
  const [suggestedTime, setSuggestedTime] = useState('');

  useEffect(() => {
    if (userRole !== 'doctor') {
      navigate('/dashboard');
      return;
    }
    fetchConsultationRequests();
  }, [userRole, navigate]);

  const fetchConsultationRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch consultation requests for this doctor
      const { data: requestsData, error: requestsError } = await supabase
        .from('consultation_requests')
        .select('*')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Get patient profiles and baby names
      const patientIds = [...new Set(requestsData?.map(req => req.patient_id) || [])];
      const babyIds = [...new Set(requestsData?.filter(req => req.baby_id).map(req => req.baby_id) || [])];

      const [profilesResponse, babiesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', patientIds),
        babyIds.length > 0 
          ? supabase
              .from('babies')
              .select('id, name')
              .in('id', babyIds)
          : { data: [], error: null }
      ]);

      if (profilesResponse.error) throw profilesResponse.error;
      if (babiesResponse.error) throw babiesResponse.error;

      // Create maps for quick lookup
      const profilesMap = new Map<string, any>();
      profilesResponse.data?.forEach(p => profilesMap.set(p.id, p));
      
      const babiesMap = new Map<string, any>();
      babiesResponse.data?.forEach(b => babiesMap.set(b.id, b));

      // Combine data
      const enrichedRequests = requestsData?.map(req => ({
        ...req,
        patient_profile: profilesMap.get(req.patient_id) || null,
        baby: req.baby_id ? babiesMap.get(req.baby_id) || null : null
      })) || [];

      setRequests(enrichedRequests);
    } catch (error) {
      console.error('Error fetching consultation requests:', error);
      toast({
        title: "Error",
        description: "Failed to load consultation requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async () => {
    if (!selectedRequest || !response) return;

    try {
      const updateData: any = {
        status: response === 'accept' ? 'accepted' : 'declined',
        doctor_response: responseMessage || null,
        updated_at: new Date().toISOString()
      };

      if (response === 'decline' && suggestedDate && suggestedTime) {
        updateData.suggested_date = suggestedDate;
        updateData.suggested_time_slot = suggestedTime;
      }

      const { error } = await supabase
        .from('consultation_requests')
        .update(updateData)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Send notification to patient
      await supabase
        .from('real_time_notifications')
        .insert({
          user_id: selectedRequest.patient_id,
          type: 'consultation_response',
          title: `Consultation ${response === 'accept' ? 'Accepted' : 'Declined'}`,
          message: response === 'accept' 
            ? `Your consultation request has been accepted.`
            : `Your consultation request has been declined. ${responseMessage || ''}`,
          data: {
            consultation_id: selectedRequest.id,
            status: updateData.status,
            suggested_date: suggestedDate,
            suggested_time: suggestedTime
          }
        });

      toast({
        title: "Success",
        description: `Consultation request ${response === 'accept' ? 'accepted' : 'declined'}`
      });

      setResponseDialog(false);
      setSelectedRequest(null);
      setResponse('');
      setResponseMessage('');
      setSuggestedDate('');
      setSuggestedTime('');
      fetchConsultationRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to request",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600">Manage your consultation requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold">
                    {requests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Accepted Today</p>
                  <p className="text-2xl font-bold">
                    {requests.filter(r => 
                      r.status === 'accepted' && 
                      new Date(r.updated_at || r.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold">{requests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Consultation Requests</h2>
          
          {requests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No consultation requests yet</p>
              </CardContent>
            </Card>
          ) : (
            requests.map(request => (
              <Card key={request.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {request.patient_profile?.full_name || 'Anonymous Patient'}
                        </h3>
                        {request.baby && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Baby className="w-4 h-4 mr-1" />
                            For: {request.baby.name}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{formatDate(request.requested_date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{request.requested_time_slot}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                    <p className="text-sm text-gray-600">{request.reason}</p>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="flex space-x-2 pt-2">
                      <Dialog open={responseDialog} onOpenChange={setResponseDialog}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedRequest(request);
                              setResponse('accept');
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {response === 'accept' ? 'Accept' : 'Decline'} Consultation Request
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Response Message {response === 'decline' ? '(Required)' : '(Optional)'}
                              </label>
                              <Textarea
                                placeholder={response === 'accept' 
                                  ? "Add any additional instructions or notes..."
                                  : "Please provide a reason for declining and suggest alternative times if possible..."
                                }
                                value={responseMessage}
                                onChange={(e) => setResponseMessage(e.target.value)}
                                required={response === 'decline'}
                              />
                            </div>
                            
                            {response === 'decline' && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Suggested Date (Optional)
                                  </label>
                                  <input
                                    type="date"
                                    value={suggestedDate}
                                    onChange={(e) => setSuggestedDate(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Suggested Time (Optional)
                                  </label>
                                  <Select value={suggestedTime} onValueChange={setSuggestedTime}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a time slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="09:00-10:00">9:00 AM - 10:00 AM</SelectItem>
                                      <SelectItem value="10:00-11:00">10:00 AM - 11:00 AM</SelectItem>
                                      <SelectItem value="11:00-12:00">11:00 AM - 12:00 PM</SelectItem>
                                      <SelectItem value="14:00-15:00">2:00 PM - 3:00 PM</SelectItem>
                                      <SelectItem value="15:00-16:00">3:00 PM - 4:00 PM</SelectItem>
                                      <SelectItem value="16:00-17:00">4:00 PM - 5:00 PM</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </>
                            )}
                            
                            <div className="flex space-x-2">
                              <Button onClick={handleResponse} className="flex-1">
                                {response === 'accept' ? 'Accept Request' : 'Decline Request'}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setResponseDialog(false);
                                  setSelectedRequest(null);
                                  setResponse('');
                                  setResponseMessage('');
                                  setSuggestedDate('');
                                  setSuggestedTime('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setSelectedRequest(request);
                          setResponse('decline');
                          setResponseDialog(true);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;