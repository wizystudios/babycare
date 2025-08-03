import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface BabyImageUploadProps {
  currentImageUrl?: string | null;
  babyName?: string;
  babyId: string;
  onImageUpdate: (imageUrl: string | null) => void;
}

export const BabyImageUpload: React.FC<BabyImageUploadProps> = ({
  currentImageUrl,
  babyName,
  babyId,
  onImageUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${babyId}/baby-photo.${fileExt}`;
      const filePath = `baby-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('baby-images')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('baby-images')
        .getPublicUrl(filePath);

      // Update baby record with new image URL
      const { error: updateError } = await supabase
        .from('babies')
        .update({ photo_url: publicUrl })
        .eq('id', babyId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onImageUpdate(publicUrl);
      
      toast({
        title: "Success",
        description: "Baby photo updated successfully"
      });

      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload baby photo",
        variant: "destructive"
      });
      
      // Reset preview on error
      setPreviewUrl(currentImageUrl);
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!user) return;

    setUploading(true);
    try {
      // Update baby record to remove image URL
      const { error } = await supabase
        .from('babies')
        .update({ photo_url: null })
        .eq('id', babyId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPreviewUrl(null);
      onImageUpdate(null);
      
      toast({
        title: "Success",
        description: "Baby photo removed"
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove baby photo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name?: string) => {
    if (!name) return '👶';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-20 h-20">
          <AvatarImage src={previewUrl || ''} alt="Baby photo" />
          <AvatarFallback className="text-lg">
            {getInitials(babyName)}
          </AvatarFallback>
        </Avatar>
        
        {!uploading && (
          <Button
            variant="outline"
            size="sm"
            className="absolute -bottom-2 -right-2 rounded-full h-7 w-7 p-0 bg-white border-2 border-gray-200"
            onClick={triggerFileSelect}
            disabled={uploading}
          >
            <Camera className="w-3 h-3" />
          </Button>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={triggerFileSelect}
          disabled={uploading}
          className="flex items-center space-x-1 text-xs"
        >
          <Upload className="w-3 h-3" />
          <span>Upload</span>
        </Button>
        
        {previewUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            disabled={uploading}
            className="flex items-center space-x-1 text-xs text-red-600 hover:bg-red-50"
          >
            <X className="w-3 h-3" />
            <span>Remove</span>
          </Button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-gray-500 text-center">
        Upload baby photo (max 5MB)
      </p>
    </div>
  );
};