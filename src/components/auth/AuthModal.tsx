import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup' | 'forgot-password';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(defaultMode);

  // Update mode when defaultMode prop changes
  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  const handleSuccess = () => {
    onClose();
    // Optionally refresh the page or update app state
    window.location.reload();
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  const handleSwitchToForgotPassword = () => {
    setMode('forgot-password');
  };

  const handleBackToLogin = () => {
    setMode('login');
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'forgot-password':
        return 'Reset Password';
      case 'signup':
        return 'Create Account';
      default:
        return 'Sign In';
    }
  };

  const getDialogDescription = () => {
    switch (mode) {
      case 'forgot-password':
        return 'Enter your email to reset your password';
      case 'signup':
        return 'Create a new account to get started';
      default:
        return 'Sign in to your account to continue';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md p-0 gap-0 max-h-[95vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToSignup={handleSwitchMode}
              onSwitchToForgotPassword={handleSwitchToForgotPassword}
            />
          ) : mode === 'signup' ? (
            <SignupForm
              onSuccess={handleSuccess}
              onSwitchToLogin={handleSwitchMode}
            />
          ) : (
            <ForgotPasswordForm
              onBack={handleBackToLogin}
              userType="customer"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}