import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../../assets/icons/logo.png';
import { useAuth } from '../../../hooks/useAuth';

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { signUp, isLoading, error } = useAuth();

  // 개별 필드 유효성 검사
  const validations = {
    username: {
      isValid: username.length >= 3,
      message: username.length === 0 ? 'Username is required' : username.length < 3 ? 'Username must be at least 3 characters' : 'Good username!'
    },
    email: {
      isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: email.length === 0 ? 'Email is required' : !email.includes('@') ? 'Please enter a valid email address' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Please enter a valid email format' : 'Valid email address!'
    },
    password: {
      isValid: password.length >= 8,
      message: password.length === 0 ? 'Password is required' : password.length < 8 ? 'Password must be at least 8 characters' : 'Strong password!'
    },
    passwordConfirm: {
      isValid: passwordConfirm.length > 0 && password === passwordConfirm,
      message: passwordConfirm.length === 0 ? 'Please confirm your password' : password !== passwordConfirm ? 'Passwords do not match' : 'Passwords match!'
    }
  };

  // 필드 터치 핸들러
  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  // 필드 상태 가져오기
  const getFieldState = (fieldName: keyof typeof validations) => {
    const validation = validations[fieldName];
    const isTouched = touchedFields[fieldName];
    const hasContent = fieldName === 'username' ? username.length > 0 : fieldName === 'email' ? email.length > 0 : fieldName === 'password' ? password.length > 0 : passwordConfirm.length > 0;
    
    if (!isTouched && !hasContent) return 'default';
    return validation.isValid ? 'valid' : 'invalid';
  };

  // 필드 스타일 가져오기
  const getFieldStyles = (fieldName: keyof typeof validations) => {
    const state = getFieldState(fieldName);
    switch (state) {
      case 'valid':
        return 'border-blue-500 focus:border-blue-500';
      case 'invalid':
        return 'border-red-500 focus:border-red-500 focus:ring-red-500';
      default:
        return 'border-gray-300 focus:border-blue-500';
    }
  };

  const isFormValid = validations.username.isValid && 
                     validations.email.isValid && 
                     validations.password.isValid && 
                     validations.passwordConfirm.isValid;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    
    if (!isFormValid) return;
    
    try {
      signUp({
        username,
        email,
        password
      });
      // 자동 리다이렉트 제거 (useAuth에서 처리)
    } catch {
      setSignUpError('Sign up failed. Please try again.');
    }
  };

  const handleLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img 
            src={logoImage} 
            alt="LognLook Logo" 
            className="mx-auto h-16 w-auto mb-4"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
        </div>

        {/* Sign Up Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          {/* Error Display */}
          {(signUpError || error) && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {signUpError || error?.message}
            </div>
          )}

          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-gray-600 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleFieldBlur('username')}
                className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none text-gray-900 transition-colors ${getFieldStyles('username')}`}
                placeholder="Enter username (3+ characters)"
              />
              {(touchedFields.username || username.length > 0) && (
                <p className={`mt-1 text-xs ${
                  getFieldState('username') === 'valid' ? 'text-blue-600' : 
                  getFieldState('username') === 'invalid' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {validations.username.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none text-gray-900 transition-colors ${getFieldStyles('email')}`}
                placeholder="Enter your email address"
              />
              {(touchedFields.email || email.length > 0) && (
                <p className={`mt-1 text-xs ${
                  getFieldState('email') === 'valid' ? 'text-blue-600' : 
                  getFieldState('email') === 'invalid' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {validations.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
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
                onBlur={() => handleFieldBlur('password')}
                className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none text-gray-900 transition-colors ${getFieldStyles('password')}`}
                placeholder="Enter password (8+ characters)"
              />
              {(touchedFields.password || password.length > 0) && (
                <p className={`mt-1 text-xs ${
                  getFieldState('password') === 'valid' ? 'text-blue-600' : 
                  getFieldState('password') === 'invalid' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {validations.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-xs font-medium text-gray-600 mb-2">
                Confirm Password
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                onBlur={() => handleFieldBlur('passwordConfirm')}
                className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none text-gray-900 transition-colors ${getFieldStyles('passwordConfirm')}`}
                placeholder="Confirm your password"
              />
              {(touchedFields.passwordConfirm || passwordConfirm.length > 0) && (
                <p className={`mt-1 text-xs ${
                  getFieldState('passwordConfirm') === 'valid' ? 'text-blue-600' : 
                  getFieldState('passwordConfirm') === 'invalid' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {validations.passwordConfirm.message}
                </p>
              )}
            </div>
          </div>

          {/* Sign Up Button */}
          <div>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isFormValid && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleLogin}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;