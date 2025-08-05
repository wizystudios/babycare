import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Pill, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useBaby } from '@/hooks/useBaby';
import { getPrescriptionsByPatient, updatePrescriptionStatus, type Prescription } from '@/services/prescriptionService';
import { formatDate } from '@/lib/date-utils';

const PrescriptionManager = () => {
  const { user } = useAuth();
  const { selectedBaby } = useBaby();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchPrescriptions();
    }
  }, [user?.id]);

  const fetchPrescriptions = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await getPrescriptionsByPatient(user.id);
      setPrescriptions(data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load prescriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (prescriptionId: string, newStatus: 'active' | 'completed' | 'cancelled') => {
    try {
      await updatePrescriptionStatus(prescriptionId, newStatus);
      setPrescriptions(prev => 
        prev.map(p => p.id === prescriptionId ? { ...p, status: newStatus } : p)
      );
      toast({
        title: "Success",
        description: "Prescription status updated",
      });
    } catch (error) {
      console.error('Error updating prescription:', error);
      toast({
        title: "Error",
        description: "Failed to update prescription",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary';
      case 'completed': return 'bg-secondary';
      case 'cancelled': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const isExpiringSoon = (endDate?: Date) => {
    if (!endDate) return false;
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (endDate?: Date) => {
    if (!endDate) return false;
    return endDate < new Date();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Prescriptions</h2>
        <Badge variant="secondary">
          {prescriptions.filter(p => p.status === 'active').length} Active
        </Badge>
      </div>

      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Pill className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Prescriptions</h3>
            <p className="text-muted-foreground">
              You don't have any prescriptions yet. They will appear here when prescribed by your doctor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="relative">
              {(isExpiringSoon(prescription.endDate) || isExpired(prescription.endDate)) && (
                <div className="absolute top-4 right-4">
                  <AlertCircle className={`h-5 w-5 ${isExpired(prescription.endDate) ? 'text-destructive' : 'text-warning'}`} />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{prescription.medicationName}</CardTitle>
                  <Badge className={getStatusColor(prescription.status)}>
                    {prescription.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Dosage</p>
                    <p className="text-muted-foreground">{prescription.dosage}</p>
                  </div>
                  <div>
                    <p className="font-medium">Frequency</p>
                    <p className="text-muted-foreground">{prescription.frequency}</p>
                  </div>
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">{prescription.duration}</p>
                  </div>
                  <div>
                    <p className="font-medium">Start Date</p>
                    <p className="text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(prescription.startDate)}
                    </p>
                  </div>
                </div>

                {prescription.endDate && (
                  <div className="text-sm">
                    <p className="font-medium">End Date</p>
                    <p className={`flex items-center ${isExpired(prescription.endDate) ? 'text-destructive' : isExpiringSoon(prescription.endDate) ? 'text-warning' : 'text-muted-foreground'}`}>
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(prescription.endDate)}
                      {isExpired(prescription.endDate) && ' (Expired)'}
                      {isExpiringSoon(prescription.endDate) && !isExpired(prescription.endDate) && ' (Expiring Soon)'}
                    </p>
                  </div>
                )}

                {prescription.instructions && (
                  <div className="text-sm">
                    <p className="font-medium">Instructions</p>
                    <p className="text-muted-foreground">{prescription.instructions}</p>
                  </div>
                )}

                {prescription.status === 'active' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(prescription.id, 'completed')}
                    >
                      Mark Completed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(prescription.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionManager;