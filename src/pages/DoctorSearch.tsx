
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star, Search, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Doctor } from '@/types/models';

interface DoctorReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

interface DoctorWithReviews extends Doctor {
  doctor_reviews: DoctorReview[];
  avgRating: number;
  reviewCount: number;
}

const DoctorSearch = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<DoctorWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithReviews | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          hospitals(name),
          doctor_reviews(
            id,
            rating,
            comment,
            created_at,
            profiles:user_id(full_name)
          )
        `)
        .eq('available', true)
        .order('name');

      if (error) throw error;

      const doctorsWithStats = (data || []).map(doctor => {
        const reviews = doctor.doctor_reviews || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
          : 0;
        
        return {
          ...doctor,
          doctor_reviews: reviews,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length
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

  const submitReview = async () => {
    if (!user || !selectedDoctor) return;

    try {
      const { error } = await supabase
        .from('doctor_reviews')
        .insert({
          user_id: user.id,
          doctor_id: selectedDoctor.id,
          rating: newReview.rating,
          comment: newReview.comment || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review submitted successfully"
      });

      setReviewDialogOpen(false);
      setNewReview({ rating: 5, comment: '' });
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
    const matchesSpecialization = !specialization || doctor.specialization === specialization;
    return matchesSearch && matchesSpecialization;
  });

  const specializations = [...new Set(doctors.map(d => d.specialization))];

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && onRate && onRate(i + 1)}
      />
    ));
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
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
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Find Doctors</h1>
          <p className="text-gray-600">Search for trusted healthcare professionals</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search doctors or specializations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-blue-300"
            />
          </div>
          
          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger className="rounded-xl border-blue-300">
              <SelectValue placeholder="Filter by specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Specializations</SelectItem>
              {specializations.map(spec => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredDoctors.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No doctors found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredDoctors.map(doctor => (
              <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                        {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-blue-900">{doctor.name}</h3>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedDoctor(doctor)}
                              className="rounded-xl border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Book
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-2xl">
                            <DialogHeader>
                              <DialogTitle>Contact {doctor.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-600" />
                                <span>{doctor.phone || 'Not available'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-600" />
                                <span>{doctor.email || 'Not available'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <span>{doctor.hospitals?.name || 'Multiple locations'}</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Please contact the doctor directly to schedule an appointment.
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <Badge variant="secondary" className="mb-3 bg-blue-100 text-blue-700">
                        {doctor.specialization}
                      </Badge>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(Math.round(doctor.avgRating))}</div>
                          <span className="text-sm font-medium">{doctor.avgRating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({doctor.reviewCount} reviews)</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{doctor.hospitals?.name || 'Multiple locations'}</span>
                          </div>
                          {doctor.experience && (
                            <span>{doctor.experience} experience</span>
                          )}
                        </div>
                        
                        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedDoctor(doctor)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              Write Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Dr. {doctor.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <div className="flex gap-1">
                                  {renderStars(newReview.rating, true, (rating) => 
                                    setNewReview(prev => ({ ...prev, rating }))
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-2">Comment (optional)</label>
                                <Textarea
                                  placeholder="Share your experience..."
                                  value={newReview.comment}
                                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                  className="rounded-xl border-blue-300"
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  onClick={submitReview}
                                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
                                >
                                  Submit Review
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setReviewDialogOpen(false)}
                                  className="rounded-xl border-blue-300"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Reviews */}
                  {doctor.doctor_reviews.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Reviews</h4>
                      <div className="space-y-2">
                        {doctor.doctor_reviews.slice(0, 2).map(review => (
                          <div key={review.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex">{renderStars(review.rating)}</div>
                              <span className="text-xs text-gray-500">
                                by {review.profiles?.full_name || 'Anonymous'}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-gray-600">{review.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
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

export default DoctorSearch;
