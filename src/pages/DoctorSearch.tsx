
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Stethoscope, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Doctor } from '@/types/models';
import { DoctorDropdown } from '@/components/doctor/DoctorDropdown';
import { Skeleton } from '@/components/ui/skeleton';

interface DoctorReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_profile?: {
    full_name: string | null;
  } | null;
}

interface DoctorWithReviews extends Doctor {
  doctor_reviews: DoctorReview[];
  avgRating: number;
  reviewCount: number;
  hospitals?: {
    name: string;
  } | null;
}

const DoctorSearch = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<DoctorWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('all');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      // Fetch doctors first
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .eq('available', true)
        .order('name');

      if (doctorsError) throw doctorsError;

      // Fetch hospitals data separately
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from('hospitals')
        .select('id, name');

      if (hospitalsError) throw hospitalsError;

      // Create a map of hospitals
      const hospitalsMap = new Map(hospitalsData?.map(hospital => [hospital.id, hospital]) || []);

      // Fetch reviews separately and join with profiles
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('doctor_reviews')
        .select(`
          id,
          doctor_id,
          rating,
          comment,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Get user profiles for the reviews
      const userIds = [...new Set(reviewsData?.map(review => review.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles
      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

      // Group reviews by doctor and add profile data
      const reviewsByDoctor = new Map<string, DoctorReview[]>();
      reviewsData?.forEach(review => {
        if (!reviewsByDoctor.has(review.doctor_id)) {
          reviewsByDoctor.set(review.doctor_id, []);
        }
        reviewsByDoctor.get(review.doctor_id)?.push({
          ...review,
          user_profile: profilesMap.get(review.user_id) || null
        });
      });

      // Combine doctors with their reviews, hospitals, and calculate stats
      const doctorsWithStats: DoctorWithReviews[] = (doctorsData || []).map(doctor => {
        const reviews = reviewsByDoctor.get(doctor.id) || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        
        const hospital = doctor.hospital_id ? hospitalsMap.get(doctor.hospital_id) || null : null;
        
        return {
          ...doctor,
          doctor_reviews: reviews,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
          hospitals: hospital
        };
      });

      setDoctors(doctorsWithStats);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (doctorId: string, rating: number, comment: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('doctor_reviews')
        .insert({
          user_id: user.id,
          doctor_id: doctorId,
          rating: rating,
          comment: comment || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review submitted successfully"
      });

      fetchDoctors();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = specialization === 'all' || doctor.specialization === specialization;
    return matchesSearch && matchesSpecialization;
  });

  const specializations = [...new Set(doctors.map(d => d.specialization))];

  if (loading) {
    return (
      <Layout>
        <div className="p-4 space-y-6">
          <div className="text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Stethoscope className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Doctors</h1>
          </div>
          <p className="text-muted-foreground">Find trusted healthcare professionals</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          
          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="All Specializations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map(spec => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="bg-primary/5 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{filteredDoctors.length} Available Doctors</span>
          </div>
          <p className="text-xs text-muted-foreground">Ready to help you and your baby</p>
        </div>

        {/* Doctor List */}
        <div className="space-y-3">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No doctors found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
            </div>
          ) : (
            filteredDoctors.map(doctor => (
              <DoctorDropdown 
                key={doctor.id}
                doctor={doctor}
                onReview={handleReviewSubmit}
              />
            ))
          )}
        </div>

        {/* Book Button */}
        {filteredDoctors.length > 0 && (
          <div className="sticky bottom-4 bg-background/80 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <p className="text-center text-sm text-muted-foreground mb-3">
              Click on any doctor to book appointment or leave a review
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorSearch;
