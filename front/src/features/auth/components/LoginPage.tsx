import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../../assets/icons/logo.png';
import { useAuth } from '../../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const isFormValid = userId.length >= 3 && password.length >= 8;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!isFormValid) return;
    
    try {
      login({
        username: userId,
        password: password
      });
      // 자동 리다이렉트 제거 (useAuth에서 처리)
    } catch {
      setLoginError('Login failed. Please check your credentials.');
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };



  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src={logoImage} 
              alt="LognLook Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          
          {/* Title */}
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
            Login
          </h2>
          
          {/* Login Error */}
          {(loginError || error) && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {loginError || error?.message}
            </div>
          )}

          
          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="id" className="block text-xs font-medium text-gray-600 mb-2">
                ID
              </label>
              <input
                id="id"
                name="id"
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 text-gray-800"
                placeholder="Enter your ID"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 text-gray-800"
                placeholder="Enter your password"
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          
          {/* Bottom Buttons */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSignUp}
              className="text-orange-500 hover:text-orange-600 font-medium text-sm"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 