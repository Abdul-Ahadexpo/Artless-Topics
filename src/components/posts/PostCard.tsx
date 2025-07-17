import React, { useState, useEffect } from 'react';
import { Heart, Share2, Download, ArrowLeft, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import Card, { CardBody, CardFooter } from '../ui/Card';
import { Post } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { likePost, checkIfUserLikedPost, updatePost, deletePost } from '../../services/postService';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { uploadImage } from '../../services/imgbbService';

interface PostCardProps {
  post: Post;
  showLink?: boolean;
  onPostUpdate?: (updatedPost: Post) => void;
  onPostDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, showLink = true, onPostUpdate, onPostDelete }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { currentUser } = useAuth();
  const isOwner = currentUser?.uid === post.userId;
  
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

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditCaption(post.caption);
  };

  const handleSaveEdit = async () => {
    if (!editCaption.trim()) return;
    
    setIsUpdating(true);
    try {
      await updatePost(post.id, { caption: editCaption.trim() });
      const updatedPost = { ...post, caption: editCaption.trim() };
      onPostUpdate?.(updatedPost);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post.id);
      onPostDelete?.(post.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
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
          
          {isOwner && (
            <div className="absolute top-3 right-3">
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>
                
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                    >
                      <button
                        onClick={handleEdit}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <Edit2 size={14} className="mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
        
        <CardBody>
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Edit your caption..."
                maxLength={500}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleCancelEdit}
                  variant="ghost"
                  size="sm"
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  variant="primary"
                  size="sm"
                  isLoading={isUpdating}
                  disabled={!editCaption.trim() || isUpdating}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">{post.caption}</p>
          )}
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Delete Post
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              variant="ghost"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="primary"
              isLoading={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PostCard;