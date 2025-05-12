import React from 'react';
import { Heart, Camera } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <Camera className="h-6 w-6 text-purple-600" />
            <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
              Artless Topics
            </span>
          </div>
          
          <div className="mt-4 md:mt-0 text-center md:text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Share your visual stories with the world
            </p>
            <p className="mt-1 text-sm flex items-center justify-center md:justify-end text-gray-400 dark:text-gray-500">
              Made with 
              <Heart className="inline-block mx-1 h-3 w-3 text-red-500" /> 
              in 2025
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;