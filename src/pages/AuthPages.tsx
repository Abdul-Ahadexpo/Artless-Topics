import React from 'react';
import AuthForm from '../components/auth/AuthForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm isLogin={true} />
    </div>
  );
};

export const SignupPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm isLogin={false} />
    </div>
  );
};