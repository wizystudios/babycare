
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, User, Building, Phone, Mail, MapPin, Users, FileDown, Bell, Heart, Baby, ChevronLeft, ChevronRight, Edit, Trash2, UserPlus, Shield, Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { useToast } from '@/components/ui/use-toast';
import { Doctor, Hospital, UserProfile } from '@/types/models';

const AdminManagement = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentDoctorPage, setCurrentDoctorPage] = useState(1);
  const [currentHospitalPage, setCurrentHospitalPage] = useState(1);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const itemsPerPage = 3;

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    hospital_id: '',
    phone: '',
    email: '',
    experience: ''
  });

  const [newHospital, setNewHospital] = useState({
    name: '',
    location: '',
    phone: '',
    email: '',
    services: '',
    description: ''
  });

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    country: '',
    role: 'parent'
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDoctors(),
        fetchHospitals(),
        fetchUsers()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          hospitals!doctors_hospital_id_fkey(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch user profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          country,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles = (profiles || []).map(profile => {
        const userRole = roles?.find(role => role.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'parent',
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const validateDoctorForm = () => {
    if (!newDoctor.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Doctor name is required',
        variant: 'destructive',
      });
      return false;
    }
    if (!newDoctor.specialization) {
      toast({
        title: 'Validation Error',
        description: 'Specialization is required',
        variant: 'destructive',
      });
      return false;
    }
    if (!newDoctor.hospital_id) {
      toast({
        title: 'Validation Error',
        description: 'Hospital selection is required',
        variant: 'destructive',
      });
      return false;
    }
    if (newDoctor.email && !/\S+@\S+\.\S+/.test(newDoctor.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateHospitalForm = () => {
    if (!newHospital.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Hospital name is required',
        variant: 'destructive',
      });
      return false;
    }
    if (!newHospital.location.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Location is required',
        variant: 'destructive',
      });
      return false;
    }
    if (newHospital.email && !/\S+@\S+\.\S+/.test(newHospital.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleAddDoctor = async () => {
    if (!validateDoctorForm()) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('doctors')
        .insert([{
          ...newDoctor,
          created_by: user?.id,
          available: true
        }]);
      
      if (error) throw error;
      
      toast({
        title: '🎉 Success',
        description: 'Doctor added successfully',
      });
      
      setNewDoctor({
        name: '',
        specialization: '',
        hospital_id: '',
        phone: '',
        email: '',
        experience: ''
      });
      setShowAddDoctor(false);
      await fetchDoctors();
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast({
        title: 'Error',
        description: 'Failed to add doctor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddHospital = async () => {
    if (!validateHospitalForm()) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('hospitals')
        .insert([{
          ...newHospital,
          services: newHospital.services.split(',').map(s => s.trim()).filter(s => s),
          created_by: user?.id
        }]);
      
      if (error) throw error;
      
      toast({
        title: '🎉 Success',
        description: 'Hospital added successfully',
      });
      
      setNewHospital({
        name: '',
        location: '',
        phone: '',
        email: '',
        services: '',
        description: ''
      });
      setShowAddHospital(false);
      await fetchHospitals();
    } catch (error) {
      console.error('Error adding hospital:', error);
      toast({
        title: 'Error',
        description: 'Failed to add hospital',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast({
        title: 'Validation Error',
        description: 'Email, password and full name are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name,
            phone: newUser.phone,
            country: newUser.country,
          }
        }
      });
      
      if (error) throw error;

      // Set the user role
      if (data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{
            user_id: data.user.id,
            role: newUser.role
          }]);
        
        if (roleError) throw roleError;
      }
      
      toast({
        title: '🎉 Success',
        description: 'User created successfully',
      });
      
      setNewUser({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        country: '',
        role: 'parent'
      });
      setShowAddUser(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_roles')
        .upsert([{
          user_id: userId,
          role: newRole
        }]);
      
      if (error) throw error;
      
      toast({
        title: '🎉 Success',
        description: 'User role updated successfully',
      });
      
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId);
      
      if (error) throw error;
      
      toast({
        title: '🗑️ Success',
        description: 'Doctor deleted successfully',
      });
      
      await fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete doctor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHospital = async (hospitalId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('hospitals')
        .delete()
        .eq('id', hospitalId);
      
      if (error) throw error;
      
      toast({
        title: '🗑️ Success',
        description: 'Hospital deleted successfully',
      });
      
      await fetchHospitals();
    } catch (error) {
      console.error('Error deleting hospital:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete hospital',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDoctorAvailability = async (doctorId: string) => {
    try {
      const doctor = doctors.find(d => d.id === doctorId);
      if (!doctor) return;

      const { error } = await supabase
        .from('doctors')
        .update({ available: !doctor.available })
        .eq('id', doctorId);
      
      if (error) throw error;
      
      await fetchDoctors();
    } catch (error) {
      console.error('Error updating doctor availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update doctor availability',
        variant: 'destructive',
      });
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const report = {
        generatedAt: new Date().toISOString(),
        totalDoctors: doctors.length,
        availableDoctors: doctors.filter(d => d.available).length,
        totalHospitals: hospitals.length,
        totalUsers: users.length,
        usersByRole: {
          admin: users.filter(u => u.role === 'admin').length,
          parent: users.filter(u => u.role === 'parent').length,
          medical_expert: users.filter(u => u.role === 'medical_expert').length,
        },
        doctors: doctors.map(d => ({
          name: d.name,
          specialization: d.specialization,
          hospital: d.hospitals?.name,
          available: d.available
        })),
        hospitals: hospitals.map(h => ({
          name: h.name,
          location: h.location,
          services: h.services
        }))
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `baby-care-admin-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: '📊 Success',
        description: 'Report generated and downloaded successfully',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Pagination helpers
  const paginateData = (data: any[], currentPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength: number) => Math.ceil(dataLength / itemsPerPage);

  if (!isAdmin()) {
    return (
      <Layout>
        <div className="p-6 text-center bg-gradient-to-br from-pink-50 to-purple-50 min-h-screen">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-8 border-4 border-pink-200">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-pink-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this admin panel.</p>
            <div className="mt-6">
              <Baby className="w-16 h-16 text-pink-400 mx-auto" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const adminStats = {
    doctors: doctors.length,
    hospitals: hospitals.length,
    users: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    parentUsers: users.filter(u => u.role === 'parent').length,
    medicalExperts: users.filter(u => u.role === 'medical_expert').length,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-pink-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-3 rounded-2xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Manage your BabyCare application</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={generateReport}
                variant="outline"
                disabled={loading}
                className="flex items-center gap-2 border-pink-300 text-pink-600 hover:bg-pink-50 rounded-xl"
              >
                <FileDown className="w-4 h-4" />
                Download Report
              </Button>
              <Badge variant="outline" className="text-pink-600 border-pink-300 bg-pink-50 px-4 py-2 rounded-xl">
                🛡️ Admin Panel
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-r from-pink-100 to-pink-200 p-4 rounded-2xl border-2 border-pink-300">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-pink-600" />
                <span className="text-sm font-medium text-pink-800">Doctors</span>
              </div>
              <p className="text-2xl font-bold text-pink-700">{adminStats.doctors}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-2xl border-2 border-purple-300">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Hospitals</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">{adminStats.hospitals}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-2xl border-2 border-blue-300">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{adminStats.users}</p>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-2xl border-2 border-green-300">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{doctors.filter(d => d.available).length}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-2xl p-2 border-4 border-pink-200">
            <TabsTrigger value="doctors" className="rounded-xl data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">
              👨‍⚕️ Medical Experts
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="rounded-xl data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              🏥 Hospitals
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              👥 Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="pt-4">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border-4 border-pink-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-pink-700">Medical Experts ({doctors.length})</h2>
                  <Button 
                    onClick={() => setShowAddDoctor(true)}
                    disabled={loading}
                    className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Doctor
                  </Button>
                </div>

                {showAddDoctor && (
                  <Card className="border-pink-300 rounded-2xl mb-4">
                    <CardHeader className="bg-pink-50 rounded-t-2xl">
                      <CardTitle className="text-lg text-pink-700">👨‍⚕️ Add New Doctor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="doctor-name" className="text-pink-700">Full Name *</Label>
                          <Input
                            id="doctor-name"
                            value={newDoctor.name}
                            onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                            placeholder="Dr. John Doe"
                            className="rounded-xl border-pink-300"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="doctor-specialization" className="text-pink-700">Specialization *</Label>
                          <Select onValueChange={(value) => setNewDoctor({...newDoctor, specialization: value})}>
                            <SelectTrigger className="rounded-xl border-pink-300">
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pediatrician">👶 Pediatrician</SelectItem>
                              <SelectItem value="neonatologist">🍼 Neonatologist</SelectItem>
                              <SelectItem value="gynecologist">👩‍⚕️ Gynecologist</SelectItem>
                              <SelectItem value="family-medicine">👨‍👩‍👧‍👦 Family Medicine</SelectItem>
                              <SelectItem value="lactation-consultant">🤱 Lactation Consultant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="doctor-hospital" className="text-pink-700">Hospital *</Label>
                          <Select onValueChange={(value) => setNewDoctor({...newDoctor, hospital_id: value})}>
                            <SelectTrigger className="rounded-xl border-pink-300">
                              <SelectValue placeholder="Select hospital" />
                            </SelectTrigger>
                            <SelectContent>
                              {hospitals.map((hospital) => (
                                <SelectItem key={hospital.id} value={hospital.id}>
                                  🏥 {hospital.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="doctor-experience" className="text-pink-700">Experience</Label>
                          <Input
                            id="doctor-experience"
                            value={newDoctor.experience}
                            onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})}
                            placeholder="5 years"
                            className="rounded-xl border-pink-300"
                          />
                        </div>
                        <div>
                          <Label htmlFor="doctor-phone" className="text-pink-700">Phone</Label>
                          <Input
                            id="doctor-phone"
                            value={newDoctor.phone}
                            onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                            placeholder="+254700123456"
                            className="rounded-xl border-pink-300"
                          />
                        </div>
                        <div>
                          <Label htmlFor="doctor-email" className="text-pink-700">Email</Label>
                          <Input
                            id="doctor-email"
                            type="email"
                            value={newDoctor.email}
                            onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                            placeholder="doctor@hospital.com"
                            className="rounded-xl border-pink-300"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleAddDoctor} 
                          disabled={loading}
                          className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 rounded-xl"
                        >
                          {loading ? '🔄 Adding...' : '✅ Add Doctor'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddDoctor(false)} className="rounded-xl border-pink-300">
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Doctors List with Pagination */}
                <div className="space-y-4">
                  {paginateData(doctors, currentDoctorPage).map((doctor) => (
                    <Card key={doctor.id} className="hover:shadow-lg transition-shadow rounded-2xl border-2 border-pink-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-pink-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-800">{doctor.name}</h3>
                              <p className="text-pink-600 font-medium">👨‍⚕️ {doctor.specialization}</p>
                              <p className="text-sm text-gray-600">🏥 {doctor.hospitals?.name}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                {doctor.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {doctor.phone}
                                  </span>
                                )}
                                {doctor.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {doctor.email}
                                  </span>
                                )}
                              </div>
                              {doctor.experience && (
                                <p className="text-sm text-gray-600 mt-1">📅 Experience: {doctor.experience}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={doctor.available ? "default" : "secondary"} className="rounded-xl">
                                {doctor.available ? "🟢 Available" : "🔴 Unavailable"}
                              </Badge>
                              <ActionMenu
                                onEdit={() => setEditingDoctor(doctor)}
                                onDelete={() => handleDeleteDoctor(doctor.id)}
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleDoctorAvailability(doctor.id)}
                              disabled={loading}
                              className="rounded-xl"
                            >
                              Toggle Status
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentDoctorPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentDoctorPage === 1}
                    className="rounded-xl border-pink-300 text-pink-600"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-pink-700 font-medium">
                    Page {currentDoctorPage} of {getTotalPages(doctors.length)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentDoctorPage(prev => Math.min(prev + 1, getTotalPages(doctors.length)))}
                    disabled={currentDoctorPage === getTotalPages(doctors.length)}
                    className="rounded-xl border-pink-300 text-pink-600"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hospitals" className="pt-4">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border-4 border-purple-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-purple-700">Hospitals ({hospitals.length})</h2>
                  <Button 
                    onClick={() => setShowAddHospital(true)}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hospital
                  </Button>
                </div>

                {showAddHospital && (
                  <Card className="border-purple-300 rounded-2xl mb-4">
                    <CardHeader className="bg-purple-50 rounded-t-2xl">
                      <CardTitle className="text-lg text-purple-700">🏥 Add New Hospital</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hospital-name" className="text-purple-700">Hospital Name *</Label>
                          <Input
                            id="hospital-name"
                            value={newHospital.name}
                            onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                            placeholder="Children's Hospital"
                            className="rounded-xl border-purple-300"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="hospital-location" className="text-purple-700">Location *</Label>
                          <Input
                            id="hospital-location"
                            value={newHospital.location}
                            onChange={(e) => setNewHospital({...newHospital, location: e.target.value})}
                            placeholder="City, Country"
                            className="rounded-xl border-purple-300"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="hospital-phone" className="text-purple-700">Phone</Label>
                          <Input
                            id="hospital-phone"
                            value={newHospital.phone}
                            onChange={(e) => setNewHospital({...newHospital, phone: e.target.value})}
                            placeholder="+254700123456"
                            className="rounded-xl border-purple-300"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hospital-email" className="text-purple-700">Email</Label>
                          <Input
                            id="hospital-email"
                            type="email"
                            value={newHospital.email}
                            onChange={(e) => setNewHospital({...newHospital, email: e.target.value})}
                            placeholder="info@hospital.com"
                            className="rounded-xl border-purple-300"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="hospital-services" className="text-purple-700">Services (comma separated)</Label>
                        <Input
                          id="hospital-services"
                          value={newHospital.services}
                          onChange={(e) => setNewHospital({...newHospital, services: e.target.value})}
                          placeholder="Pediatrics, Maternity, Emergency Care"
                          className="rounded-xl border-purple-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hospital-description" className="text-purple-700">Description</Label>
                        <Textarea
                          id="hospital-description"
                          value={newHospital.description}
                          onChange={(e) => setNewHospital({...newHospital, description: e.target.value})}
                          placeholder="Brief description of the hospital"
                          rows={3}
                          className="rounded-xl border-purple-300"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleAddHospital} 
                          disabled={loading}
                          className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 rounded-xl"
                        >
                          {loading ? '🔄 Adding...' : '✅ Add Hospital'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddHospital(false)} className="rounded-xl border-purple-300">
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Hospitals List with Pagination */}
                <div className="space-y-4">
                  {paginateData(hospitals, currentHospitalPage).map((hospital) => (
                    <Card key={hospital.id} className="hover:shadow-lg transition-shadow rounded-2xl border-2 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full flex items-center justify-center">
                              <Building className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-800">{hospital.name}</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                📍 {hospital.location}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                {hospital.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {hospital.phone}
                                  </span>
                                )}
                                {hospital.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {hospital.email}
                                  </span>
                                )}
                              </div>
                              {hospital.services && hospital.services.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {hospital.services.map((service, index) => (
                                    <Badge key={index} variant="outline" className="text-xs rounded-lg border-purple-300 text-purple-600">
                                      🏥 {service}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {hospital.description && (
                                <p className="text-sm text-gray-600 mt-2">{hospital.description}</p>
                              )}
                            </div>
                          </div>
                          <ActionMenu
                            onEdit={() => setEditingHospital(hospital)}
                            onDelete={() => handleDeleteHospital(hospital.id)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentHospitalPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentHospitalPage === 1}
                    className="rounded-xl border-purple-300 text-purple-600"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-purple-700 font-medium">
                    Page {currentHospitalPage} of {getTotalPages(hospitals.length)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentHospitalPage(prev => Math.min(prev + 1, getTotalPages(hospitals.length)))}
                    disabled={currentHospitalPage === getTotalPages(hospitals.length)}
                    className="rounded-xl border-purple-300 text-purple-600"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="pt-4">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border-4 border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-blue-700">Users ({users.length})</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-lg border-red-300 text-red-600 bg-red-50">
                        🛡️ Admin: {adminStats.adminUsers}
                      </Badge>
                      <Badge variant="outline" className="rounded-lg border-green-300 text-green-600 bg-green-50">
                        👨‍👩‍👧‍👦 Parents: {adminStats.parentUsers}
                      </Badge>
                      <Badge variant="outline" className="rounded-lg border-blue-300 text-blue-600 bg-blue-50">
                        👨‍⚕️ Medical: {adminStats.medicalExperts}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowAddUser(true)}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 rounded-xl"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>

                {showAddUser && (
                  <Card className="border-blue-300 rounded-2xl mb-4">
                    <CardHeader className="bg-blue-50 rounded-t-2xl">
                      <CardTitle className="text-lg text-blue-700">👤 Add New User</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="user-email" className="text-blue-700">Email *</Label>
                          <Input
                            id="user-email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            placeholder="user@example.com"
                            className="rounded-xl border-blue-300"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="user-password" className="text-blue-700">Password *</Label>
                          <Input
                            id="user-password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            placeholder="Password"
                            className="rounded-xl border-blue-300"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="user-name" className="text-blue-700">Full Name *</Label>
                          <Input
                            id="user-name"
                            value={newUser.full_name}
                            onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                            placeholder="John Doe"
                            className="rounded-xl border-blue-300"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="user-role" className="text-blue-700">Role *</Label>
                          <Select onValueChange={(value) => setNewUser({...newUser, role: value})}>
                            <SelectTrigger className="rounded-xl border-blue-300">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="parent">👨‍👩‍👧‍👦 Parent</SelectItem>
                              <SelectItem value="medical_expert">👨‍⚕️ Medical Expert</SelectItem>
                              <SelectItem value="admin">🛡️ Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="user-phone" className="text-blue-700">Phone</Label>
                          <Input
                            id="user-phone"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                            placeholder="+254700123456"
                            className="rounded-xl border-blue-300"
                          />
                        </div>
                        <div>
                          <Label htmlFor="user-country" className="text-blue-700">Country</Label>
                          <Input
                            id="user-country"
                            value={newUser.country}
                            onChange={(e) => setNewUser({...newUser, country: e.target.value})}
                            placeholder="Kenya"
                            className="rounded-xl border-blue-300"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleAddUser} 
                          disabled={loading}
                          className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 rounded-xl"
                        >
                          {loading ? '🔄 Creating...' : '✅ Create User'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddUser(false)} className="rounded-xl border-blue-300">
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Users List with Pagination */}
                <div className="space-y-4">
                  {paginateData(users, currentUserPage).map((user) => (
                    <Card key={user.id} className="hover:shadow-lg transition-shadow rounded-2xl border-2 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-200 to-green-200 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-800">{user.full_name || 'Unknown User'}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={user.role === 'admin' ? 'default' : user.role === 'medical_expert' ? 'secondary' : 'outline'} className="rounded-lg">
                                  {user.role === 'admin' && '🛡️ Admin'}
                                  {user.role === 'medical_expert' && '👨‍⚕️ Medical Expert'}
                                  {user.role === 'parent' && '👨‍👩‍👧‍👦 Parent'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                {user.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {user.phone}
                                  </span>
                                )}
                                {user.country && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    📍 {user.country}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                📅 Joined: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select onValueChange={(value) => handleUpdateUserRole(user.id, value)}>
                              <SelectTrigger className="w-40 rounded-xl border-blue-300">
                                <SelectValue placeholder="Change role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="parent">👨‍👩‍👧‍👦 Parent</SelectItem>
                                <SelectItem value="medical_expert">👨‍⚕️ Medical Expert</SelectItem>
                                <SelectItem value="admin">🛡️ Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" className="rounded-xl border-blue-300">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl border-orange-300 text-orange-600">
                              <Ban className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl border-red-300 text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentUserPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentUserPage === 1}
                    className="rounded-xl border-blue-300 text-blue-600"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-blue-700 font-medium">
                    Page {currentUserPage} of {getTotalPages(users.length)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentUserPage(prev => Math.min(prev + 1, getTotalPages(users.length)))}
                    disabled={currentUserPage === getTotalPages(users.length)}
                    className="rounded-xl border-blue-300 text-blue-600"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminManagement;
