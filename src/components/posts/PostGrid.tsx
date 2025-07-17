import React from 'react';
import { Post } from '../../types';
import PostCard from './PostCard';

interface PostGridProps {
  posts: Post[];
  loading?: boolean;
  emptyMessage?: string;
  onPostUpdate?: (updatedPost: Post) => void;
  onPostDelete?: (postId: string) => void;
}

const PostGrid: React.FC<PostGridProps> = ({ 
  posts, 
  loading = false,
  emptyMessage = 'No posts found',
  onPostUpdate,
  onPostDelete
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 h-64 rounded-t-lg"></div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-b-lg border border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          onPostUpdate={onPostUpdate}
          onPostDelete={onPostDelete}
        />
      ))}
    </div>
  );
};

export default PostGrid;