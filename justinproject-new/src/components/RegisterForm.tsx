import React, { useState } from 'react';
import { Shield, Lock, Mail, Key, UserPlus, AlertTriangle } from 'lucide-react';

interface RegisterFormProps {
  onSubmit: (data: { email: string; password: string; confirmPassword: string }) => void;
  error: string | null;
  setAuthView: (view: 'login' | 'register') => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, error, setAuthView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
      /((\%27)|(\'))union/i,
      /exec(\s|\+)+(s|x)p\w+/i,
      /UNION(\s+)ALL(\s+)SELECT/i,
      /INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE/i,
      /SELECT.*FROM/i,
      /SLEEP\(\d+\)/i,
      /BENCHMARK\(\d+,.*\)/i,
      /WAITFOR DELAY/i
    ];

    const hasSqlInjection = sqlPatterns.some(pattern =>
      pattern.test(email) || pattern.test(password) || pattern.test(confirmPassword)
    );

    if (hasSqlInjection) {
      setSecurityAlert('⚠️ SQL Injection attempt detected! This incident has been logged.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordError('');
    setSecurityAlert(null);
    onSubmit({ email, password, confirmPassword });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-10 w-10 text-indigo-600" />
          <h2 className="text-2xl font-bold ml-2 text-gray-800">Create Account</h2>
        </div>

        {securityAlert && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{securityAlert}</p>
              </div>
            </div>
          </div>
        )}

        {error && !securityAlert && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Lock className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border ${securityAlert ? 'border-red-300 ring-red-500' : 'border-gray-300'
                  } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border ${securityAlert ? 'border-red-300 ring-red-500' : 'border-gray-300'
                  } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border ${securityAlert ? 'border-red-300 ring-red-500' : passwordError ? 'border-red-300' : 'border-gray-300'
                  } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="••••••••"
              />
            </div>
            {passwordError && (
              <p className="mt-2 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserPlus className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400 transition ease-in-out duration-150" />
              </span>
              Register
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setAuthView('login')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-gray-100 text-gray-500">
              Protected against SQL injection attacks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;