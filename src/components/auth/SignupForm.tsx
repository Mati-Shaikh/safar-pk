import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, CheckCircle2 } from 'lucide-react';
import { signUp, UserRole } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const { refreshAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone_number: '',
    role: UserRole.CUSTOMER as UserRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Terms and Conditions text - stored as variable
  const TERMS_TEXT = "By creating an account, you agree to our";
  const TERMS_LINK_TEXT = "Terms & Conditions";
  const TERMS_LINK_URL = "/customer/terms-and-conditions";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'email'
      ? e.target.value.toLowerCase()
      : e.target.value;

    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation - at least one of email or phone is required
    if (!formData.email && !formData.phone_number) {
      setError('Please provide either an email address or phone number');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          role: formData.role
        }
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        // Refresh auth context to update navbar
        await refreshAuth();
        // Show success dialog
        setShowSuccessDialog(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto my-4 shadow-none border-0">
      <CardHeader className="text-center px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
          Create Account
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Join SAFARPk to start your journey through Pakistan
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm sm:text-base">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base">
              Email Address {!formData.phone_number && <span className="text-red-500">*</span>}
              {formData.phone_number && <span className="text-gray-400 text-sm">(Optional)</span>}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required={!formData.phone_number}
                className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-sm sm:text-base">
              Phone Number {!formData.email && <span className="text-red-500">*</span>}
              {formData.email && <span className="text-gray-400 text-sm">(Optional)</span>}
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone_number}
                onChange={handleChange}
                required={!formData.email}
                className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
              />
            </div>
            <p className="text-xs text-gray-500">At least one contact method (email or phone) is required</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-10 pr-10 h-11 sm:h-10 text-base sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm sm:text-base">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="pl-10 pr-10 h-11 sm:h-10 text-base sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800 min-h-[44px] text-base"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Terms and Conditions Agreement */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              {TERMS_TEXT}{' '}
              <a
                href={TERMS_LINK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                {TERMS_LINK_TEXT}
              </a>
            </p>
          </div>

          <div className="text-center pt-4 space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in here
              </button>
            </p>
            <p className="text-sm text-gray-600">
              Are you a service provider?{' '}
              <a
                href="/partner"
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Register as Partner
              </a>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>

    {/* Success Dialog */}
    <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-2xl">
            Account Created Successfully!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            Welcome to SAFARPk! Your customer account has been created successfully. 
            You can now start exploring and booking amazing trips across Pakistan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction
            onClick={() => {
              setShowSuccessDialog(false);
              onSuccess();
            }}
            className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800"
          >
            Get Started
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}