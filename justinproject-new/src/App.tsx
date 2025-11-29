import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Website from './components/Website';
import { apiService } from './services/api';

function App() {
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const profile = await apiService.getProfile();
          setUser(profile);
        } catch (err) {
          // Token is invalid, clear it
          apiService.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login(data.email, data.password);
      setUser(response.user);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: { email: string; password: string; confirmPassword: string }) => {
    setLoading(true);
    setError(null);

    try {
      await apiService.register(data.email, data.password);
      setAuthView('login');
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-indigo-600 font-medium">Processing...</p>
        </div>
      ) : user ? (
        <Website user={user} onLogout={handleLogout} />
      ) : authView === 'login' ? (
        <LoginForm onSubmit={handleLogin} error={error} setAuthView={setAuthView} />
      ) : (
        <RegisterForm onSubmit={handleRegister} error={error} setAuthView={setAuthView} />
      )}
    </div>
  );
}

export default App;