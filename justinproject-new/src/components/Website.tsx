import React, { useState } from 'react';
import Navigation from './Navigation';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import AdminPage from '../pages/AdminPage';
import IDSDashboard from '../pages/IDSDashboard';

interface WebsiteProps {
  user: { id: string; email: string };
  onLogout: () => void;
}

const Website: React.FC<WebsiteProps> = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'contact' | 'admin' | 'ids'>('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'admin':
        return <AdminPage />;
      case 'ids':
        return <IDSDashboard />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user} 
        onLogout={onLogout} 
      />
      <div className="py-8">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default Website;