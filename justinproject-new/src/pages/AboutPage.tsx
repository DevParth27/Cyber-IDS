import React from 'react';
import { Globe, Users, Award, Target } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">About GreenTech Solutions</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Globe className="h-6 w-6 mr-2 text-green-500" />
          Our Mission
        </h2>
        <p className="text-gray-700 mb-6">
          At GreenTech Solutions, we are committed to creating innovative technologies that protect our planet 
          while driving business success. Our mission is to develop sustainable solutions that reduce environmental 
          impact and promote a cleaner, greener future for generations to come.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Users className="h-6 w-6 mr-2 text-blue-500" />
          Our Leadership Team
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="border p-4 rounded-lg">
            <h3 className="font-semibold text-lg">Dr. Emily Rodriguez</h3>
            <p className="text-green-600 mb-2">Chief Executive Officer</p>
            <p className="text-gray-600 text-sm">Environmental Engineer with 20+ years in sustainable technology development</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="font-semibold text-lg">Michael Chen</h3>
            <p className="text-green-600 mb-2">Chief Technology Officer</p>
            <p className="text-gray-600 text-sm">Former Tesla engineer specializing in renewable energy systems</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="font-semibold text-lg">Sarah Thompson</h3>
            <p className="text-green-600 mb-2">Head of Research & Development</p>
            <p className="text-gray-600 text-sm">PhD in Environmental Science, leading our innovation initiatives</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="font-semibold text-lg">James Wilson</h3>
            <p className="text-green-600 mb-2">Director of Operations</p>
            <p className="text-gray-600 text-sm">Expert in sustainable manufacturing and supply chain optimization</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Award className="h-6 w-6 mr-2 text-orange-500" />
          Our Achievements
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
          <li>Winner of the 2023 Global Sustainability Award</li>
          <li>Certified B-Corporation with highest environmental standards</li>
          <li>ISO 14001 Environmental Management System certified</li>
          <li>Carbon Neutral operations since 2020</li>
          <li>Over 500 successful green technology implementations</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Target className="h-6 w-6 mr-2 text-purple-500" />
          Our Vision for 2030
        </h2>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
          <p className="text-gray-700">
            By 2030, we aim to be the leading provider of sustainable technology solutions globally, 
            helping businesses reduce their carbon footprint by 50% while maintaining operational excellence. 
            We envision a world where technology and nature work in harmony to create a sustainable future.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;