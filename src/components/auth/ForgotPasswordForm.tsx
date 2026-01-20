import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetEmail, checkResetRateLimit } from '@/lib/supabase';

interface ForgotPasswordFormProps {
  onBack: () => void;
  userType?: 'customer' | 'partner';
}

export default function ForgotPasswordForm({ onBack, userType = 'customer' }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Check rate limiting
    if (!checkResetRateLimit(email)) {
      setError('Too many reset attempts. Please try again in 15 minutes.');
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await sendPasswordResetEmail(email, userType);

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-none border-0">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            We've sent password reset instructions to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-gray-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Click the link in the email to reset your password</li>
                  <li>The link will expire in 1 hour for security</li>
                  <li>Check your spam folder if you don't see it</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              onClick={onBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-none border-0">
      <CardHeader className="text-center px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
          Reset Password
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Enter your email address and we'll send you instructions to reset your password
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
            <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
                className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800 min-h-[44px] text-base"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
