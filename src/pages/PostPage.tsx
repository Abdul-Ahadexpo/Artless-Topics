import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import { Post } from '../types';
import PostCard from '../components/posts/PostCard';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError('Post not found');
        setLoading(false);
        return;
      }
      
      try {
        const postRef = ref(db, `posts/${id}`);
        const snapshot = await get(postRef);
        
        if (snapshot.exists()) {
          const currentPost = snapshot.val() as Post;
          setPost(currentPost);
          
          // Fetch related posts
          const allPostsRef = ref(db, 'posts');
          const allPostsSnapshot = await get(allPostsRef);
          
          if (allPostsSnapshot.exists()) {
            const allPosts = Object.values(allPostsSnapshot.val()) as Post[];
            const filtered = allPosts
              .filter(p => p.id !== id)
              .sort(() => Math.random() - 0.5)
              .slice(0, 6);
            
            setRelatedPosts(filtered);
          }
        } else {
          setError('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse">
          <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Post not found'}
          </h1>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="mr-2" size={18} />
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button 
        onClick={() => navigate(-1)} 
        variant="ghost" 
        className="mb-6"
      >
        <ArrowLeft className="mr-2" size={18} />
        Back
      </Button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-3xl mx-auto mb-12">
          <PostCard 
            post={post} 
            showLink={false}
            onPostUpdate={(updatedPost) => setPost(updatedPost)}
            onPostDelete={() => navigate('/')}
          />
        </div>
        
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              You might also like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <motion.div
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PostCard post={relatedPost} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PostPage;