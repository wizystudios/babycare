import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Star, ChevronDown, User } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_profile?: {
    full_name: string | null;
  } | null;
}

interface ReviewsDropdownProps {
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
}

export const ReviewsDropdown: React.FC<ReviewsDropdownProps> = ({
  reviews,
  avgRating,
  reviewCount
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-auto p-3 w-full justify-between">
          <div className="flex items-center gap-2">
            <div className="flex">{renderStars(Math.round(avgRating))}</div>
            <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
            <Badge variant="secondary" className="text-xs">
              {reviewCount} review{reviewCount !== 1 ? 's' : ''}
            </Badge>
          </div>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 max-h-96 overflow-y-auto bg-card border border-border/50 shadow-lg"
        align="start"
      >
        <div className="p-2">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
            <div className="flex">{renderStars(Math.round(avgRating))}</div>
            <span className="font-medium">{avgRating.toFixed(1)} out of 5</span>
            <span className="text-sm text-muted-foreground">
              ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
            </span>
          </div>
          
          {reviews.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Star className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {reviews.map((review) => (
                <Card key={review.id} className="border-border/30">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">
                            {review.user_profile?.full_name || 'Anonymous User'}
                          </span>
                          <div className="flex">{renderStars(review.rating)}</div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {review.comment}
                          </p>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};