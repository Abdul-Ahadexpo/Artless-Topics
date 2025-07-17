import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getAllPosts } from '../services/postService';
import { Post } from '../types';
import PostGrid from '../components/posts/PostGrid';
import { useAuth } from '../hooks/useAuth';
import UploadModal from '../components/upload/UploadModal';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
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

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handlePostDelete = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {currentUser && (
        <motion.button
          onClick={() => setShowUploadModal(true)}
          className="fixed bottom-6 right-6 z-10 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={24} />
        </motion.button>
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
        onPostUpdate={handlePostUpdate}
        onPostDelete={handlePostDelete}
      />

      <UploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
};

export default HomePage;