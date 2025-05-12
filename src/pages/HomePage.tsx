import React, { useState, useEffect } from 'react';
import { getAllPosts } from '../services/postService';
import { Post } from '../types';
import ImageUpload from '../components/upload/ImageUpload';
import PostGrid from '../components/posts/PostGrid';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getAllPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {currentUser && (
        <div className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <ImageUpload />
        </div>
      )}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Recent Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover the latest images shared by our community
        </p>
      </div>
      
      <PostGrid 
        posts={posts} 
        loading={loading} 
        emptyMessage="No posts yet. Be the first to share an image!"
      />
    </div>
  );
};

export default HomePage;