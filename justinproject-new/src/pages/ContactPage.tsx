import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Contact Us</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Phone className="h-6 w-6 mr-2 text-green-500" />
            Get in Touch
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-500 mr-3" />
              <span>info@greentech-solutions.com</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-500 mr-3" />
              <span>+1 (555) 123-GREEN</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-500 mr-3" />
              <span>123 Eco Drive, Green Valley, CA 90210</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-3" />
              <span>Mon-Fri: 9:00 AM - 6:00 PM PST</span>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-green-800 font-medium">Need a Consultation?</h3>
                <p className="text-green-700 text-sm">Schedule a free sustainability assessment for your business</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Interest</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Renewable Energy Solutions</option>
                <option>Waste Management Systems</option>
                <option>Sustainability Consulting</option>
                <option>Environmental Assessment</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
            </div>
            <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200">
              Send Message
            </button>
          </form>
        </div>
      </div>

      <div className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Visit Our Green Campus</h2>
          <p className="mb-4">Experience our sustainable technologies firsthand at our eco-friendly headquarters</p>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm">Solar Powered</div>
            </div>
            <div>
              <div className="text-3xl font-bold">LEED</div>
              <div className="text-sm">Platinum Certified</div>
            </div>
            <div>
              <div className="text-3xl font-bold">Zero</div>
              <div className="text-sm">Waste to Landfill</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;