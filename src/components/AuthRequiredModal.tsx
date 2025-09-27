import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Lock, LogIn, UserCheck, Shield, AlertTriangle } from 'lucide-react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInClick: () => void;
  isAuthenticated: boolean;
  isCustomer: boolean;
  userRole?: string;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  onSignInClick,
  isAuthenticated,
  isCustomer,
  userRole
}) => {
  const handleSignInClick = () => {
    onClose();
    onSignInClick();
  };

  // If user is not authenticated
  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-gray-800 flex items-center justify-center gap-2">
              <Lock className="h-6 w-6 text-blue-600" />
              Sign In Required
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              You need to be signed in to create custom trips
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Main Message */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-blue-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Create Your Dream Trip!
                </h3>
                <p className="text-gray-600 text-sm">
                  Sign in to access our trip planning tools and create personalized itineraries for your Pakistan adventure.
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-800 text-sm">With an account, you can:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Create unlimited custom trips</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Plan detailed itineraries with hotels & transport</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Save and manage your trips</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Access exclusive deals and offers</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleSignInClick}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In / Create Account
              </Button>

              <Button
                variant="outline"
                onClick={onClose}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If user is authenticated but not a customer
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-gray-800 flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-amber-600" />
            Access Restricted
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Only customers can create custom trips
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning Alert */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Account Type Restriction:</strong> Your current account type does not have permission to create trips.
            </AlertDescription>
          </Alert>

          {/* User Info */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <UserCheck className="h-8 w-8 text-amber-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Customer Account Required
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Only customer accounts can create and manage custom trips. Your current role is <strong>{userRole}</strong>.
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-blue-800 text-sm">Need a customer account?</h4>
            <div className="text-sm text-blue-700">
              <p>Contact our support team or create a new customer account to start planning your trips.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onClose}
              className="w-full bg-gray-600 text-white hover:bg-gray-700"
            >
              I Understand
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredModal;