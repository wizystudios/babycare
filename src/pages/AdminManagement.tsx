
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, UserCog, Users, Stethoscope } from 'lucide-react';

const AdminManagement = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      toast.error('Failed to fetch users');
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

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.success('User role updated successfully');
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
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
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Access denied. You need admin privileges to view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <p className="text-muted-foreground">Manage users and their roles</p>
      </div>

      <div className="grid gap-4">
        {users.map((userProfile) => (
          <Card key={userProfile.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getRoleIcon(userProfile.role)}
                  <div>
                    <CardTitle className="text-lg">
                      {userProfile.full_name || 'Unnamed User'}
                    </CardTitle>
                    <CardDescription>
                      {userProfile.phone && `${userProfile.phone} • `}
                      {userProfile.country || 'No country specified'}
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
        
        {users.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No users found.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
