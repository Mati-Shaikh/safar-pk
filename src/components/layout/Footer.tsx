import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-black via-gray-800 to-black text-white py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">SafarPk</h3>
          <p className="text-gray-300 text-sm">
            Your ultimate guide to exploring the breathtaking beauty and rich culture of Pakistan.
            We craft unforgettable journeys tailored to your dreams.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><Facebook size={20} /></a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Destinations</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Plan Your Trip</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Contact Us</h3>
          <ul className="space-y-2">
            <li className="flex items-center text-gray-300">
              <MapPin size={16} className="mr-2" />
              123 Travel Street, Islamabad, Pakistan
            </li>
            <li className="flex items-center text-gray-300">
              <Phone size={16} className="mr-2" />
              +92 300 1234567
            </li>
            <li className="flex items-center text-gray-300">
              <Mail size={16} className="mr-2" />
              info@safarpk.com
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Newsletter</h3>
          <p className="text-gray-300 text-sm">Stay updated with our latest tours and offers.</p>
          <form className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-white"
            />
            <button
              type="submit"
              className="bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-semibold"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} SafarPk. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
