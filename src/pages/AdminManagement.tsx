
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
import { Plus, User, Building, Phone, Mail, MapPin } from 'lucide-react';
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

const AdminManagement = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);

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
      fetchDoctors();
      fetchHospitals();
    }
  }, [user]);

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

  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.specialization || !newDoctor.hospital_id) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('doctors')
        .insert([{
          ...newDoctor,
          created_by: user?.id
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
      fetchDoctors();
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast({
        title: 'Error',
        description: 'Failed to add doctor',
        variant: 'destructive',
      });
    }
  };

  const handleAddHospital = async () => {
    if (!newHospital.name || !newHospital.location) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('hospitals')
        .insert([{
          ...newHospital,
          services: newHospital.services.split(',').map(s => s.trim()),
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
      fetchHospitals();
    } catch (error) {
      console.error('Error adding hospital:', error);
      toast({
        title: 'Error',
        description: 'Failed to add hospital',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Doctor deleted successfully',
      });
      
      fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete doctor',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteHospital = async (hospitalId: string) => {
    try {
      const { error } = await supabase
        .from('hospitals')
        .delete()
        .eq('id', hospitalId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Hospital deleted successfully',
      });
      
      fetchHospitals();
    } catch (error) {
      console.error('Error deleting hospital:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete hospital',
        variant: 'destructive',
      });
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
      
      fetchDoctors();
    } catch (error) {
      console.error('Error updating doctor availability:', error);
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
          <Badge variant="outline" className="text-baby-primary">
            Admin Panel
          </Badge>
        </div>

        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctors">Medical Experts</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Medical Experts</h2>
                <Button 
                  onClick={() => setShowAddDoctor(true)}
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
                        <Label htmlFor="doctor-name">Full Name</Label>
                        <Input
                          id="doctor-name"
                          value={newDoctor.name}
                          onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                          placeholder="Dr. John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="doctor-specialization">Specialization</Label>
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
                        <Label htmlFor="doctor-hospital">Hospital</Label>
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
                      <Button onClick={handleAddDoctor} className="bg-baby-primary hover:bg-baby-primary/90">
                        Add Doctor
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
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {doctor.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {doctor.email}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Experience: {doctor.experience}</p>
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
                <h2 className="text-xl font-semibold">Hospitals</h2>
                <Button 
                  onClick={() => setShowAddHospital(true)}
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
                        <Label htmlFor="hospital-name">Hospital Name</Label>
                        <Input
                          id="hospital-name"
                          value={newHospital.name}
                          onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                          placeholder="Children's Hospital"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hospital-location">Location</Label>
                        <Input
                          id="hospital-location"
                          value={newHospital.location}
                          onChange={(e) => setNewHospital({...newHospital, location: e.target.value})}
                          placeholder="City, Country"
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
                      <Button onClick={handleAddHospital} className="bg-baby-primary hover:bg-baby-primary/90">
                        Add Hospital
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
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {hospital.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {hospital.email}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {hospital.services?.map((service, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{hospital.description}</p>
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminManagement;
