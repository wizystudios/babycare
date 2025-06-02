
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
import { Plus, User, Building, Phone, Mail, MapPin, Users, FileDown, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { useToast } from '@/components/ui/use-toast';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital_id: string;
  phone: string;
  email: string;
  experience: string;
  available: boolean;
  hospital?: { name: string };
}

interface Hospital {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  services: string[];
  description: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  country: string;
  email: string;
  created_at: string;
  role: string;
}

const AdminManagement = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(false);

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
          hospital:hospitals(name)
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
          email: '', // We can't access auth.users directly, so email will be empty
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
        title: 'Success',
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
        title: 'Success',
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

  const handleDeleteDoctor = async (doctorId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
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
        title: 'Success',
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
      // Generate a simple report with current statistics
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
          hospital: d.hospital?.name,
          available: d.available
        })),
        hospitals: hospitals.map(h => ({
          name: h.name,
          location: h.location,
          services: h.services
        }))
      };

      // Create and download the report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
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

  if (!isAdmin()) {
    return (
      <Layout>
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-baby-primary">Admin Management</h1>
          <div className="flex items-center gap-2">
            <Button 
              onClick={generateReport}
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Download Report
            </Button>
            <Badge variant="outline" className="text-baby-primary">
              Admin Panel
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="doctors">Medical Experts</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Medical Experts ({doctors.length})</h2>
                <Button 
                  onClick={() => setShowAddDoctor(true)}
                  disabled={loading}
                  className="bg-baby-primary hover:bg-baby-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Doctor
                </Button>
              </div>

              {showAddDoctor && (
                <Card className="border-baby-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Doctor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="doctor-name">Full Name *</Label>
                        <Input
                          id="doctor-name"
                          value={newDoctor.name}
                          onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                          placeholder="Dr. John Doe"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="doctor-specialization">Specialization *</Label>
                        <Select onValueChange={(value) => setNewDoctor({...newDoctor, specialization: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pediatrician">Pediatrician</SelectItem>
                            <SelectItem value="neonatologist">Neonatologist</SelectItem>
                            <SelectItem value="gynecologist">Gynecologist</SelectItem>
                            <SelectItem value="family-medicine">Family Medicine</SelectItem>
                            <SelectItem value="lactation-consultant">Lactation Consultant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="doctor-hospital">Hospital *</Label>
                        <Select onValueChange={(value) => setNewDoctor({...newDoctor, hospital_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hospital" />
                          </SelectTrigger>
                          <SelectContent>
                            {hospitals.map((hospital) => (
                              <SelectItem key={hospital.id} value={hospital.id}>
                                {hospital.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="doctor-experience">Experience</Label>
                        <Input
                          id="doctor-experience"
                          value={newDoctor.experience}
                          onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})}
                          placeholder="5 years"
                        />
                      </div>
                      <div>
                        <Label htmlFor="doctor-phone">Phone</Label>
                        <Input
                          id="doctor-phone"
                          value={newDoctor.phone}
                          onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                          placeholder="+254700123456"
                        />
                      </div>
                      <div>
                        <Label htmlFor="doctor-email">Email</Label>
                        <Input
                          id="doctor-email"
                          type="email"
                          value={newDoctor.email}
                          onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                          placeholder="doctor@hospital.com"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddDoctor} 
                        disabled={loading}
                        className="bg-baby-primary hover:bg-baby-primary/90"
                      >
                        {loading ? 'Adding...' : 'Add Doctor'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddDoctor(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {doctors.map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-baby-blue/20 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-baby-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{doctor.name}</h3>
                            <p className="text-baby-primary font-medium">{doctor.specialization}</p>
                            <p className="text-sm text-gray-600">{doctor.hospital?.name}</p>
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
                              <p className="text-sm text-gray-600 mt-1">Experience: {doctor.experience}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={doctor.available ? "default" : "secondary"}>
                              {doctor.available ? "Available" : "Unavailable"}
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
                          >
                            Toggle Status
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hospitals" className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Hospitals ({hospitals.length})</h2>
                <Button 
                  onClick={() => setShowAddHospital(true)}
                  disabled={loading}
                  className="bg-baby-primary hover:bg-baby-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Hospital
                </Button>
              </div>

              {showAddHospital && (
                <Card className="border-baby-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Hospital</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hospital-name">Hospital Name *</Label>
                        <Input
                          id="hospital-name"
                          value={newHospital.name}
                          onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                          placeholder="Children's Hospital"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="hospital-location">Location *</Label>
                        <Input
                          id="hospital-location"
                          value={newHospital.location}
                          onChange={(e) => setNewHospital({...newHospital, location: e.target.value})}
                          placeholder="City, Country"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="hospital-phone">Phone</Label>
                        <Input
                          id="hospital-phone"
                          value={newHospital.phone}
                          onChange={(e) => setNewHospital({...newHospital, phone: e.target.value})}
                          placeholder="+254700123456"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hospital-email">Email</Label>
                        <Input
                          id="hospital-email"
                          type="email"
                          value={newHospital.email}
                          onChange={(e) => setNewHospital({...newHospital, email: e.target.value})}
                          placeholder="info@hospital.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="hospital-services">Services (comma separated)</Label>
                      <Input
                        id="hospital-services"
                        value={newHospital.services}
                        onChange={(e) => setNewHospital({...newHospital, services: e.target.value})}
                        placeholder="Pediatrics, Maternity, Emergency Care"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hospital-description">Description</Label>
                      <Textarea
                        id="hospital-description"
                        value={newHospital.description}
                        onChange={(e) => setNewHospital({...newHospital, description: e.target.value})}
                        placeholder="Brief description of the hospital"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddHospital} 
                        disabled={loading}
                        className="bg-baby-primary hover:bg-baby-primary/90"
                      >
                        {loading ? 'Adding...' : 'Add Hospital'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddHospital(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {hospitals.map((hospital) => (
                  <Card key={hospital.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-baby-mint/20 rounded-full flex items-center justify-center">
                            <Building className="w-6 h-6 text-baby-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{hospital.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {hospital.location}
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
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {service}
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
            </div>
          </TabsContent>

          <TabsContent value="users" className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Users ({users.length})</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Admin: {users.filter(u => u.role === 'admin').length}</Badge>
                  <Badge variant="outline">Parents: {users.filter(u => u.role === 'parent').length}</Badge>
                  <Badge variant="outline">Medical Experts: {users.filter(u => u.role === 'medical_expert').length}</Badge>
                </div>
              </div>

              <div className="grid gap-4">
                {users.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-baby-blue/20 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-baby-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{user.full_name || 'Unknown User'}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={user.role === 'admin' ? 'default' : user.role === 'medical_expert' ? 'secondary' : 'outline'}>
                                {user.role}
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
                                  {user.country}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminManagement;
