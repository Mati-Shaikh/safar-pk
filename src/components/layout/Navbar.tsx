import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, LogOut, User, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getRoleName = (role: string) => {
    switch (role) {
      case 'customer': return 'Customer';
      case 'driver': return 'Driver';
      case 'hotel': return 'Hotel Owner';
      case 'admin': return 'Admin';
      default: return role;
    }
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
            {!user && (
              <>
                <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
                  Home
                </Link>
                <Link to="/destinations" className="text-gray-700 hover:text-primary transition-colors">
                  Destinations
                </Link>
                <Link to="/trip" className="text-gray-700 hover:text-primary transition-colors">
                  My Trips
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.name}</span>
                  <span className="text-xs text-muted-foreground">({getRoleName(user.role)})</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-8">
                <Link to="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {!user && (
                <>
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
                    Trip
                  </Link>
                </>
              )}
              
              {user ? (
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.name}</span>
                    <span className="text-xs text-muted-foreground">({getRoleName(user.role)})</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};