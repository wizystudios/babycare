
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { CountrySelect } from '@/components/forms/CountrySelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UserRole } from '@/types/models';

interface Country {
  id: string;
  name: string;
  code: string;
  phone_code: string;
}

interface MultiStepRegisterFormProps {
  showRoleSelection?: boolean;
}

export const MultiStepRegisterForm: React.FC<MultiStepRegisterFormProps> = ({ showRoleSelection = true }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  
  // Professional fields
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('');
  const [bio, setBio] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const totalSteps = showRoleSelection ? (role === 'parent' ? 3 : 4) : 2;

  const handleNext = () => {
    if (currentStep === 1) {
      if (!email || !password || !confirmPassword) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }
      
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive"
        });
        return;
      }
      
      if (password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters",
          variant: "destructive"
        });
        return;
      }
    }

    if (currentStep === 2) {
      if (!fullName) {
        toast({
          title: "Error",
          description: "Please enter your full name",
          variant: "destructive"
        });
        return;
      }
      
      if (showRoleSelection && !role) {
        toast({
          title: "Error",
          description: "Please select your role",
          variant: "destructive"
        });
        return;
      }
    }

    if (currentStep === 3 && role !== 'parent') {
      if ((role === 'doctor' || role === 'medical_expert') && !specialization) {
        toast({
          title: "Error",
          description: "Please enter your specialization",
          variant: "destructive"
        });
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const userData: any = {
        full_name: fullName,
        country: selectedCountry?.name,
        country_code: selectedCountry?.phone_code,
        phone: phoneNumber,
        role: role
      };

      // Add professional fields if applicable
      if (role === 'doctor' || role === 'medical_expert') {
        userData.specialization = specialization;
        userData.license_number = licenseNumber;
        userData.hospital_affiliation = hospitalAffiliation;
        userData.bio = bio;
      } else if (role === 'hospital') {
        userData.bio = bio;
      }

      const { error } = await signUp(email, password, userData);
      
      if (error) {
        throw error;
      }
      
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = "Registration failed";
      
      if (error.message) {
        if (error.message.includes('already registered')) {
          errorMessage = "Email is already registered";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Account Details</h3>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">At least 6 characters</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Personal Information</h3>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                type="text" 
                placeholder="Enter your full name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            {showRoleSelection && (
              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent/Caregiver</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="medical_expert">Medical Expert</SelectItem>
                    <SelectItem value="hospital">Hospital Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 3:
        if (role === 'parent') {
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Contact Information</h3>
              <CountrySelect
                onCountryChange={setSelectedCountry}
                onPhoneChange={setPhoneNumber}
                selectedCountry={selectedCountry}
                phoneNumber={phoneNumber}
              />
            </div>
          );
        } else {
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Professional Information</h3>
              
              {(role === 'doctor' || role === 'medical_expert') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization *</Label>
                    <Input 
                      id="specialization" 
                      type="text" 
                      placeholder="e.g., Pediatrics, Family Medicine" 
                      value={specialization} 
                      onChange={(e) => setSpecialization(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input 
                      id="licenseNumber" 
                      type="text" 
                      placeholder="Medical license number" 
                      value={licenseNumber} 
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hospitalAffiliation">Hospital/Clinic Affiliation</Label>
                    <Input 
                      id="hospitalAffiliation" 
                      type="text" 
                      placeholder="Where do you practice?" 
                      value={hospitalAffiliation} 
                      onChange={(e) => setHospitalAffiliation(e.target.value)}
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="bio">Brief Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about your experience and expertise..." 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          );
        }

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Contact Information</h3>
            <CountrySelect
              onCountryChange={setSelectedCountry}
              onPhoneChange={setPhoneNumber}
              selectedCountry={selectedCountry}
              phoneNumber={phoneNumber}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex justify-center space-x-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i + 1 <= currentStep ? 'bg-baby-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {renderStep()}

      {/* Navigation buttons */}
      <div className="flex justify-between space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {currentStep === totalSteps ? (
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="flex items-center"
          >
            {isLoading ? (
              <>
                <Loader size="small" className="mr-2" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            className="flex items-center"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};
