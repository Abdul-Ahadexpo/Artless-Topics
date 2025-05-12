import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as LucideUser, Mail, Lock } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';

interface AuthFormProps {
  isLogin?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin && !username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, username);
      }
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('email')) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.includes('password')) {
        setErrors(prev => ({ ...prev, password: errorMessage }));
      } else {
        setErrors(prev => ({ ...prev, general: errorMessage }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <a
            href={isLogin ? '/signup' : '/login'}
            className="font-medium text-purple-600 hover:text-purple-500"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </a>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {errors.general && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}
        
        {!isLogin && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <LucideUser className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="pl-10"
              error={errors.username}
            />
          </div>
        )}
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="pl-10"
            error={errors.email}
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="pl-10"
            error={errors.password}
          />
        </div>
        
        <div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            {isLogin ? 'Sign in' : 'Sign up'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;