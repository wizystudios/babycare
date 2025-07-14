import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, User, Baby, Calendar, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  babies: {
    id: string;
    name: string;
    birth_date: string;
    gender: string;
  }[];
  consultation_count: number;
  last_consultation: string | null;
}

const PatientsList = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userRole !== 'doctor') {
      navigate('/dashboard');
      return;
    }
    fetchPatients();
  }, [userRole, navigate]);

  const fetchPatients = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First get the doctor record ID
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (doctorError || !doctorData) {
        console.error('Doctor not found:', doctorError);
        return;
      }

      // Get all consultation requests for this doctor to find patients
      const { data: consultations, error: consultationsError } = await supabase
        .from('consultation_requests')
        .select('patient_id, baby_id, created_at')
        .eq('doctor_id', doctorData.id);

      if (consultationsError) throw consultationsError;

      if (!consultations || consultations.length === 0) {
        setPatients([]);
        return;
      }

      // Get unique patient IDs
      const patientIds = [...new Set(consultations.map(c => c.patient_id))];

      // Fetch patient profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, country')
        .in('id', patientIds);

      if (profilesError) throw profilesError;

      // Fetch babies for these patients
      const { data: babies, error: babiesError } = await supabase
        .from('babies')
        .select('id, name, birth_date, gender, user_id')
        .in('user_id', patientIds);

      if (babiesError) throw babiesError;

      // Group babies by user_id
      const babiesByUser = new Map<string, any[]>();
      babies?.forEach(baby => {
        if (!babiesByUser.has(baby.user_id)) {
          babiesByUser.set(baby.user_id, []);
        }
        babiesByUser.get(baby.user_id)?.push(baby);
      });

      // Count consultations per patient
      const consultationCounts = new Map<string, number>();
      const lastConsultations = new Map<string, string>();
      
      consultations.forEach(consultation => {
        const patientId = consultation.patient_id;
        consultationCounts.set(patientId, (consultationCounts.get(patientId) || 0) + 1);
        
        const currentLast = lastConsultations.get(patientId);
        if (!currentLast || consultation.created_at > currentLast) {
          lastConsultations.set(patientId, consultation.created_at);
        }
      });

      // Combine data
      const patientsData: Patient[] = (profiles || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        phone: profile.phone,
        country: profile.country,
        babies: babiesByUser.get(profile.id) || [],
        consultation_count: consultationCounts.get(profile.id) || 0,
        last_consultation: lastConsultations.get(profile.id) || null
      }));

      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.full_name?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchTerm) ||
      patient.babies.some(baby => baby.name.toLowerCase().includes(searchLower))
    );
  });

  const getInitials = (name: string | null) => {
    if (!name) return 'P';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
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
          <h1 className="text-xl font-bold text-blue-900 mb-1">My Patients</h1>
          <p className="text-sm text-gray-600">Patients who have consulted with you</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-blue-300"
          />
        </div>

        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {patients.length === 0 ? 'No patients yet' : 'No patients found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map(patient => (
              <Card key={patient.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {getInitials(patient.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-blue-900 truncate">
                          {patient.full_name || 'Anonymous Patient'}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {patient.consultation_count} consultations
                        </Badge>
                      </div>
                      
                      {patient.phone && (
                        <p className="text-sm text-gray-600 mb-2">📞 {patient.phone}</p>
                      )}
                      
                      {patient.country && (
                        <p className="text-sm text-gray-600 mb-2">📍 {patient.country}</p>
                      )}
                      
                      {patient.babies.length > 0 && (
                        <div className="space-y-1 mb-3">
                          <p className="text-xs font-medium text-gray-700">Children:</p>
                          <div className="flex flex-wrap gap-2">
                            {patient.babies.map(baby => (
                              <div key={baby.id} className="flex items-center gap-1 bg-pink-50 rounded-full px-2 py-1">
                                <Baby className="w-3 h-3 text-pink-500" />
                                <span className="text-xs text-pink-700">
                                  {baby.name} ({calculateAge(baby.birth_date)})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {patient.last_consultation && (
                        <p className="text-xs text-gray-500">
                          Last consultation: {formatDate(patient.last_consultation)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PatientsList;