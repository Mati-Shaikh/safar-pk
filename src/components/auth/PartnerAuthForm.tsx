import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, Phone, Briefcase, UserCircle, CheckCircle2 } from 'lucide-react';
import { signUp, signIn, UserRole } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export default function PartnerAuthForm() {
  const { refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');

  // Signup state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone_number: '',
    role: '' as UserRole
  });

  // Login state
  const [loginData, setLoginData] = useState({
    emailOrPhone: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'email'
      ? e.target.value.toLowerCase()
      : e.target.value;

    setSignupData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleChange = (value: string) => {
    setSignupData(prev => ({
      ...prev,
      role: value as UserRole
    }));
  };


  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!signupData.email && !signupData.phone_number) {
      setError('Please provide either an email address or phone number');
      setLoading(false);
      return;
    }

    if (!signupData.role) {
      setError('Please select your partner type');
      setLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await signUp(
        signupData.email,
        signupData.password,
        {
          full_name: signupData.full_name,
          phone_number: signupData.phone_number,
          role: signupData.role
        }
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        // Show success message
        setSuccessMessage('You have been successfully registered as a partner! Please login to continue your work.');

        // Clear form
        setSignupData({
          email: '',
          password: '',
          confirmPassword: '',
          full_name: '',
          phone_number: '',
          role: '' as UserRole
        });

        // Switch to login mode after a brief delay
        setTimeout(() => {
          setMode('login');
          setSuccessMessage('');
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await signIn(loginData.emailOrPhone, loginData.password);

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        await refreshAuth();
        // Get user profile to determine role
        const profile = JSON.parse(localStorage.getItem('safar_profile') || '{}');
        const role = profile.role as UserRole;

        // Check if user is actually a partner
        if (role === UserRole.CUSTOMER) {
          setError('This login is for partners only. Please use the customer login.');
          return;
        }

        // Redirect to dashboard (will show correct dashboard based on role)
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Briefcase className="h-6 w-6" />
            {mode === 'login' ? 'Partner Sign In' : 'Partner Registration'}
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Sign in to manage your services'
              : 'Join SAFARPk as a service provider'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'signup' ? (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.full_name}
                    onChange={handleSignupChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address {!signupData.phone_number && <span className="text-red-500">*</span>}
                  {signupData.phone_number && <span className="text-gray-400 text-sm">(Optional)</span>}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    required={!signupData.phone_number}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">
                  Phone Number {!signupData.email && <span className="text-red-500">*</span>}
                  {signupData.email && <span className="text-gray-400 text-sm">(Optional)</span>}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={signupData.phone_number}
                    onChange={handleSignupChange}
                    required={!signupData.email}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">At least one contact method (email or phone) is required</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Partner Type <span className="text-red-500">*</span>
                </Label>
                <Select value={signupData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your partner type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.HOTEL_OWNER}>Hotel Owner</SelectItem>
                    <SelectItem value={UserRole.DRIVER}>Driver</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    required
                    className="pl-10 pr-10"
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
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
              >
                {loading ? 'Creating Account...' : 'Register as Partner'}
              </Button>

              <div className="text-center pt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  Already have a partner account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
                <p className="text-sm text-gray-600">
                  Looking for customer registration?{' '}
                  <a
                    href="/"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Go to customer signup
                  </a>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="emailOrPhone">Email Address or Phone Number</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="emailOrPhone"
                    name="emailOrPhone"
                    type="text"
                    placeholder="Enter your email or phone number"
                    value={loginData.emailOrPhone}
                    onChange={handleLoginChange}
                    required
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">You can sign in with either your email or phone number</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    className="pl-10 pr-10"
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <div className="text-center pt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  Don't have a partner account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    Register here
                  </button>
                </p>
                <p className="text-sm text-gray-600">
                  Looking for customer login?{' '}
                  <a
                    href="/"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Go to customer login
                  </a>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
