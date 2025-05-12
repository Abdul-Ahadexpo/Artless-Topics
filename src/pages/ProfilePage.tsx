import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserPosts, getUserLikedPosts } from '../services/postService';
import { Post } from '../types';
import PostGrid from '../components/posts/PostGrid';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { User, Heart, Image } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'uploads' | 'likes'>('uploads');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const fetchUserContent = async () => {
      setLoading(true);
      
      try {
        if (activeTab === 'uploads') {
          const posts = await getUserPosts(currentUser.uid);
          setUserPosts(posts);
        } else {
          const liked = await getUserLikedPosts(currentUser.uid);
          setLikedPosts(liked);
        }
      } catch (error) {
        console.error('Error fetching user content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserContent();
  }, [currentUser, activeTab, navigate]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  if (!currentUser) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentUser.username || 'User'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentUser.email}
            </p>
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
              >
                Back to Home
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`
              flex items-center py-3 px-4 font-medium text-sm 
              ${activeTab === 'uploads'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
            `}
          >
            <Image size={18} className="mr-2" />
            My Uploads
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`
              flex items-center py-3 px-4 font-medium text-sm
              ${activeTab === 'likes'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
            `}
          >
            <Heart size={18} className="mr-2" />
            Posts I Like
          </button>
        </div>
      </div>
      
      {activeTab === 'uploads' ? (
        <PostGrid 
          posts={userPosts} 
          loading={loading} 
          emptyMessage="You haven't uploaded any posts yet. Share your first image!"
        />
      ) : (
        <PostGrid 
          posts={likedPosts} 
          loading={loading} 
          emptyMessage="You haven't liked any posts yet. Start exploring!"
        />
      )}
    </div>
  );
};

export default ProfilePage;