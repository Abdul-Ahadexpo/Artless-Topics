import React, { useState, useEffect } from 'react';
import { Heart, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Card, { CardBody, CardFooter } from '../ui/Card';
import { Post } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { likePost, checkIfUserLikedPost } from '../../services/postService';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (currentUser) {
        const hasLiked = await checkIfUserLikedPost(post.id, currentUser.uid);
        setLiked(hasLiked);
      }
    };
    
    checkLikeStatus();
  }, [post.id, currentUser]);
  
  const handleLike = async () => {
    if (!currentUser) return;
    
    setIsLiking(true);
    try {
      await likePost(post.id, currentUser.uid);
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        {/* Image */}
        <img 
          src={post.imageUrl} 
          alt={post.caption} 
          className="w-full h-64 object-cover object-center"
          loading="lazy"
        />
        
        {/* User info overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
              <span className="text-white font-medium">
                {post.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-2">
              <p className="text-white font-medium">{post.username}</p>
              <p className="text-white/80 text-xs">
                {formatDistanceToNow(post.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <CardBody>
        <p className="text-gray-700 dark:text-gray-300">{post.caption}</p>
      </CardBody>
      
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleLike}
            disabled={isLiking || !currentUser}
            className={`
              p-2 rounded-full transition-colors
              ${liked 
                ? 'text-red-500 hover:bg-red-100' 
                : 'text-gray-500 hover:bg-gray-100'}
              ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Heart 
              className={`${liked ? 'fill-red-500' : ''} ${isLiking ? 'animate-pulse' : ''}`} 
              size={20} 
            />
          </button>
          <span className="text-gray-600 dark:text-gray-400">{likeCount}</span>
        </div>
        
        <div className="relative">
          <button 
            onClick={handleShare}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Share2 size={20} />
          </button>
          
          {copySuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 bottom-full mb-2 bg-black text-white text-xs rounded px-2 py-1"
            >
              Link copied!
            </motion.div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;