import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-black via-gray-800 to-black text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Company Info */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white">SafarPk</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Your ultimate guide to exploring the breathtaking beauty and rich culture of Pakistan.
            We help you craft unforgettable journeys tailored to your dreams.
          </p>
          <div className="flex space-x-3 sm:space-x-4">
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><Facebook size={18} /></a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><Twitter size={18} /></a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><Instagram size={18} /></a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><Linkedin size={18} /></a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Contact Us</h3>
          <div className="flex items-start text-gray-300 text-sm sm:text-base">
            <MapPin size={16} className="mr-2 mt-1 flex-shrink-0" />
            <span>SafarPK, Main Kachura Bazaar, Skardu, GB, Pakistan</span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700 text-center text-gray-400 text-xs sm:text-sm px-4">
        &copy; {new Date().getFullYear()} SafarPk. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
