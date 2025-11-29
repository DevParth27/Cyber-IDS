import React, { useState } from 'react';
import { Database, AlertTriangle, Users, Activity, FileText, Download, BarChart, Lock, Eye, EyeOff } from 'lucide-react';

const AdminPage: React.FC = () => {
  // Realistic user data from Kaggle-style dataset
  const [userData] = useState([
    { id: 1, firstName: 'Emma', lastName: 'Johnson', email: 'emma.johnson@email.com', age: 28, city: 'New York', occupation: 'Software Engineer', salary: 95000, joinDate: '2023-03-15' },
    { id: 2, firstName: 'Liam', lastName: 'Williams', email: 'liam.williams@email.com', age: 34, city: 'San Francisco', occupation: 'Data Scientist', salary: 120000, joinDate: '2022-11-08' },
    { id: 3, firstName: 'Olivia', lastName: 'Brown', email: 'olivia.brown@email.com', age: 29, city: 'Austin', occupation: 'Product Manager', salary: 110000, joinDate: '2023-01-22' },
    { id: 4, firstName: 'Noah', lastName: 'Davis', email: 'noah.davis@email.com', age: 31, city: 'Seattle', occupation: 'DevOps Engineer', salary: 105000, joinDate: '2022-09-14' },
    { id: 5, firstName: 'Ava', lastName: 'Miller', email: 'ava.miller@email.com', age: 26, city: 'Boston', occupation: 'UX Designer', salary: 85000, joinDate: '2023-05-03' },
    { id: 6, firstName: 'William', lastName: 'Wilson', email: 'william.wilson@email.com', age: 37, city: 'Chicago', occupation: 'Senior Developer', salary: 115000, joinDate: '2021-12-10' },
    { id: 7, firstName: 'Sophia', lastName: 'Moore', email: 'sophia.moore@email.com', age: 32, city: 'Denver', occupation: 'Marketing Manager', salary: 90000, joinDate: '2022-07-18' },
    { id: 8, firstName: 'James', lastName: 'Taylor', email: 'james.taylor@email.com', age: 35, city: 'Portland', occupation: 'System Architect', salary: 130000, joinDate: '2021-08-25' },
    { id: 9, firstName: 'Isabella', lastName: 'Anderson', email: 'isabella.anderson@email.com', age: 27, city: 'Miami', occupation: 'Frontend Developer', salary: 80000, joinDate: '2023-02-14' },
    { id: 10, firstName: 'Benjamin', lastName: 'Thomas', email: 'benjamin.thomas@email.com', age: 33, city: 'Los Angeles', occupation: 'Backend Developer', salary: 100000, joinDate: '2022-04-07' },
    { id: 11, firstName: 'Mia', lastName: 'Jackson', email: 'mia.jackson@email.com', age: 30, city: 'Phoenix', occupation: 'QA Engineer', salary: 75000, joinDate: '2023-06-12' },
    { id: 12, firstName: 'Lucas', lastName: 'White', email: 'lucas.white@email.com', age: 29, city: 'San Diego', occupation: 'Mobile Developer', salary: 95000, joinDate: '2022-10-30' }
  ]);

  const [accessAttempts, setAccessAttempts] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSpecialAccess = () => {
    setAccessAttempts(prev => prev + 1);
    if (accessAttempts >= 2) {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCredentials.username === 'admin' && adminCredentials.password === 'admin@123') {
      setShowDatabase(true);
      setShowAdminLogin(false);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminCredentials(prev => ({ ...prev, [name]: value }));
  };

  if (showDatabase) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center">
            <Database className="h-8 w-8 mr-3 text-red-500" />
            Employee Database - Admin Access
          </h1>
          <button
            onClick={() => {
              setShowDatabase(false);
              setAccessAttempts(0);
              setAdminCredentials({ username: '', password: '' });
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Exit Database
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-red-900">Confidential Employee Database</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userData.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">Age: {user.age}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.occupation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">${user.salary.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (showAdminLogin) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Admin Access Required</h2>
            <p className="text-gray-600 mt-2">Please enter admin credentials to continue</p>
          </div>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={adminCredentials.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={adminCredentials.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            {loginError && (
              <div className="text-red-600 text-sm">{loginError}</div>
            )}
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdminLogin(false);
                  setAccessAttempts(0);
                  setAdminCredentials({ username: '', password: '' });
                  setLoginError('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center">
        <FileText className="h-8 w-8 mr-3 text-green-500" />
        Resources & Downloads
      </h1>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Documents</p>
              <p className="text-2xl font-bold text-gray-900">247</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-green-600">15.2K</p>
            </div>
            <Download className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resource Categories</p>
              <p className="text-2xl font-bold text-orange-600">12</p>
            </div>
            <BarChart className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Resource Categories</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-semibold">Technical Documentation</h3>
            <p className="text-gray-600 text-sm">API guides, installation manuals, and technical specs</p>
          </button>
          <button 
            onClick={handleSpecialAccess}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <h3 className="font-semibold">Training Materials</h3>
            <p className="text-gray-600 text-sm">Video tutorials, webinars, and certification guides</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-semibold">Case Studies</h3>
            <p className="text-gray-600 text-sm">Success stories and implementation examples</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-semibold">Employee Directory</h3>
            <p className="text-gray-600 text-sm">Company staff contact information</p>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Popular Downloads</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <h4 className="font-medium">GreenTech Solutions Brochure</h4>
                <p className="text-sm text-gray-600">Company overview and services - PDF, 2.4 MB</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium">Download</button>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <h4 className="font-medium">Sustainability Report 2024</h4>
                <p className="text-sm text-gray-600">Annual environmental impact report - PDF, 5.1 MB</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium">Download</button>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <h4 className="font-medium">Product Catalog</h4>
                <p className="text-sm text-gray-600">Complete product specifications - PDF, 8.7 MB</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium">Download</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;