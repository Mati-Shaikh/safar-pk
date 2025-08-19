import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Heart, Camera, Car, Building, Users, Menu, X } from 'lucide-react';

const Map = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Global destinations data
  const globalDestinations = [
    {
      id: 1,
      name: 'Karachi',
      country: 'Pakistan',
      coordinates: { x: 660, y: 300 },
      price: '$45',
      rating: 4.8,
      reviews: 128,
      type: 'Entire apartment',
      host: 'Ahmed Khan',
      guests: 4,
      bedrooms: 2,
      beds: 2,
      baths: 2,
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&h=300&fit=crop'
      ],
      description: 'Modern apartment in the heart of Karachi with sea view',
      amenities: ['Entire home', 'Enhanced Clean', 'Self check-in', 'Free cancellation'],
      nearbyHotels: ['Pearl Continental Karachi', 'Movenpick Hotel Karachi', 'Beach Luxury Hotel'],
      drivers: ['Muhammad Ali - 5.0★', 'Fatima Sheikh - 4.9★', 'Hassan Raza - 4.8★'],
      tourOperators: ['Karachi Tours & Travels', 'Sindh Adventure', 'City Explorer Karachi']
    },
    {
      id: 2,
      name: 'Dubai',
      country: 'UAE',
      coordinates: { x: 640, y: 310 },
      price: '$85',
      rating: 4.9,
      reviews: 256,
      type: 'Luxury suite',
      host: 'Aisha Al-Mansoori',
      guests: 6,
      bedrooms: 3,
      beds: 3,
      baths: 3,
      images: [
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop'
      ],
      description: 'Stunning luxury suite with Burj Khalifa views in Downtown Dubai',
      amenities: ['Burj Khalifa view', 'Pool access', 'Concierge service', 'Valet parking'],
      nearbyHotels: ['Burj Al Arab', 'Atlantis The Palm', 'Emirates Palace'],
      drivers: ['Omar Hassan - 5.0★', 'Layla Ahmed - 4.9★', 'Khalid Al-Rashid - 4.8★'],
      tourOperators: ['Emirates Tours', 'Dubai Adventures', 'Desert Safari Dubai']
    },
    {
      id: 3,
      name: 'London',
      country: 'United Kingdom',
      coordinates: { x: 490, y: 180 },
      price: '$120',
      rating: 4.7,
      reviews: 189,
      type: 'Historic townhouse',
      host: 'James Wilson',
      guests: 8,
      bedrooms: 4,
      beds: 4,
      baths: 3,
      images: [
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400&h=300&fit=crop'
      ],
      description: 'Victorian townhouse in Kensington with easy access to Hyde Park',
      amenities: ['Historic charm', 'Central location', 'Garden access', 'Tube nearby'],
      nearbyHotels: ['The Savoy', 'Claridge\'s', 'The Ritz London'],
      drivers: ['William Smith - 4.8★', 'Emma Thompson - 4.9★', 'Oliver Brown - 4.7★'],
      tourOperators: ['London City Tours', 'British Heritage Walks', 'Thames River Cruises']
    },
    {
      id: 4,
      name: 'Tokyo',
      country: 'Japan',
      coordinates: { x: 850, y: 240 },
      price: '$95',
      rating: 4.9,
      reviews: 312,
      type: 'Modern apartment',
      host: 'Yuki Tanaka',
      guests: 4,
      bedrooms: 2,
      beds: 2,
      baths: 2,
      images: [
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=400&h=300&fit=crop'
      ],
      description: 'Ultra-modern apartment in Shibuya with skyline views',
      amenities: ['City view', 'High-tech features', 'Metro access', 'Roof terrace'],
      nearbyHotels: ['Park Hyatt Tokyo', 'Mandarin Oriental', 'Aman Tokyo'],
      drivers: ['Hiroshi Yamamoto - 5.0★', 'Akiko Sato - 4.8★', 'Kenji Nakamura - 4.9★'],
      tourOperators: ['Tokyo City Adventures', 'Cultural Japan Tours', 'Mount Fuji Expeditions']
    },
    {
      id: 5,
      name: 'New York',
      country: 'United States',
      coordinates: { x: 280, y: 220 },
      price: '$150',
      rating: 4.6,
      reviews: 425,
      type: 'Manhattan loft',
      host: 'Sarah Johnson',
      guests: 6,
      bedrooms: 3,
      beds: 3,
      baths: 2,
      images: [
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1548610325-5d5c149e2e66?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=400&h=300&fit=crop'
      ],
      description: 'Spacious loft in SoHo with exposed brick and modern amenities',
      amenities: ['Loft style', 'Prime location', 'High ceilings', 'Subway access'],
      nearbyHotels: ['The Plaza', 'St. Regis New York', 'The Carlyle'],
      drivers: ['Mike Rodriguez - 4.7★', 'Jessica Chen - 4.9★', 'David Kim - 4.6★'],
      tourOperators: ['Big Apple Tours', 'NYC Adventures', 'Broadway Experience']
    },
    {
      id: 6,
      name: 'Istanbul',
      country: 'Turkey',
      coordinates: { x: 570, y: 240 },
      price: '$65',
      rating: 4.8,
      reviews: 167,
      type: 'Ottoman house',
      host: 'Mehmet Özkan',
      guests: 5,
      bedrooms: 3,
      beds: 3,
      baths: 2,
      images: [
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop'
      ],
      description: 'Traditional Ottoman house in historic Sultanahmet district',
      amenities: ['Historic location', 'Bosphorus views', 'Traditional decor', 'Walking distance'],
      nearbyHotels: ['Four Seasons Istanbul', 'Pera Palace', 'Ciragan Palace'],
      drivers: ['Ahmet Yılmaz - 4.8★', 'Fatma Demir - 4.9★', 'Can Türk - 4.7★'],
      tourOperators: ['Istanbul Heritage Tours', 'Bosphorus Cruises', 'Turkish Delights Tours']
    }
  ];

  const handleCityClick = (destination) => {
    setSelectedCity(destination);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const foundDestination = globalDestinations.find(dest => 
      dest.name.toLowerCase().includes(query.toLowerCase()) ||
      dest.country.toLowerCase().includes(query.toLowerCase())
    );
    if (foundDestination) {
      handleCityClick(foundDestination);
    }
  };

  const filteredDestinations = globalDestinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const DestinationCard = ({ destination }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-4">
      {/* Image Gallery */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-1 h-48 md:h-64">
          <div className="col-span-2 relative">
            <img 
              src={destination.images[0]} 
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-rows-2 gap-1">
            <img 
              src={destination.images[1]} 
              alt={`${destination.name} view 2`}
              className="w-full h-full object-cover"
            />
            <div className="relative">
              <img 
                src={destination.images[2]} 
                alt={`${destination.name} view 3`}
                className="w-full h-full object-cover"
              />
              <button className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white font-medium hover:bg-opacity-40 transition-all text-xs md:text-sm">
                <Camera className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Show all photos
              </button>
            </div>
          </div>
        </div>
        <button className="absolute top-2 md:top-3 right-2 md:right-3 p-1.5 md:p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
          <Heart className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
              {destination.name}, {destination.country}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 mb-1">{destination.type} hosted by {destination.host}</p>
            <p className="text-xs text-gray-500">{destination.guests} guests • {destination.bedrooms} bedroom • {destination.beds} bed • {destination.baths} bath</p>
          </div>
          <div className="flex items-center ml-4">
            <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-xs md:text-sm font-medium">{destination.rating}</span>
            <span className="ml-1 text-xs text-gray-500">({destination.reviews})</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-2 md:space-y-3 mb-4">
          {destination.amenities.slice(0, 3).map((amenity, index) => (
            <div key={index} className="flex items-center text-xs md:text-sm text-gray-700">
              <div className="w-4 h-4 md:w-6 md:h-6 mr-2 md:mr-3 flex items-center justify-center">
                {index === 0 && <Building className="w-3 h-3 md:w-4 md:h-4" />}
                {index === 1 && <MapPin className="w-3 h-3 md:w-4 md:h-4" />}
                {index === 2 && <Users className="w-3 h-3 md:w-4 md:h-4" />}
              </div>
              {amenity}
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs md:text-sm text-gray-700 mb-4">{destination.description}</p>

        {/* Services - Collapsible on mobile */}
        <div className="grid grid-cols-1 gap-3 md:gap-4 mb-4">
          {/* Nearby Hotels */}
          <div>
            <h4 className="font-medium text-xs md:text-sm text-gray-900 mb-1 md:mb-2 flex items-center">
              <Building className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Nearby Hotels
            </h4>
            <div className="space-y-0.5 md:space-y-1">
              {destination.nearbyHotels.slice(0, 2).map((hotel, index) => (
                <p key={index} className="text-xs text-gray-600">• {hotel}</p>
              ))}
            </div>
          </div>

          {/* Drivers & Tour Operators - Side by side on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <h4 className="font-medium text-xs md:text-sm text-gray-900 mb-1 md:mb-2 flex items-center">
                <Car className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Drivers
              </h4>
              <div className="space-y-0.5 md:space-y-1">
                {destination.drivers.slice(0, 2).map((driver, index) => (
                  <p key={index} className="text-xs text-gray-600">• {driver}</p>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-xs md:text-sm text-gray-900 mb-1 md:mb-2 flex items-center">
                <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Tour Operators
              </h4>
              <div className="space-y-0.5 md:space-y-1">
                {destination.tourOperators.slice(0, 1).map((operator, index) => (
                  <p key={index} className="text-xs text-gray-600">• {operator}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Booking */}
        <div className="border-t pt-3 md:pt-4">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div>
              <span className="text-base md:text-lg font-semibold">{destination.price}</span>
              <span className="text-gray-600 text-xs md:text-sm"> / night</span>
            </div>
            <div className="text-xs text-gray-500">You won't be charged yet</div>
          </div>
          
          <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-2.5 md:py-3 px-4 md:px-6 rounded-lg transition-colors duration-200 text-sm md:text-base">
            Reserve
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 right-4 z-50 bg-white p-2 rounded-full shadow-lg md:hidden"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Map Section - 50% width on desktop, full height on mobile when menu closed */}
      <div className={`${isMobile && isMobileMenuOpen ? 'hidden' : 'flex-1'} md:w-1/2 relative`}>
        {/* Search Bar */}
        <div className="absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 z-10">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Search destinations worldwide..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 bg-white rounded-full shadow-lg border-0 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* World Map Container */}
        <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute w-96 h-96 rounded-full bg-white blur-3xl -top-48 -left-48 animate-pulse"></div>
            <div className="absolute w-64 h-64 rounded-full bg-rose-300 blur-3xl top-32 right-32 animate-pulse delay-1000"></div>
            <div className="absolute w-48 h-48 rounded-full bg-yellow-300 blur-3xl bottom-48 left-64 animate-pulse delay-2000"></div>
          </div>

          {/* Gildleaf Style World Map SVG */}
          <svg viewBox="0 0 1000 500" className="w-full h-full relative z-10">
            <defs>
              <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:"rgba(255,255,255,0.2)", stopOpacity:1}} />
                <stop offset="50%" style={{stopColor:"rgba(255,255,255,0.15)", stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:"rgba(255,255,255,0.1)", stopOpacity:1}} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* North America */}
            <path
              d="M50 120 Q80 100 120 110 L160 100 Q200 105 240 120 L280 140 Q300 160 290 180 L270 200 Q250 220 220 210 L180 220 Q150 215 120 200 L80 180 Q60 160 50 140 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              filter="url(#glow)"
            />
            
            {/* Greenland */}
            <path
              d="M320 80 Q340 75 360 85 L380 100 Q370 120 350 115 L330 110 Q315 95 320 80 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />

            {/* South America */}
            <path
              d="M180 260 Q200 250 220 255 L250 265 Q270 280 275 310 L280 350 Q275 380 260 400 L240 420 Q220 415 200 405 L180 385 Q170 360 175 330 L170 300 Q175 280 180 260 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              filter="url(#glow)"
            />
            
            {/* Europe */}
            <path
              d="M450 130 Q480 125 510 135 L540 145 Q570 150 580 170 L575 185 Q565 195 540 190 L515 185 Q485 180 460 175 L440 165 Q435 150 450 130 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              filter="url(#glow)"
            />

            {/* Scandinavia */}
            <path
              d="M480 90 Q500 85 520 95 L540 110 Q535 125 515 120 L495 115 Q475 105 480 90 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />
            
            {/* Africa */}
            <path
              d="M480 200 Q510 195 540 205 L570 220 Q590 245 595 280 L600 320 Q595 360 580 385 L560 405 Q535 410 510 400 L485 385 Q470 360 475 330 L470 290 Q475 250 480 200 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              filter="url(#glow)"
            />

            {/* Madagascar */}
            <path
              d="M620 350 Q635 345 640 360 L645 380 Q640 395 625 390 L615 375 Q612 360 620 350 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />
            
            {/* Asia - Russia/Siberia */}
            <path
              d="M600 110 Q650 105 700 115 L750 125 Q800 130 850 140 L880 155 Q890 175 875 190 L850 200 Q800 195 750 185 L700 175 Q650 170 620 165 L590 155 Q585 135 600 110 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              filter="url(#glow)"
            />

            {/* Middle East */}
            <path
              d="M580 200 Q610 195 640 205 L670 220 Q685 240 675 255 L650 265 Q620 260 595 250 L575 235 Q570 220 580 200 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
            />

            {/* India */}
            <path
              d="M680 250 Q710 245 730 260 L750 285 Q745 310 725 320 L700 325 Q680 320 670 305 L665 285 Q670 265 680 250 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
            />

            {/* China */}
            <path
              d="M750 200 Q790 195 820 210 L850 230 Q860 250 845 265 L815 275 Q785 270 760 255 L740 240 Q735 220 750 200 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
            />

            {/* Southeast Asia */}
            <path
              d="M780 280 Q810 275 830 290 L845 310 Q840 325 820 330 L800 325 Q785 315 775 300 Q770 290 780 280 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
            />

            {/* Japan */}
            <path
              d="M860 240 Q875 235 885 245 L890 260 Q885 270 870 265 L855 255 Q850 245 860 240 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />
            
            {/* Australia */}
            <path
              d="M750 360 Q790 355 830 365 L860 380 Q870 395 855 405 L825 410 Q785 405 760 395 L740 385 Q735 370 750 360 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              filter="url(#glow)"
            />

            {/* New Zealand */}
            <path
              d="M880 400 Q890 395 895 405 L900 420 Q895 430 885 425 L875 415 Q870 405 880 400 Z"
              fill="url(#landGradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />

            {/* Ocean wave patterns */}
            <g opacity="0.1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none">
              <path d="M0 450 Q250 440 500 450 T1000 450" />
              <path d="M0 460 Q250 450 500 460 T1000 460" />
              <path d="M0 470 Q250 460 500 470 T1000 470" />
            </g>

            {/* City Markers with Enhanced Styling */}
            {globalDestinations.map((destination) => (
              <g key={destination.id}>
                {/* Glow effect for selected city */}
                {selectedCity?.id === destination.id && (
                  <circle
                    cx={destination.coordinates.x}
                    cy={destination.coordinates.y}
                    r="15"
                    fill="rgba(239, 68, 68, 0.3)"
                    className="animate-pulse"
                  />
                )}
                
                {/* Main marker */}
                <circle
                  cx={destination.coordinates.x}
                  cy={destination.coordinates.y}
                  r={selectedCity?.id === destination.id ? "10" : "7"}
                  fill={selectedCity?.id === destination.id ? "#ef4444" : "#ffffff"}
                  stroke={selectedCity?.id === destination.id ? "#ffffff" : "#ef4444"}
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all duration-300 hover:r-10 drop-shadow-lg"
                  onClick={() => handleCityClick(destination)}
                  filter="url(#glow)"
                />
                
                {/* Inner dot */}
                <circle
                  cx={destination.coordinates.x}
                  cy={destination.coordinates.y}
                  r="3"
                  fill={selectedCity?.id === destination.id ? "#ffffff" : "#ef4444"}
                  className="pointer-events-none"
                />
                
                {/* City name label with background */}
                <g>
                  <rect
                    x={destination.coordinates.x - 25}
                    y={destination.coordinates.y - 25}
                    width="50"
                    height="12"
                    rx="6"
                    fill="rgba(0,0,0,0.7)"
                    className="pointer-events-none"
                  />
                  <text
                    x={destination.coordinates.x}
                    y={destination.coordinates.y - 17}
                    textAnchor="middle"
                    className="fill-white text-xs font-medium pointer-events-none"
                    style={{ fontSize: isMobile ? '10px' : '11px' }}
                  >
                    {destination.name}
                  </text>
                </g>
                
                {/* Price label */}
                <g>
                  <rect
                    x={destination.coordinates.x - 18}
                    y={destination.coordinates.y + 15}
                    width="36"
                    height="14"
                    rx="7"
                    fill="rgba(239, 68, 68, 0.9)"
                    className="pointer-events-none"
                  />
                  <text
                    x={destination.coordinates.x}
                    y={destination.coordinates.y + 25}
                    textAnchor="middle"
                    className="fill-white text-xs font-semibold pointer-events-none"
                    style={{ fontSize: isMobile ? '9px' : '10px' }}
                  >
                    {destination.price}
                  </text>
                </g>
                
                {/* Connection lines for selected city */}
                {selectedCity?.id === destination.id && (
                  <g opacity="0.6">
                    <line
                      x1={destination.coordinates.x}
                      y1={destination.coordinates.y}
                      x2={destination.coordinates.x + 50}
                      y2={destination.coordinates.y - 50}
                      stroke="rgba(239, 68, 68, 0.8)"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      className="animate-pulse"
                    />
                    <circle
                      cx={destination.coordinates.x + 50}
                      cy={destination.coordinates.y - 50}
                      r="3"
                      fill="rgba(239, 68, 68, 0.8)"
                      className="animate-bounce"
                    />
                  </g>
                )}
              </g>
            ))}

            {/* Grid lines for professional look */}
            <g opacity="0.1" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5">
              {/* Longitude lines */}
              <line x1="200" y1="0" x2="200" y2="500" />
              <line x1="400" y1="0" x2="400" y2="500" />
              <line x1="600" y1="0" x2="600" y2="500" />
              <line x1="800" y1="0" x2="800" y2="500" />
              
              {/* Latitude lines */}
              <line x1="0" y1="125" x2="1000" y2="125" />
              <line x1="0" y1="250" x2="1000" y2="250" />
              <line x1="0" y1="375" x2="1000" y2="375" />
            </g>

            {/* Equator line */}
            <line
              x1="0" y1="250" x2="1000" y2="250"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              strokeDasharray="8,8"
              opacity="0.5"
            />

            {/* Tropic lines */}
            <line
              x1="0" y1="200" x2="1000" y2="200"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
              strokeDasharray="4,4"
              opacity="0.3"
            />
            <line
              x1="0" y1="300" x2="1000" y2="300"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
              strokeDasharray="4,4"
              opacity="0.3"
            />
          </svg>

          {/* Enhanced Map Legend */}
          <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 md:p-5 shadow-2xl border border-white/20">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm md:text-base text-gray-900">SafarPK Global</h4>
                <p className="text-xs text-gray-600">Discover Amazing Destinations</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-3 h-3 bg-rose-500 rounded-full mr-2 shadow-lg"></div>
                Premium Locations
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-3 h-3 bg-white border-2 border-rose-500 rounded-full mr-2"></div>
                Available Destinations
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-4 h-0.5 bg-rose-500 mr-2 opacity-60"></div>
                Connection Routes
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">Click any destination to explore</p>
            </div>
          </div>

          {/* Compass */}
          <div className="absolute top-20 md:top-24 right-4 md:right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-rose-500"></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">N</span>
            </div>
          </div>

          {/* Flight paths animation for visual appeal */}
          {selectedCity && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                 refX="0" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="rgba(239, 68, 68, 0.6)" />
                </marker>
              </defs>
              {globalDestinations
                .filter(dest => dest.id !== selectedCity.id)
                .slice(0, 2)
                .map((dest, index) => (
                <line
                  key={dest.id}
                  x1={selectedCity.coordinates.x}
                  y1={selectedCity.coordinates.y}
                  x2={dest.coordinates.x}
                  y2={dest.coordinates.y}
                  stroke="rgba(239, 68, 68, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  markerEnd="url(#arrowhead)"
                  className="animate-pulse"
                  style={{ animationDelay: `${index * 0.5}s` }}
                />
              ))}
            </svg>
          )}
        </div>
      </div>

      {/* Destinations Panel - 50% width on desktop, overlay on mobile */}
      <div className={`
        ${isMobile 
          ? `fixed inset-0 z-40 bg-white transform transition-transform duration-300 ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`
          : 'w-1/2'
        } 
        shadow-xl overflow-y-auto
      `}>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                {selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : 'Discover the World'}
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                {selectedCity 
                  ? `Explore accommodations and services in ${selectedCity.name}`
                  : 'Click on any destination on the map to explore'
                }
              </p>
            </div>
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Destination Cards */}
          {selectedCity ? (
            <DestinationCard destination={selectedCity} />
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredDestinations.slice(0, 3).map((destination) => (
                <div 
                  key={destination.id} 
                  className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => handleCityClick(destination)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm md:text-base text-gray-900">{destination.name}</h3>
                      <p className="text-xs md:text-sm text-gray-600">{destination.country} • {destination.type}</p>
                      <div className="flex items-center mt-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="ml-1 text-xs text-gray-600">{destination.rating} ({destination.reviews} reviews)</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-sm md:text-base text-gray-900">{destination.price}</p>
                      <p className="text-xs text-gray-600">per night</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {!selectedCity && filteredDestinations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm md:text-base">No destinations found</p>
                  <p className="text-xs md:text-sm">Try searching for a different location</p>
                </div>
              )}
              
              {!selectedCity && filteredDestinations.length > 0 && (
                <div className="text-center py-6 md:py-8 text-gray-500">
                  <MapPin className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm md:text-base">Select a destination from the map to view details</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay backdrop */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Map;