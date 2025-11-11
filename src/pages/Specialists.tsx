import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Star, MapPin, Award, Clock, Phone, Mail, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConsultationBooking } from '@/components/booking/ConsultationBooking';
import { Skeleton } from '@/components/ui/skeleton';

interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  phone: string | null;
  email: string | null;
  experience: string | null;
  available: boolean;
  user_id: string | null;
  hospital_id: string | null;
  hospitals?: {
    name: string;
    location: string;
  } | null;
  profiles?: {
    full_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    license_number: string | null;
    hospital_affiliation: string | null;
  } | null;
  avgRating: number;
  reviewCount: number;
}

const SPECIALTIES = [
  { value: 'all', label: 'All Specialties', icon: '🏥' },
  { value: 'Pediatrician', label: 'Pediatrician', icon: '👶' },
  { value: 'Nutritionist', label: 'Nutritionist', icon: '🥗' },
  { value: 'Dermatologist', label: 'Dermatologist', icon: '💆' },
  { value: 'Child Psychologist', label: 'Child Psychologist', icon: '🧠' },
  { value: 'Lactation Consultant', label: 'Lactation Consultant', icon: '🤱' },
  { value: 'General Medicine', label: 'General Medicine', icon: '⚕️' }
];

const Specialists = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .eq('available', true)
        .order('name');

      if (doctorsError) throw doctorsError;

      // Fetch hospitals separately
      const hospitalIds = [...new Set(doctorsData?.map(d => d.hospital_id).filter(Boolean) || [])];
      const { data: hospitalsData } = await supabase
        .from('hospitals')
        .select('id, name, location')
        .in('id', hospitalIds);

      const hospitalsMap = new Map(hospitalsData?.map(h => [h.id, h]) || []);

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, bio, avatar_url, license_number, hospital_affiliation')
        .eq('role', 'doctor');

      const { data: reviewsData } = await supabase
        .from('doctor_reviews')
        .select('doctor_id, rating');

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      const reviewsByDoctor = new Map<string, number[]>();
      
      reviewsData?.forEach(review => {
        if (!reviewsByDoctor.has(review.doctor_id)) {
          reviewsByDoctor.set(review.doctor_id, []);
        }
        reviewsByDoctor.get(review.doctor_id)?.push(review.rating);
      });

      const doctorsWithProfiles: DoctorProfile[] = (doctorsData || []).map(doctor => {
        const ratings = reviewsByDoctor.get(doctor.id) || [];
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
          : 0;
        
        const hospital = doctor.hospital_id ? hospitalsMap.get(doctor.hospital_id) || null : null;
        
        return {
          ...doctor,
          profiles: doctor.user_id ? profilesMap.get(doctor.user_id) || null : null,
          hospitals: hospital,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: ratings.length
        };
      });

      setDoctors(doctorsWithProfiles);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load specialists",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.hospitals?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialization === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  if (loading) {
    return (
      <Layout>
        <div className="p-3 space-y-4 max-w-6xl mx-auto">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-3 space-y-4 max-w-6xl mx-auto">
        <div>
          <h1 className="text-lg font-bold text-foreground mb-1">Medical Specialists</h1>
          <p className="text-[10px] text-muted-foreground">Expert care for your baby's health</p>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialty, or hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-7 text-[10px]"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {SPECIALTIES.map(specialty => (
            <Button
              key={specialty.value}
              variant={selectedSpecialty === specialty.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSpecialty(specialty.value)}
              className="h-6 text-[10px] px-2 whitespace-nowrap"
            >
              <span className="mr-1">{specialty.icon}</span>
              {specialty.label}
            </Button>
          ))}
        </div>

        <div className="text-[10px] text-muted-foreground">
          Showing {filteredDoctors.length} specialist{filteredDoctors.length !== 1 ? 's' : ''}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDoctors.map(doctor => (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={doctor.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xs font-semibold truncate">{doctor.name}</CardTitle>
                    <Badge variant="secondary" className="text-[9px] h-4 px-1 mt-0.5">
                      {doctor.specialization}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                {doctor.profiles?.bio && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2">
                    {doctor.profiles.bio}
                  </p>
                )}

                <div className="space-y-1">
                  {doctor.experience && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <Award className="h-3 w-3 text-primary" />
                      <span>{doctor.experience} experience</span>
                    </div>
                  )}
                  
                  {doctor.hospitals && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="truncate">{doctor.hospitals.name}</span>
                    </div>
                  )}

                  {doctor.reviewCount > 0 && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{doctor.avgRating}</span>
                      <span className="text-muted-foreground">({doctor.reviewCount} reviews)</span>
                    </div>
                  )}

                  {doctor.phone && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <Phone className="h-3 w-3 text-primary" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}

                  {doctor.email && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <Mail className="h-3 w-3 text-primary" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                  )}

                  {doctor.profiles?.license_number && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <Award className="h-3 w-3 text-primary" />
                      <span>License: {doctor.profiles.license_number}</span>
                    </div>
                  )}
                </div>

                <ConsultationBooking
                  doctorId={doctor.id}
                  doctorName={doctor.name}
                >
                  <Button className="w-full h-6 text-[10px] mt-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    Book Appointment
                  </Button>
                </ConsultationBooking>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">No specialists found</p>
            <p className="text-[10px] text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Specialists;
