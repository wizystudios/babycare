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
import { motion, AnimatePresence } from 'framer-motion';

interface MultiStepRegisterFormProps {
  showRoleSelection?: boolean;
}

export const MultiStepRegisterForm: React.FC<MultiStepRegisterFormProps> = ({ showRoleSelection = true }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const { toast } = useToast();
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const userData = {
        role: role
      };

      const { error } = await signUp(email, password, userData);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Registration successful!",
        variant: "default"
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = "Registration failed";
      
      if (error.message) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          errorMessage = "Email is already registered";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Please enter a valid email address";
        } else if (error.message.includes('Password') || error.message.includes('password')) {
          errorMessage = "Password requirements not met";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Please check your email and click the confirmation link";
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-1.5"
        >
          <Label htmlFor="email" className="text-xs">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="example@email.com" 
            value={email} 
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value && step < 2) setStep(2);
            }}
            className="h-8 text-xs"
            required
          />
        </motion.div>

        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1.5"
          >
            <Label htmlFor="password" className="text-xs">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="At least 6 characters"
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value && step < 3) setStep(3);
              }}
              className="h-8 text-xs"
              required
            />
          </motion.div>
        )}
        
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1.5"
          >
            <Label htmlFor="confirmPassword" className="text-xs">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="Confirm your password"
              value={confirmPassword} 
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (e.target.value && step < 4 && showRoleSelection) setStep(4);
              }}
              className="h-8 text-xs"
              required
            />
          </motion.div>
        )}
        
        {step >= 4 && showRoleSelection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1.5"
          >
            <Label htmlFor="role" className="text-xs">I am a...</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent" className="text-xs">Parent/Caregiver</SelectItem>
                <SelectItem value="doctor" className="text-xs">Doctor</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>

      {(step >= 4 || (step >= 3 && !showRoleSelection)) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full h-8 text-xs"
          >
            {isLoading ? (
              <>
                <Loader size="small" className="mr-1.5" />
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </motion.div>
      )}
    </form>
  );
};