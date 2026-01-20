import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, LogIn, UserCircle } from 'lucide-react';
import { signIn } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignup, onSwitchToForgotPassword }: LoginFormProps) {
  const { refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await signIn(formData.emailOrPhone, formData.password);

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        // Refresh auth context to update navbar
        await refreshAuth();
        onSuccess();
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-none border-0">
      <CardHeader className="text-center px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <LogIn className="h-5 w-5 sm:h-6 sm:w-6" />
          Sign In
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Welcome back! Please enter your credentials to access your account.
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
            <Label htmlFor="emailOrPhone" className="text-sm sm:text-base">Email Address or Phone Number</Label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="emailOrPhone"
                name="emailOrPhone"
                type="text"
                placeholder="Enter your email or phone number"
                value={formData.emailOrPhone}
                onChange={handleChange}
                required
                className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
              />
            </div>
            <p className="text-xs text-gray-500">You can sign in with either your email or phone number</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-10 pr-10 h-11 sm:h-10 text-base sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            {onSwitchToForgotPassword && (
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Forgot password?
              </button>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800 min-h-[44px] text-base"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="text-center pt-4 space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up here
              </button>
            </p>
            <p className="text-sm text-gray-600">
              Are you a service provider?{' '}
              <a
                href="/partner"
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Partner Login
              </a>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}