'use client';

import Link from 'next/link';
import { Smile, Heart } from 'lucide-react';
import { LuFacebook, LuInstagram,  } from "react-icons/lu";
import { ImWhatsapp } from "react-icons/im";
import Logo from '../public/Logo.png';

const footerLinks = {
  quickLinks: [
    { label: 'Home', href: '#home' },
    { label: 'About Us', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
    { label: 'Book Appointment', href: '#appointment' },
  ],
  services: [
    { label: 'General Dentistry', href: '#services' },
    { label: 'Teeth Whitening', href: '#services' },
    { label: 'Dental Implants', href: '#services' },
    { label: 'Orthodontics', href: '#services' },
    { label: 'Root Canal', href: '#services' },
  ],
};

const socialLinks = [
  { icon: LuFacebook, href: 'https://www.facebook.com/share/17kkBqsLRr/', label: 'Facebook' },
  { icon: LuInstagram, href: 'https://www.instagram.com/the_smile_hub_?igsh=MnF6ZTEyeG40Mm4=', label: 'Instagram' },
  { icon: ImWhatsapp, href: 'https://wa.me/94777421620', label: 'WhatsApp' },
];

export function Footer() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={Logo.src} alt="Smile Hub Logo" className="w-auto h-6" />
              </div>
              <span className="text-xl font-bold">Smile Hub</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your trusted partner in dental health. We provide comprehensive dental care
              with a gentle touch and a commitment to excellence.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-sky-600 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-sky-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-4">Our Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-sky-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <span className="text-sky-400">📍</span>
                <span>Kandy Road, Colombo</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-sky-400">📞</span>
                <span>+94 77 234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-sky-400">✉️</span>
                <span>smilehublanka@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sky-400">🕐</span>
                <span>Mon-Fri: 9AM - 9PM<br />Sat: 9AM - 9PM<br />Sun: 9AM - 9PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Smile Hub. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>for better smiles</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <button className="hover:text-sky-400 transition-colors">Privacy Policy</button>
              <button className="hover:text-sky-400 transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
