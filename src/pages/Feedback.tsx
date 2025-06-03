
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface Feedback {
  id: string;
  subject: string;
  message: string;
  category: string | null;
  status: string | null;
  created_at: string;
}

const FeedbackPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    subject: '',
    message: '',
    category: 'general'
  });

  useEffect(() => {
    if (user) {
      fetchFeedback();
    }
  }, [user]);

  const fetchFeedback = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbackList(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!user || !newFeedback.subject.trim() || !newFeedback.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user.id,
          subject: newFeedback.subject.trim(),
          message: newFeedback.message.trim(),
          category: newFeedback.category,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feedback submitted successfully! We'll review it and get back to you."
      });

      setNewFeedback({ subject: '', message: '', category: 'general' });
      fetchFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const categories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'bug_report', label: 'Bug Report' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'user_experience', label: 'User Experience' },
    { value: 'technical_issue', label: 'Technical Issue' },
    { value: 'content_feedback', label: 'Content Feedback' }
  ];

  return (
    <Layout>
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Feedback & Support</h1>
          <p className="text-gray-600">Help us improve BabyTracka by sharing your thoughts and experiences</p>
        </div>

        {/* Submit New Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <MessageSquare className="w-5 h-5" />
              Submit Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category" className="text-gray-700">Category</Label>
              <Select 
                value={newFeedback.category} 
                onValueChange={(value) => setNewFeedback(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="rounded-xl border-blue-300 mt-1">
                  <SelectValue placeholder="Select feedback category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject" className="text-gray-700">Subject *</Label>
              <Input
                id="subject"
                value={newFeedback.subject}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of your feedback"
                className="rounded-xl border-blue-300 mt-1"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{newFeedback.subject.length}/200 characters</p>
            </div>

            <div>
              <Label htmlFor="message" className="text-gray-700">Message *</Label>
              <Textarea
                id="message"
                value={newFeedback.message}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Please provide detailed feedback. Include steps to reproduce if reporting a bug, or specific suggestions for improvements."
                className="rounded-xl border-blue-300 mt-1 min-h-[120px]"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{newFeedback.message.length}/1000 characters</p>
            </div>

            <Button 
              onClick={submitFeedback}
              disabled={submitting || !newFeedback.subject.trim() || !newFeedback.message.trim()}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </CardContent>
        </Card>

        {/* Feedback History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-900">Your Feedback History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No feedback submitted yet</p>
                <p className="text-sm text-gray-400 mt-1">Your feedback history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbackList.map(feedback => (
                  <div key={feedback.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{feedback.subject}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {categories.find(c => c.value === feedback.category)?.label || feedback.category}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(feedback.status)}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(feedback.status)}
                              {feedback.status || 'pending'}
                            </div>
                          </Badge>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">{feedback.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help & Guidelines */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Feedback Guidelines</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Be specific and detailed in your feedback</li>
              <li>• For bug reports, include steps to reproduce the issue</li>
              <li>• For feature requests, explain how it would benefit you</li>
              <li>• We typically respond within 1-3 business days</li>
              <li>• Check your feedback history for status updates</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FeedbackPage;
