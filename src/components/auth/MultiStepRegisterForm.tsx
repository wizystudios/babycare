
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types/models';

interface MultiStepRegisterFormProps {
  showRoleSelection?: boolean;
}

export const MultiStepRegisterForm: React.FC<MultiStepRegisterFormProps> = ({ showRoleSelection = true }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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

    if (showRoleSelection && !role) {
      toast({
        title: "Error",
        description: "Please select your role",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Only pass essential data during registration
      const userData = {
        role: role
      };

      const { error } = await signUp(email, password, userData);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Registration successful! You can complete your profile in account settings.",
        variant: "default"
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = "Registration failed";
      
      if (error.message) {
        if (error.message.includes('already registered')) {
          errorMessage = "Email is already registered";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Please enter a valid email address";
        } else if (error.message.includes('Password')) {
          errorMessage = "Password requirements not met";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Create Account</h3>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
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
            <Label htmlFor="password">Password *</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="At least 6 characters"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="Confirm your password"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          {showRoleSelection && (
            <div className="space-y-2">
              <Label htmlFor="role">I am a... *</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent/Caregiver</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button 
          type="submit"
          disabled={isLoading}
          className="w-full"
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
      </form>
      
      <div className="text-sm text-gray-600 text-center">
        <p>You can complete your profile information later in Account Settings.</p>
      </div>
    </div>
  );
};
