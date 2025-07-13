import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useBaby } from '@/hooks/useBaby';

interface ConsultationBookingProps {
  doctorId: string;
  doctorName: string;
  children?: React.ReactNode;
}

export const ConsultationBooking: React.FC<ConsultationBookingProps> = ({
  doctorId,
  doctorName,
  children
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedBaby, babies } = useBaby();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBabyId, setSelectedBabyId] = useState('');
  const [reason, setReason] = useState('');

  const timeSlots = [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00'
  ];

  const handleSubmit = async () => {
    if (!user || !selectedDate || !selectedTime || !reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Insert consultation request
      const { error: requestError } = await supabase
        .from('consultation_requests')
        .insert({
          patient_id: user.id,
          doctor_id: doctorId,
          baby_id: selectedBabyId || null,
          requested_date: selectedDate,
          requested_time_slot: selectedTime,
          reason: reason.trim(),
          status: 'pending'
        });

      if (requestError) throw requestError;

      // Send notification to doctor
      await supabase
        .from('real_time_notifications')
        .insert({
          user_id: doctorId,
          type: 'consultation_request',
          title: 'New Consultation Request',
          message: `You have a new consultation request from a patient.`,
          data: {
            patient_id: user.id,
            baby_id: selectedBabyId,
            requested_date: selectedDate,
            requested_time_slot: selectedTime,
            reason: reason.trim()
          }
        });

      toast({
        title: "Request Sent",
        description: `Your consultation request has been sent to ${doctorName}. You'll be notified when they respond.`
      });

      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setSelectedBabyId('');
      setReason('');
      setOpen(false);
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      toast({
        title: "Error",
        description: "Failed to send consultation request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700">
            <Calendar className="w-4 h-4 mr-2" />
            Book Consultation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle>Book Consultation with {doctorName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Date *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getTomorrowDate()}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Select Time *</label>
            <Select value={selectedTime} onValueChange={setSelectedTime} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(slot => (
                  <SelectItem key={slot} value={slot}>
                    {slot.replace('-', ' - ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {babies.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">For which baby? (Optional)</label>
              <Select value={selectedBabyId} onValueChange={setSelectedBabyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a baby (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">General consultation</SelectItem>
                  {babies.map(baby => (
                    <SelectItem key={baby.id} value={baby.id}>
                      {baby.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Reason for consultation *</label>
            <Textarea
              placeholder="Please describe your concerns or the reason for this consultation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleSubmit}
              disabled={loading || !selectedDate || !selectedTime || !reason.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>Loading...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};