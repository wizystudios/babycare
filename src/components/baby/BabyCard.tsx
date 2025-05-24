
import React from 'react';
import { Baby } from '@/types/models';
import { Card, CardContent } from '@/components/ui/card';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, Ruler, Weight } from 'lucide-react';

interface BabyCardProps {
  baby: Baby;
  onEdit: () => void;
  onDelete: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

export const BabyCard: React.FC<BabyCardProps> = ({ 
  baby, 
  onEdit, 
  onDelete, 
  onSelect, 
  isSelected = false 
}) => {
  const getAgeInMonths = (birthDate: Date) => {
    const now = new Date();
    const months = (now.getFullYear() - birthDate.getFullYear()) * 12 + 
                   (now.getMonth() - birthDate.getMonth());
    return months;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-baby-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-16 w-16">
              {baby.photoUrl ? (
                <AvatarImage src={baby.photoUrl} alt={baby.name} />
              ) : (
                <AvatarFallback className="bg-baby-blue/20 text-baby-primary text-lg">
                  {baby.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{baby.name}</h3>
                <Badge variant={baby.gender === 'male' ? 'default' : baby.gender === 'female' ? 'secondary' : 'outline'}>
                  {baby.gender}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{getAgeInMonths(baby.birthDate)} months</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>{formatDate(baby.birthDate)}</span>
                </div>
                {baby.weight > 0 && (
                  <div className="flex items-center space-x-1">
                    <Weight className="h-3 w-3" />
                    <span>{baby.weight} kg</span>
                  </div>
                )}
                {baby.height > 0 && (
                  <div className="flex items-center space-x-1">
                    <Ruler className="h-3 w-3" />
                    <span>{baby.height} cm</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <ActionMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </CardContent>
    </Card>
  );
};
