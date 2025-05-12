import React, { useState, useEffect } from 'react';
import { getCurrentMonthPosts } from '../services/postService';
import { Post } from '../types';
import PostGrid from '../components/posts/PostGrid';
import { Trophy } from 'lucide-react';
import { format } from 'date-fns';

const LeaderboardPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const currentMonth = format(new Date(), 'MMMM yyyy');
  
  useEffect(() => {
    const fetchLeaderboardPosts = async () => {
      try {
        const leaderboardPosts = await getCurrentMonthPosts();
        setPosts(leaderboardPosts);
      } catch (error) {
        console.error('Error fetching leaderboard posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboardPosts();
  }, []);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <div className="inline-block p-3 bg-yellow-100 text-yellow-600 rounded-full mb-4">
          <Trophy size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Monthly Leaderboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Top posts for {currentMonth}
        </p>
      </div>
      
      {posts.length > 0 && !loading && (
        <div className="mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-teal-500 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-2">🏆 Top Post</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <img 
                src={posts[0].imageUrl} 
                alt={posts[0].caption} 
                className="w-full md:w-1/3 h-64 object-cover rounded-lg shadow-md"
              />
              <div className="flex-1">
                <p className="text-xl font-medium mb-2">{posts[0].caption}</p>
                <div className="flex items-center mb-4">
                  <div className="mr-2 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    {posts[0].username.charAt(0).toUpperCase()}
                  </div>
                  <span>Posted by {posts[0].username}</span>
                </div>
                <div className="bg-white/20 py-1 px-3 rounded-full inline-flex items-center">
                  <span className="font-bold mr-1">{posts[0].likes}</span> likes
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        All Top Posts
      </h2>
      
      <PostGrid 
        posts={posts} 
        loading={loading} 
        emptyMessage="No posts for this month yet. Be the first to share an image!"
      />
    </div>
  );
};

export default LeaderboardPage;