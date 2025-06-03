import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Camera, User, Phone, Globe, Save, Baby } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBaby } from '@/hooks/useBaby';
import { useToast } from '@/components/ui/use-toast';
import { SimpleCountrySelect } from '@/components/forms/SimpleCountrySelect';

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  country_code: string | null;
  nationality: string | null;
  avatar_url: string | null;
}

const ProfileManagement = () => {
  const { user } = useAuth();
  const { babies, refreshBabies } = useBaby();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user || !profile) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          country: profile.country,
          country_code: profile.country_code,
          nationality: profile.nationality,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from('baby-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('baby-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);

      toast({
        title: "Success",
        description: "Avatar updated successfully"
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Profile Management</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>

        {/* Profile Picture & Basic Info */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">{profile?.full_name || 'Add your name'}</h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
              <Input
                id="fullName"
                value={profile?.full_name || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
                placeholder="Enter your full name"
                className="rounded-xl border-blue-300 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={profile?.country_code || ''}
                  onChange={(e) => setProfile(prev => prev ? {...prev, country_code: e.target.value} : null)}
                  placeholder="+1"
                  className="w-20 rounded-xl border-blue-300"
                />
                <Input
                  id="phone"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                  placeholder="Enter your phone number"
                  className="flex-1 rounded-xl border-blue-300"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Country</Label>
              <SimpleCountrySelect
                value={profile?.country || ''}
                onValueChange={(value) => setProfile(prev => prev ? {...prev, country: value} : null)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="nationality" className="text-gray-700">Nationality</Label>
              <Input
                id="nationality"
                value={profile?.nationality || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, nationality: e.target.value} : null)}
                placeholder="Enter your nationality"
                className="rounded-xl border-blue-300 mt-1"
              />
            </div>

            <Button 
              onClick={saveProfile} 
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Baby Information Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Baby className="w-5 h-5" />
              My Babies ({babies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {babies.length === 0 ? (
              <div className="text-center py-6">
                <Baby className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No babies added yet</p>
                <Button 
                  onClick={() => window.location.href = '/add-baby'}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  Add Your First Baby
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {babies.map(baby => (
                  <div key={baby.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={baby.photoUrl} />
                      <AvatarFallback className="bg-pink-100 text-pink-600">
                        {baby.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{baby.name}</h3>
                      <p className="text-sm text-gray-500">
                        {Math.floor((Date.now() - baby.birthDate.getTime()) / (1000 * 60 * 60 * 24))} days old
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {baby.gender}
                    </Badge>
                  </div>
                ))}
                <Button 
                  onClick={() => window.location.href = '/add-baby'}
                  variant="outline"
                  className="w-full rounded-xl border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Add Another Baby
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/settings'}
              variant="outline"
              className="w-full justify-start rounded-xl border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Globe className="w-4 h-4 mr-2" />
              App Settings & Preferences
            </Button>
            <Button 
              onClick={() => window.location.href = '/feedback'}
              variant="outline"
              className="w-full justify-start rounded-xl border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Phone className="w-4 h-4 mr-2" />
              Send Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileManagement;
