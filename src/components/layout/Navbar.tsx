import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, LogOut, User, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '@/lib/supabase';
import AuthModal from '@/components/auth/AuthModal';

export const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.CUSTOMER: return 'Customer';
      case UserRole.DRIVER: return 'Driver';
      case UserRole.HOTEL_OWNER: return 'Hotel Owner';
      case UserRole.ADMIN: return 'Admin';
      default: return role;
    }
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate('/'); // Redirect to home page after logout
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-primary" />
            <Link to="/" className="text-xl font-bold">SAFARPk</Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/destinations" className="text-gray-700 hover:text-primary transition-colors">
              Destinations
            </Link>
            <Link to="/trip" className="text-gray-700 hover:text-primary transition-colors">
              My Trips
            </Link>
            {/* Show Dashboard link only for Driver, Admin, and Hotel Owner */}
            {user && profile && profile.role !== UserRole.CUSTOMER && (
              <Link to="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
            {/* <Link to="/map" className="text-gray-700 hover:text-primary transition-colors">
              Map
            </Link> */}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user && profile ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{profile.full_name}</span>
                  <span className="text-xs text-muted-foreground">({getRoleName(profile.role)})</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => openAuthModal('login')}
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openAuthModal('signup')}
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {/* Main Navigation Links - Always visible */}
              <Link 
                to="/" 
                className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/destinations" 
                className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Destinations
              </Link>
              <Link 
                to="/trip" 
                className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                My Trips
              </Link>
              {/* Show Dashboard link only for Driver, Admin, and Hotel Owner */}
              {user && profile && profile.role !== UserRole.CUSTOMER && (
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {/* <Link 
                to="/map" 
                className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Map
              </Link> */}

              {!user && (
                <>
                  {/* Auth Links for mobile */}
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        openAuthModal('login');
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start px-3 py-2 text-gray-700 hover:text-primary"
                    >
                      Login
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        openAuthModal('signup');
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start px-3 py-2 text-gray-700 hover:text-primary"
                    >
                      Sign Up
                    </Button>
                  </div>
                </>
              )}

              {user && profile ? (
                <div className="px-3 py-2 border-t border-gray-200 pt-2 mt-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{profile.full_name}</span>
                    <span className="text-xs text-muted-foreground">({getRoleName(profile.role)})</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </nav>
  );
};
