import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, LogOut, User, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/lib/supabase';
import AuthModal from '@/components/auth/AuthModal';

export const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const getNavLinkClass = (path: string, isMobile = false) => {
    const isActive = location.pathname === path;
    const baseClass = isMobile
      ? "block px-3 py-2 transition-all duration-200"
      : "transition-all duration-200 px-3 py-2 rounded-md border-2";

    if (isActive) {
      return `${baseClass} text-primary border-primary bg-primary/5 font-medium`;
    }

    return `${baseClass} text-gray-700 hover:text-primary hover:border-primary/50 hover:bg-primary/5 border-transparent`;
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <Link to="/" className="text-lg sm:text-xl font-bold">SAFARPk</Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className={getNavLinkClass("/")}>
              Home
            </Link>
            <Link to="/destinations" className={getNavLinkClass("/destinations")}>
              Destinations
            </Link>
            {/* Hide My Trips for customers - they see Coming Soon page instead */}
            {/* {(!user || !profile || profile.role !== UserRole.CUSTOMER) && (
              <Link to="/trip" className={getNavLinkClass("/trip")}>
                My Trips
              </Link>
            )} */}
            {/* Show Dashboard link for all logged in users */}
            {user && profile && (
              <Link to="/dashboard" className={getNavLinkClass("/dashboard")}>
                Dashboard
              </Link>
            )}
            {/* <Link to="/map" className={getNavLinkClass("/map")}>
              Map
            </Link> */}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {user && profile ? (
              <div className="flex items-center space-x-2 lg:space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm lg:text-base">{profile.full_name}</span>
                  <span className="text-xs text-muted-foreground">({getRoleName(profile.role)})</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 lg:space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuthModal('login')}
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              {/* Main Navigation Links - Always visible */}
              <Link
                to="/"
                className={getNavLinkClass("/", true)}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/destinations"
                className={getNavLinkClass("/destinations", true)}
                onClick={() => setIsMenuOpen(false)}
              >
                Destinations
              </Link>
              {/* Show Dashboard link for all logged in users */}
              {user && profile && (
                <Link
                  to="/dashboard"
                  className={getNavLinkClass("/dashboard", true)}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              {!user && (
                <>
                  {/* Auth Links for mobile */}
                  <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        openAuthModal('login');
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start px-3 py-2.5 text-base text-gray-700 hover:text-primary hover:bg-primary/5"
                    >
                      Login
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        openAuthModal('signup');
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start px-3 py-2.5 text-base text-gray-700 hover:text-primary hover:bg-primary/5"
                    >
                      Sign Up
                    </Button>
                  </div>
                </>
              )}

              {user && profile ? (
                <div className="px-3 py-3 border-t border-gray-200 mt-3 space-y-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">{profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">{getRoleName(profile.role)}</p>
                    </div>
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
