import React from 'react';
import { Home, Users, Phone, Settings, Shield } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: 'home' | 'about' | 'contact' | 'admin' | 'ids') => void;
  user: { id: string; email: string };
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage, user, onLogout }) => {
  return (
    <nav className="bg-blue-900 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">GT</span>
          </div>
          <span className="text-xl font-bold">GreenTech Solutions</span>
        </div>
        <div className="flex space-x-6">
          <button
            onClick={() => setCurrentPage('home')}
            className={`flex items-center space-x-1 px-3 py-2 rounded ${currentPage === 'home' ? 'bg-orange-600' : 'hover:bg-blue-700'}`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setCurrentPage('about')}
            className={`flex items-center space-x-1 px-3 py-2 rounded ${currentPage === 'about' ? 'bg-orange-600' : 'hover:bg-blue-700'}`}
          >
            <Users className="h-4 w-4" />
            <span>About Us</span>
          </button>
          <button
            onClick={() => setCurrentPage('contact')}
            className={`flex items-center space-x-1 px-3 py-2 rounded ${currentPage === 'contact' ? 'bg-orange-600' : 'hover:bg-blue-700'}`}
          >
            <Phone className="h-4 w-4" />
            <span>Contact</span>
          </button>
          <button
            onClick={() => setCurrentPage('admin')}
            className={`flex items-center space-x-1 px-3 py-2 rounded ${currentPage === 'admin' ? 'bg-orange-600' : 'hover:bg-blue-700'}`}
          >
            <Settings className="h-4 w-4" />
            <span>Resources</span>
          </button>
          <button
            onClick={() => setCurrentPage('ids')}
            className={`flex items-center space-x-1 px-3 py-2 rounded ${currentPage === 'ids' ? 'bg-orange-600' : 'hover:bg-blue-700'}`}
          >
            <Shield className="h-4 w-4" />
            <span>IDS Dashboard</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Welcome, {user.email}</span>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;