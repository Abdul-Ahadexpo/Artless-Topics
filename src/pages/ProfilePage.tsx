import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { ref, set } from 'firebase/database';
import { getUserPosts, getUserLikedPosts, updatePostsUsername } from '../services/postService';
import { uploadImage } from '../services/imgbbService';
import { Post } from '../types';
import PostGrid from '../components/posts/PostGrid';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { User, Heart, Image, Edit2, Check, X, Camera, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'uploads' | 'likes'>('uploads');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  
  const { currentUser, logout, updateUsername } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setNewUsername(currentUser.username || '');
    
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

  const handleUsernameUpdate = async () => {
    if (!currentUser) return;
    
    const trimmedUsername = newUsername.trim();
    if (!trimmedUsername) {
      setUsernameError('Username cannot be empty');
      return;
    }
    
    if (trimmedUsername === currentUser.username) {
      setIsEditingUsername(false);
      return;
    }
    
    setIsUpdating(true);
    setUsernameError('');
    
    try {
      await updateUsername(trimmedUsername);
      await updatePostsUsername(currentUser.uid, trimmedUsername);
      setIsEditingUsername(false);
      
      // Refresh posts to show updated username
      const updatedPosts = await getUserPosts(currentUser.uid);
      setUserPosts(updatedPosts);
    } catch (error) {
      if ((error as Error).message.includes('username-exists')) {
        setUsernameError('This username is already taken');
      } else {
        setUsernameError('Failed to update username');
      }
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser || !auth.currentUser) return;
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setPhotoError('Image size must be less than 5MB');
      return;
    }
    
    setIsUploadingPhoto(true);
    setPhotoError('');
    
    try {
      // Upload image to ImgBB
      const photoURL = await uploadImage(file);
      
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { photoURL });
      
      // Update user record in database
      await set(ref(db, `users/${currentUser.uid}`), {
        ...currentUser,
        photoURL,
      });
      
      // Force re-render by updating auth state
      window.location.reload();
    } catch (error) {
      console.error('Error uploading photo:', error);
      setPhotoError('Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.username || 'Profile'}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
              />
            ) : (
              <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-purple-200">
                {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            
            {/* Photo upload overlay */}
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Camera className="text-white" size={24} />
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={isUploadingPhoto}
              />
            </div>
            
            {/* Loading overlay */}
            <AnimatePresence>
              {isUploadingPhoto && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center"
                >
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            {photoError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 p-2 bg-red-50 text-red-600 text-sm rounded"
              >
                {photoError}
              </motion.div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
              {isEditingUsername ? (
                <div className="w-full sm:w-auto">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    error={usernameError}
                    className="text-center sm:text-left"
                  />
                  <div className="flex justify-center sm:justify-start gap-2 mt-2">
                    <Button
                      onClick={handleUsernameUpdate}
                      variant="primary"
                      size="sm"
                      isLoading={isUpdating}
                    >
                      <Check size={16} className="mr-1" />
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingUsername(false);
                        setNewUsername(currentUser.username || '');
                        setUsernameError('');
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <X size={16} className="mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentUser.username || 'User'}
                  </h1>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                    title="Edit username"
                  >
                    <Edit2 size={16} />
                  </button>
                </>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {currentUser.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Hover over your profile picture to change it
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
              flex-1 sm:flex-none flex items-center justify-center py-3 px-4 font-medium text-sm 
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
              flex-1 sm:flex-none flex items-center justify-center py-3 px-4 font-medium text-sm
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
