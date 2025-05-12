import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Home, Award, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const closeMenu = () => setIsMenuOpen(false);
  
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <Camera className="h-8 w-8 text-purple-600" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  Artless Topics
                </span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <NavLink to="/" active={isActive('/')}>
                <Home className="mr-1" size={18} />
                Home
              </NavLink>
              <NavLink to="/leaderboard" active={isActive('/leaderboard')}>
                <Award className="mr-1" size={18} />
                Leaderboard
              </NavLink>
              {currentUser && (
                <NavLink to="/profile" active={isActive('/profile')}>
                  <User className="mr-1" size={18} />
                  Profile
                </NavLink>
              )}
            </nav>
          </div>
          
          {/* Auth buttons */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {currentUser.username || currentUser.email}
                </div>
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center"
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline" size="sm">Sign in</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-purple-500 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden border-t border-gray-200 dark:border-gray-700"
          >
            <div className="pt-2 pb-3 space-y-1">
              <MobileNavLink to="/" active={isActive('/')} onClick={closeMenu}>
                <Home className="mr-2" size={18} />
                Home
              </MobileNavLink>
              <MobileNavLink to="/leaderboard" active={isActive('/leaderboard')} onClick={closeMenu}>
                <Award className="mr-2" size={18} />
                Leaderboard
              </MobileNavLink>
              {currentUser && (
                <MobileNavLink to="/profile" active={isActive('/profile')} onClick={closeMenu}>
                  <User className="mr-2" size={18} />
                  Profile
                </MobileNavLink>
              )}
            </div>
            
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              {currentUser ? (
                <div className="space-y-1">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    Signed in as {currentUser.email}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <LogOut className="mr-2" size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="px-4 py-2 space-y-2">
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">Sign in</Button>
                  </Link>
                  <Link to="/signup" onClick={closeMenu}>
                    <Button variant="primary" className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => {
  return (
    <Link
      to={to}
      className={`
        flex items-center px-3 py-2 rounded-md text-sm font-medium
        ${active
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}
      `}
    >
      {children}
    </Link>
  );
};

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, active, onClick, children }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center px-4 py-2 text-base font-medium border-l-4
        ${active
          ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-700'}
      `}
    >
      {children}
    </Link>
  );
};

export default Navbar;