import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Baby, Calendar, Activity, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ParentFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (hasParentFeatures: boolean) => void;
}

export const ParentFeaturesDialog: React.FC<ParentFeaturesDialogProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleChoice = async (enableParentFeatures: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ parent_features_enabled: enableParentFeatures })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Preferences Updated",
        description: enableParentFeatures 
          ? "Parent features have been enabled for your account"
          : "Your account will focus on doctor features only"
      });

      onComplete(enableParentFeatures);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome Doctor! 👨‍⚕️</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            Do you also have children that you'd like to track using this app?
          </p>
          
          <div className="space-y-3">
            <Card className="border-2 border-transparent hover:border-blue-200 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <Button
                  onClick={() => handleChoice(true)}
                  disabled={loading}
                  className="w-full h-auto p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                  variant="outline"
                >
                  <div className="text-center space-y-2">
                    <div className="flex justify-center space-x-2">
                      <Baby className="w-5 h-5" />
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Yes, I have children</p>
                      <p className="text-sm text-blue-600">
                        Enable parent features to track my own children
                      </p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-transparent hover:border-gray-200 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <Button
                  onClick={() => handleChoice(false)}
                  disabled={loading}
                  className="w-full h-auto p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                  variant="outline"
                >
                  <div className="text-center space-y-2">
                    <div className="flex justify-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Focus on doctor features only</p>
                      <p className="text-sm text-gray-600">
                        I'll use this app primarily for consultations
                      </p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            You can change this setting later in your profile
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};