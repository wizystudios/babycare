
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, UserCog, Users, Stethoscope, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    fetchUsers();
  }, [user, isAdmin]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching users from profiles table...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          country,
          country_code,
          specialization,
          license_number,
          hospital_affiliation,
          bio,
          role,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Fetched users:', data);
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      const errorMessage = error.message || 'Failed to fetch users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      console.log('Updating user role:', userId, newRole);
      
      // Update role in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Update role in user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

      if (roleError) {
        console.error('User roles update error:', roleError);
        throw roleError;
      }

      // If changing to doctor, create doctor entry
      if (newRole === 'doctor') {
        const user = users.find(u => u.id === userId);
        if (user) {
          const { error: doctorError } = await supabase
            .from('doctors')
            .upsert({
              user_id: userId,
              name: user.full_name || 'Doctor',
              specialization: user.specialization || 'General Medicine',
              phone: user.phone,
              email: userId, // This would need to be fetched from auth.users if needed
              available: true
            }, { onConflict: 'user_id' });
          
          if (doctorError) {
            console.error('Error creating doctor entry:', doctorError);
            // Don't throw here, role update was successful
          }
        }
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.success('User role updated successfully');
    } catch (error: any) {
      console.error('Error updating user role:', error);
      const errorMessage = error.message || 'Failed to update user role';
      toast.error(errorMessage);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <UserCog className="h-4 w-4" />;
      case 'doctor':
        return <Stethoscope className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'doctor':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (!isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You need admin privileges to view this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">Admin Management</h1>
          <p className="text-muted-foreground">Manage users, their roles, and permissions</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {users.map((userProfile) => (
          <Card key={userProfile.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getRoleIcon(userProfile.role)}
                  <div>
                    <CardTitle className="text-lg">
                      {userProfile.full_name || 'User Profile Incomplete'}
                    </CardTitle>
                    <CardDescription>
                      {userProfile.phone ? `${userProfile.phone} • ` : 'No phone • '}
                      {userProfile.country || 'No country set'}
                      {!userProfile.full_name && (
                        <Badge variant="outline" className="ml-2 text-warning">
                          Incomplete Profile
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(userProfile.role)}>
                  {userProfile.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProfile.specialization && (
                  <div>
                    <strong>Specialization:</strong> {userProfile.specialization}
                  </div>
                )}
                {userProfile.license_number && (
                  <div>
                    <strong>License Number:</strong> {userProfile.license_number}
                  </div>
                )}
                {userProfile.hospital_affiliation && (
                  <div>
                    <strong>Hospital Affiliation:</strong> {userProfile.hospital_affiliation}
                  </div>
                )}
                {userProfile.bio && (
                  <div>
                    <strong>Bio:</strong> {userProfile.bio}
                  </div>
                )}
                
                <div className="flex items-center space-x-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <label htmlFor={`role-${userProfile.id}`} className="text-sm font-medium">
                      Role:
                    </label>
                    <Select
                      value={userProfile.role}
                      onValueChange={(value: UserRole) => updateUserRole(userProfile.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteUser(userProfile.id)}
                    className="ml-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {users.length === 0 && !isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                <p className="text-muted-foreground">
                  There are no user profiles in the system yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
