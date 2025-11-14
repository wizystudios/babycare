import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useBaby } from '@/hooks/useBaby';
import { Pill, Clock, Check, X, Plus } from 'lucide-react';
import { getTodaysDoses, markDoseAsTaken, markDoseAsSkipped, addMedication } from '@/services/medicationService';

export const MedicationTracker = () => {
  const { selectedBaby } = useBaby();
  const { toast } = useToast();
  const [doses, setDoses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    timesPerDay: 1,
    reminderTimes: ['08:00'],
    notes: '',
  });

  useEffect(() => {
    if (selectedBaby) {
      fetchDoses();
    }
  }, [selectedBaby]);

  const fetchDoses = async () => {
    if (!selectedBaby) return;
    try {
      setLoading(true);
      const data = await getTodaysDoses(selectedBaby.id);
      setDoses(data);
    } catch (error) {
      console.error('Error fetching doses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsTaken = async (doseId: string) => {
    try {
      await markDoseAsTaken(doseId);
      toast({ title: 'Dose marked as taken' });
      fetchDoses();
    } catch (error) {
      toast({ title: 'Error marking dose', variant: 'destructive' });
    }
  };

  const handleSkipDose = async (doseId: string) => {
    try {
      await markDoseAsSkipped(doseId);
      toast({ title: 'Dose skipped' });
      fetchDoses();
    } catch (error) {
      toast({ title: 'Error skipping dose', variant: 'destructive' });
    }
  };

  const handleAddMedication = async () => {
    if (!selectedBaby) return;
    try {
      await addMedication({
        babyId: selectedBaby.id,
        userId: '',
        medicationName: formData.medicationName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        timesPerDay: formData.timesPerDay,
        reminderTimes: formData.reminderTimes,
        notes: formData.notes,
        active: true,
      });
      toast({ title: 'Medication added successfully' });
      setDialogOpen(false);
      fetchDoses();
      setFormData({
        medicationName: '',
        dosage: '',
        frequency: 'daily',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        timesPerDay: 1,
        reminderTimes: ['08:00'],
        notes: '',
      });
    } catch (error) {
      toast({ title: 'Error adding medication', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'text-green-600';
      case 'missed': return 'text-red-600';
      case 'skipped': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (!selectedBaby) {
    return <div className="text-xs text-muted-foreground p-2">Please select a baby</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1">
          <Pill className="h-3 w-3" />
          Today's Medications
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-6 text-[10px]">
              <Plus className="h-3 w-3 mr-1" />
              Add Med
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">Add Medication</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <div>
                <Label className="text-[10px]">Medication Name</Label>
                <Input
                  value={formData.medicationName}
                  onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px]">Dosage</Label>
                <Input
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g., 5ml"
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px]">Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px]">End Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px]">Times Per Day</Label>
                <Input
                  type="number"
                  value={formData.timesPerDay}
                  onChange={(e) => {
                    const times = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      timesPerDay: times,
                      reminderTimes: Array(times).fill('08:00')
                    });
                  }}
                  min="1"
                  max="6"
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px]">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-[60px] text-xs"
                />
              </div>
              <Button onClick={handleAddMedication} className="w-full h-7 text-xs">
                Add Medication
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground p-2">Loading...</div>
      ) : doses.length === 0 ? (
        <Card className="p-2">
          <p className="text-xs text-muted-foreground text-center">No medications scheduled for today</p>
        </Card>
      ) : (
        <div className="space-y-1">
          {doses.map((dose) => (
            <Card key={dose.id} className="p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{dose.medication.medicationName}</p>
                  <p className="text-[10px] text-muted-foreground">{dose.medication.dosage}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    <span className="text-[10px]">
                      {new Date(dose.scheduledTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <span className={`text-[10px] ml-1 ${getStatusColor(dose.status)}`}>
                      ({dose.status})
                    </span>
                  </div>
                </div>
                {dose.status === 'pending' && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMarkAsTaken(dose.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => handleSkipDose(dose.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
