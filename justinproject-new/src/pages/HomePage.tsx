import React from 'react';
import { Leaf, Zap, Recycle, Shield } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-12 rounded-lg shadow-lg mb-8">
        <h1 className="text-5xl font-bold mb-4">Welcome to GreenTech Solutions</h1>
        <p className="text-xl mb-6">
          Leading the future of sustainable technology and environmental innovation
        </p>
        <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Discover Our Solutions
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <Leaf className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
          <p className="text-gray-600">100% sustainable solutions for a greener tomorrow</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Energy Efficient</h3>
          <p className="text-gray-600">Cutting-edge technology that reduces energy consumption</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <Recycle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Recyclable</h3>
          <p className="text-gray-600">Products designed for circular economy principles</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <Shield className="h-12 w-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Reliable</h3>
          <p className="text-gray-600">Trusted by thousands of businesses worldwide</p>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Environmental Consulting</h3>
            <p className="text-gray-600">Expert guidance on sustainable business practices and environmental compliance</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Renewable Energy</h3>
            <p className="text-gray-600">Solar, wind, and hybrid energy solutions for businesses of all sizes</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Recycle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Waste Management</h3>
            <p className="text-gray-600">Innovative recycling and waste reduction programs</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-green-400 mb-2">500+</div>
            <div className="text-gray-300">Projects Completed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">2.5M</div>
            <div className="text-gray-300">Tons CO₂ Reduced</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-yellow-400 mb-2">150+</div>
            <div className="text-gray-300">Happy Clients</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">25</div>
            <div className="text-gray-300">Countries Served</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;