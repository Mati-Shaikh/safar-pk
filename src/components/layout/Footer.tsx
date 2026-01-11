import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-black via-gray-800 to-black text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Company Info */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white">SafarPk</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Your ultimate guide to exploring the breathtaking beauty and rich culture of Pakistan.
            We craft unforgettable journeys tailored to your dreams.
          </p>
          <div className="flex space-x-3 sm:space-x-4">
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><Facebook size={18} /></a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><Twitter size={18} /></a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><Instagram size={18} /></a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><Linkedin size={18} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Home</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Destinations</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Plan Your Trip</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">About Us</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Contact Us</h3>
          <ul className="space-y-2">
            <li className="flex items-start text-gray-300 text-sm sm:text-base">
              <MapPin size={16} className="mr-2 mt-1 flex-shrink-0" />
              <span>123 Travel Street, Islamabad, Pakistan</span>
            </li>
            <li className="flex items-center text-gray-300 text-sm sm:text-base">
              <Phone size={16} className="mr-2 flex-shrink-0" />
              <span>+92 300 1234567</span>
            </li>
            <li className="flex items-center text-gray-300 text-sm sm:text-base break-all">
              <Mail size={16} className="mr-2 flex-shrink-0" />
              <span>info@safarpk.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Newsletter</h3>
          <p className="text-gray-300 text-sm">Stay updated with our latest tours and offers.</p>
          <form className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="p-2 sm:p-2.5 rounded-md bg-gray-700 text-white text-sm border border-gray-600 focus:outline-none focus:border-white"
            />
            <button
              type="submit"
              className="bg-white text-black py-2 sm:py-2.5 px-4 rounded-md hover:bg-gray-200 transition-colors font-semibold text-sm sm:text-base"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700 text-center text-gray-400 text-xs sm:text-sm px-4">
        &copy; {new Date().getFullYear()} SafarPk. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
