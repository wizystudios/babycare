import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Star, 
  ChevronDown, 
  Calendar, 
  MessageSquare, 
  MapPin,
  Stethoscope 
} from 'lucide-react';
import { ConsultationBooking } from '@/components/booking/ConsultationBooking';
import { ReviewsDropdown } from '@/components/reviews/ReviewsDropdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface DoctorReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_profile?: {
    full_name: string | null;
  } | null;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience?: string;
  hospitals?: {
    name: string;
  } | null;
  doctor_reviews: DoctorReview[];
  avgRating: number;
  reviewCount: number;
}

interface DoctorDropdownProps {
  doctor: Doctor;
  onReview: (doctorId: string, rating: number, comment: string) => void;
}

export const DoctorDropdown: React.FC<DoctorDropdownProps> = ({ doctor, onReview }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

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

  const handleSubmitReview = () => {
    onReview(doctor.id, newReview.rating, newReview.comment);
    setReviewDialogOpen(false);
    setNewReview({ rating: 5, comment: '' });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-auto p-4 justify-between rounded-xl border-primary/20 hover:border-primary/40 bg-card"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-left">
              <h3 className="font-semibold text-foreground">{doctor.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Stethoscope className="w-3 h-3" />
                <span>{doctor.specialization}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{doctor.hospitals?.name || 'Multiple locations'}</span>
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-80 p-0 bg-card border border-border/50 shadow-lg"
        align="start"
      >
        <div className="p-4 space-y-4">
          {/* Doctor Info */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{doctor.name}</h3>
              <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary">
                {doctor.specialization}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{doctor.hospitals?.name || 'Multiple locations'}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(Math.round(doctor.avgRating))}</div>
              <span className="font-medium">{doctor.avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({doctor.reviewCount} review{doctor.reviewCount !== 1 ? 's' : ''})
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <ConsultationBooking
              doctorId={doctor.id}
              doctorName={doctor.name}
            >
              <Button 
                variant="default" 
                size="sm"
                className="w-full rounded-xl"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book
              </Button>
            </ConsultationBooking>

            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Review
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
                      className="rounded-xl border-primary/20"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitReview}
                      className="flex-1 rounded-xl"
                    >
                      Submit Review
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setReviewDialogOpen(false)}
                      className="rounded-xl border-primary/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Reviews */}
          {doctor.doctor_reviews.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <h4 className="text-sm font-medium text-foreground mb-3">Recent Reviews</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {doctor.doctor_reviews.slice(0, 3).map(review => (
                  <div key={review.id} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-xs text-muted-foreground">
                        by {review.user_profile?.full_name || 'Anonymous'}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};