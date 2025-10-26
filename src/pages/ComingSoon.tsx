import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plane,
  Hotel,
  Car,
  MapPin,
  Calendar,
  Users,
  Mail,
  CheckCircle2,
  Sparkles,
  Mountain,
  Compass
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/layout/Footer';

export const ComingSoon: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: insertError } = await supabase
        .from('collect_email')
        .insert([{ email: email.toLowerCase() }]);

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This email is already subscribed!');
        } else {
          setError('Failed to subscribe. Please try again.');
        }
        return;
      }

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Discover Pakistan",
      description: "Explore hidden gems and popular destinations across beautiful Pakistan"
    },
    {
      icon: <Hotel className="h-8 w-8" />,
      title: "Book Hotels",
      description: "Find and book the perfect accommodation for your journey"
    },
    {
      icon: <Car className="h-8 w-8" />,
      title: "Rent Vehicles",
      description: "Travel in comfort with our verified drivers and quality vehicles"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Plan Trips",
      description: "Create custom itineraries and manage your travel plans effortlessly"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Join Community",
      description: "Connect with fellow travelers and share amazing experiences"
    },
    {
      icon: <Compass className="h-8 w-8" />,
      title: "Expert Guides",
      description: "Get local insights and recommendations from travel experts"
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 text-blue-200 opacity-20">
              <Mountain className="h-64 w-64" />
            </div>
            <div className="absolute bottom-20 right-10 text-green-200 opacity-20">
              <Plane className="h-48 w-48 transform rotate-45" />
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              {/* Logo/Brand */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-800 to-black rounded-full blur-2xl opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-black via-gray-800 to-black text-white rounded-full p-6">
                    <Sparkles className="h-16 w-16" />
                  </div>
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                  SAFAR
                </span>
                <span className="text-gray-800">PK</span>
              </h1>

              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="h-1 w-16 bg-gradient-to-r from-black via-gray-800 to-black rounded"></div>
                <Compass className="h-6 w-6 text-blue-600" />
                <div className="h-1 w-16 bg-gradient-to-r from-green-600 to-blue-600 rounded"></div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Your Journey Begins Soon
              </h2>

              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                We're crafting an extraordinary travel experience for you.
                Discover Pakistan like never before with our all-in-one travel platform.
              </p>

              {/* Coming Soon Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-black via-gray-800 to-black text-white px-6 py-3 rounded-full font-semibold mb-12">
                <Sparkles className="h-5 w-5" />
                <span>Launching Soon</span>
              </div>

              {/* Email Subscription */}
              <Card className="max-w-md mx-auto shadow-2xl border-2 border-gray-100">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Mail className="h-6 w-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Get Notified</h3>
                  </div>

                  <p className="text-gray-600 mb-6">
                    Be the first to know when we launch. Get exclusive early access!
                  </p>

                  {success ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 font-medium">
                        Thank you! We'll notify you when we launch.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSubscribe} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-blue-500"
                        />
                      </div>

                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-black via-gray-800 to-black hover:from-blue-700 hover:to-green-700 text-white font-semibold text-base"
                      >
                        {loading ? 'Subscribing...' : 'Notify Me'}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        We respect your privacy. Unsubscribe at any time.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              What's Coming Your Way
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of travel planning in Pakistan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <div className="text-blue-600">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Start Your Adventure Today
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of travelers waiting to explore Pakistan with SAFARPK
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Easy Booking</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Best Prices</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Verified Partners</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
