import React, { useState, useEffect } from 'react';
import { Heart, Share2, Download, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import Card, { CardBody, CardFooter } from '../ui/Card';
import { Post } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { likePost, checkIfUserLikedPost } from '../../services/postService';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../ui/Modal';

interface PostCardProps {
  post: Post;
  showLink?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, showLink = true }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  
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
      const newLikeStatus = !liked;
      await likePost(post.id, currentUser.uid);
      setLiked(newLikeStatus);
      setLikeCount(prev => newLikeStatus ? prev + 1 : prev - 1);
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

  const handleDownload = async () => {
    try {
      const response = await fetch(post.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${post.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };
  
  const ImageComponent = () => (
    <motion.img 
      src={post.imageUrl} 
      alt={post.caption}
      className={`w-full object-cover ${showFullImage ? 'h-screen' : 'h-64'} cursor-pointer`}
      loading="lazy"
      onClick={() => setShowFullImage(true)}
      layoutId={`image-${post.id}`}
    />
  );
  
  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative">
          {showLink ? (
            <Link to={`/post/${post.id}`}>
              <ImageComponent />
            </Link>
          ) : (
            <ImageComponent />
          )}
          
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center">
              {post.userPhotoURL ? (
                <img 
                  src={post.userPhotoURL} 
                  alt={post.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {post.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
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
          <div className="flex items-center space-x-4">
            <motion.button 
              onClick={handleLike}
              disabled={isLiking || !currentUser}
              whileTap={{ scale: 0.9 }}
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
              <span className="ml-1">{likeCount}</span>
            </motion.button>
            
            <motion.button 
              onClick={handleShare}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Share2 size={20} />
            </motion.button>
            
            <motion.button 
              onClick={handleDownload}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Download size={20} />
            </motion.button>
          </div>
          
          <AnimatePresence>
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
          </AnimatePresence>
        </CardFooter>
      </Card>

      <Modal 
        isOpen={showFullImage} 
        onClose={() => setShowFullImage(false)}
        fullScreen
      >
        <div className="relative h-full flex items-center justify-center bg-black">
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <motion.img
            src={post.imageUrl}
            alt={post.caption}
            className="max-h-screen max-w-full object-contain"
            layoutId={`image-${post.id}`}
          />
        </div>
      </Modal>
    </>
  );
};

export default PostCard;
