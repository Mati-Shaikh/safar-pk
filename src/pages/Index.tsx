import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Users, Calendar, ArrowRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/layout/Footer';

const destinations = [
  {
    id: 1,
    name: 'Hunza Valley',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    description: 'The stunning valley known for its breathtaking mountain views and rich culture.',
    rating: 4.8,
    reviews: 1247,
    price: 'From $299',
    duration: '3-5 days'
  },
  {
    id: 2,
    name: 'Swat Valley',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    description: 'The Switzerland of Pakistan with lush green valleys and pristine lakes.',
    rating: 4.6,
    reviews: 892,
    price: 'From $199',
    duration: '2-4 days'
  },
  {
    id: 3,
    name: 'Skardu',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    description: 'Gateway to the world\'s highest peaks and crystal clear lakes.',
    rating: 4.9,
    reviews: 1563,
    price: 'From $399',
    duration: '4-7 days'
  },
  {
    id: 4,
    name: 'Naran Kaghan',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    description: 'Paradise on earth with snow-capped peaks and alpine meadows.',
    rating: 4.7,
    reviews: 1034,
    price: 'From $249',
    duration: '3-6 days'
  }
];

const testimonials = [
  {
    id: 1,
    name: 'Ahmed Khan',
    role: 'Travel Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    content: 'SafarPk made my trip to Hunza absolutely unforgettable. The local guides were knowledgeable and the accommodations were perfect.',
    rating: 5
  },
  {
    id: 2,
    name: 'Fatima Ali',
    role: 'Photographer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    content: 'As a photographer, I was amazed by the stunning locations SafarPk took us to. The Swat Valley tour was beyond my expectations.',
    rating: 5
  },
  {
    id: 3,
    name: 'Usman Malik',
    role: 'Adventure Seeker',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: 'The Skardu expedition was the adventure of a lifetime. Professional service and unforgettable memories.',
    rating: 5
  }
];

const stats = [
  { number: '10,000+', label: 'Happy Travelers' },
  { number: '50+', label: 'Destinations' },
  { number: '4.8', label: 'Average Rating' },
  { number: '24/7', label: 'Support' }
];

const Index = () => {
  return (
    <>
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] sm:h-[80vh] lg:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470756544705-1848092fbe5f?q=80&w=2878&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center"></div>
        <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            Discover Pakistan's
            <span className="block text-yellow-400">Hidden Gems</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-200 leading-relaxed px-2">
            Experience the beauty of Pakistan's most stunning destinations with our expert guides
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Link to="/destinations" className="w-full sm:w-auto">
              <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-300 text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto min-h-[44px]">
                Explore Destinations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Popular Destinations</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Explore Pakistan's most breathtaking locations with our carefully curated tours
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {destinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-44 sm:h-48 overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/90 text-black text-xs sm:text-sm">
                    {destination.price}
                  </Badge>
                </div>
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl">{destination.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm line-clamp-2">{destination.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-4 sm:px-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs sm:text-sm font-medium">{destination.rating}</span>
                      <span className="text-xs sm:text-sm text-gray-500">({destination.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{destination.duration}</span>
                    </div>
                  </div>
                  <Link to="/destinations">
                    <Button className="w-full min-h-[40px] sm:min-h-[36px] text-sm sm:text-base" variant="outline">
                      View Details
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">What Our Travelers Say</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="relative">
                <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base">{testimonial.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic text-sm sm:text-base">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

     
    </div>
    <Footer />
    </>
  );
};

export default Index;
