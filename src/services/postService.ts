import { ref, set, get, update, push, query, orderByChild, startAt, endAt } from 'firebase/database';
import { db } from '../firebase/config';
import { Post, UserLike } from '../types';
import { format } from 'date-fns';

// Create a new post
export const createPost = async (userId: string, username: string, imageUrl: string, caption: string, userPhotoURL?: string): Promise<string> => {
  try {
    const postRef = push(ref(db, 'posts'));
    const postId = postRef.key as string;
    const now = Date.now();
    const month = format(now, 'MMMM');
    const year = format(now, 'yyyy');
    
    const post: Post = {
      id: postId,
      imageUrl,
      caption,
      userId,
      username,
      createdAt: now,
      likes: 0,
      month,
      year,
      userPhotoURL: userPhotoURL || ''
    };
    
    await set(postRef, post);
    return postId;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Update username in all user's posts
export const updatePostsUsername = async (userId: string, newUsername: string): Promise<void> => {
  try {
    const postsRef = ref(db, 'posts');
    const snapshot = await get(postsRef);
    
    if (snapshot.exists()) {
      const updates: Record<string, any> = {};
      
      snapshot.forEach((childSnapshot) => {
        const post = childSnapshot.val() as Post;
        if (post.userId === userId) {
          updates[`posts/${post.id}/username`] = newUsername;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
      }
    }
  } catch (error) {
    console.error('Error updating posts username:', error);
    throw error;
  }
};

// Update profile picture in all user's posts
export const updatePostsProfilePicture = async (userId: string, newPhotoURL: string): Promise<void> => {
  try {
    const postsRef = ref(db, 'posts');
    const snapshot = await get(postsRef);
    
    if (snapshot.exists()) {
      const updates: Record<string, any> = {};
      
      snapshot.forEach((childSnapshot) => {
        const post = childSnapshot.val() as Post;
        if (post.userId === userId) {
          updates[`posts/${post.id}/userPhotoURL`] = newPhotoURL;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
      }
    }
  } catch (error) {
    console.error('Error updating posts profile picture:', error);
    throw error;
  }
};

// Update a post
export const updatePost = async (postId: string, updates: Partial<Pick<Post, 'caption' | 'imageUrl'>>): Promise<void> => {
  try {
    const postRef = ref(db, `posts/${postId}`);
    await update(postRef, updates);
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId: string): Promise<void> => {
  try {
    const postRef = ref(db, `posts/${postId}`);
    await set(postRef, null);
    
    // Also remove all likes for this post
    const likesRef = ref(db, 'likes');
    const likesSnapshot = await get(likesRef);
    
    if (likesSnapshot.exists()) {
      const updates: Record<string, any> = {};
      likesSnapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key as string;
        if (key.startsWith(`${postId}_`)) {
          updates[`likes/${key}`] = null;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
      }
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Get all posts
export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const postsRef = ref(db, 'posts');
    const snapshot = await get(postsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const posts: Post[] = [];
    snapshot.forEach((childSnapshot) => {
      posts.push(childSnapshot.val() as Post);
    });
    
    // Sort by creation date, newest first
    return posts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

// Get posts for current month
export const getCurrentMonthPosts = async (): Promise<Post[]> => {
  try {
    const currentMonth = format(new Date(), 'MMMM');
    const currentYear = format(new Date(), 'yyyy');
    
    const postsRef = ref(db, 'posts');
    const snapshot = await get(postsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const posts: Post[] = [];
    snapshot.forEach((childSnapshot) => {
      const post = childSnapshot.val() as Post;
      if (post.month === currentMonth && post.year === currentYear) {
        posts.push(post);
      }
    });
    
    // Sort by likes, highest first
    return posts.sort((a, b) => b.likes - a.likes);
  } catch (error) {
    console.error('Error getting current month posts:', error);
    throw error;
  }
};

// Get user posts
export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const postsRef = ref(db, 'posts');
    const snapshot = await get(postsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const posts: Post[] = [];
    snapshot.forEach((childSnapshot) => {
      const post = childSnapshot.val() as Post;
      if (post.userId === userId) {
        posts.push(post);
      }
    });
    
    // Sort by creation date, newest first
    return posts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting user posts:', error);
    throw error;
  }
};

// Like a post
export const likePost = async (postId: string, userId: string): Promise<void> => {
  try {
    // Check if user already liked the post
    const likeRef = ref(db, `likes/${postId}_${userId}`);
    const likeSnapshot = await get(likeRef);
    
    if (likeSnapshot.exists()) {
      // User already liked the post, unlike it
      await set(likeRef, null);
      
      // Decrement like count
      const postRef = ref(db, `posts/${postId}`);
      const postSnapshot = await get(postRef);
      
      if (postSnapshot.exists()) {
        const post = postSnapshot.val() as Post;
        await update(postRef, { likes: post.likes - 1 });
      }
    } else {
      // User hasn't liked the post, like it
      const userLike: UserLike = {
        postId,
        userId
      };
      
      await set(likeRef, userLike);
      
      // Increment like count
      const postRef = ref(db, `posts/${postId}`);
      const postSnapshot = await get(postRef);
      
      if (postSnapshot.exists()) {
        const post = postSnapshot.val() as Post;
        await update(postRef, { likes: post.likes + 1 });
      }
    }
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Check if user liked a post
export const checkIfUserLikedPost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const likeRef = ref(db, `likes/${postId}_${userId}`);
    const snapshot = await get(likeRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking if user liked post:', error);
    throw error;
  }
};

// Get user's liked posts
export const getUserLikedPosts = async (userId: string): Promise<Post[]> => {
  try {
    // Get all likes
    const likesRef = ref(db, 'likes');
    const likesSnapshot = await get(likesRef);
    
    if (!likesSnapshot.exists()) {
      return [];
    }
    
    // Filter likes by userId
    const userLikedPostIds: string[] = [];
    likesSnapshot.forEach((childSnapshot) => {
      const userLike = childSnapshot.val() as UserLike;
      if (userLike.userId === userId) {
        userLikedPostIds.push(userLike.postId);
      }
    });
    
    // Get posts by ids
    const likedPosts: Post[] = [];
    for (const postId of userLikedPostIds) {
      const postRef = ref(db, `posts/${postId}`);
      const postSnapshot = await get(postRef);
      
      if (postSnapshot.exists()) {
        likedPosts.push(postSnapshot.val() as Post);
      }
    }
    
    return likedPosts;
  } catch (error) {
    console.error('Error getting user liked posts:', error);
    throw error;
  }
};