'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Users, Clock, Heart } from 'lucide-react';
import { DEFAULT_TEAM, TeamMember } from '@/types';
import { cn } from '@/lib/utils';
import Doctor from '../public/Doctor.png';

interface AboutProps {
  team?: TeamMember[];
}

const stats = [
  {
    icon: Award,
    value: '15+',
    label: 'Years of Experience',
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
  },
  {
    icon: Users,
    value: '10,000+',
    label: 'Happy Patients',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    icon: Clock,
    value: '24/7',
    label: 'Emergency Care',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    icon: Heart,
    value: '98%',
    label: 'Patient Satisfaction',
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
  },
];

export function About({ team = DEFAULT_TEAM }: AboutProps) {
  return (
    <section id="about" className="py-20 md:py-28 bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-sky-100 text-sky-600 rounded-full text-sm font-medium mb-4">
            About Us
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Trusted Partner in{' '}
            <span className="bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
              Dental Health
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            For over 15 years, Smile Hub has been dedicated to providing exceptional
            dental care in a comfortable, welcoming environment. Our team of expert
            dentists uses the latest technology to ensure the best outcomes for our patients.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                At Smile Hub, we believe everyone deserves access to quality dental care.
                Our mission is to provide comprehensive, compassionate dental services that
                help our patients achieve and maintain optimal oral health.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We are committed to staying at the forefront of dental technology and
                techniques, continuously improving our skills to deliver the best possible
                care. Your comfort and well-being are our top priorities.
              </p>
            </div>
             <div className='flex justify-center items-center'>
              <img 
  src="https://bouve.northeastern.edu/wp-content/uploads/2023/06/doctor-of-health-science-vs-doctor-of-medical-science-whats-the-difference-northeastern-graduate.webp" 
  alt="Doctor" 
  className="w-auto h-[25rem] rounded-lg" 
/></div>
          </div>
        </div>




      </div>
    </section>
  );
}
