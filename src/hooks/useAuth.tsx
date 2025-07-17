import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { ref, set, get, onValue } from 'firebase/database';
import { auth, db } from '../firebase/config';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from database
        const userRef = ref(db, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
          const dbUserData = userSnapshot.val();
          const userData: User = {
            uid: user.uid,
            email: user.email || '',
            username: dbUserData.username || user.displayName || '',
            photoURL: user.photoURL || dbUserData.photoURL || '',
          };
          setCurrentUser(userData);
        } else {
          // Fallback to Firebase Auth data
          const userData: User = {
            uid: user.uid,
            email: user.email || '',
            username: user.displayName || '',
            photoURL: user.photoURL || '',
          };
          setCurrentUser(userData);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const users = snapshot.val();
      return !Object.values(users).some((user: any) => 
        user.username.toLowerCase() === username.toLowerCase()
      );
    }
    return true;
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      setError(null);
      
      // Check username availability
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        throw new Error('username-exists');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with username
      await updateProfile(user, { displayName: username });
      
      // Create user record in the database
      await set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        email: user.email,
        username: username,
        createdAt: Date.now(),
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'username-exists') {
        setError('This username is already taken');
      } else {
        setError(error.message);
      }
      throw error;
    }
  };

  const updateUsername = async (newUsername: string) => {
    if (!auth.currentUser || !currentUser) return;
    
    // Check username availability (excluding current user)
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const users = snapshot.val();
      const isUsernameTaken = Object.values(users).some((user: any) => 
        user.uid !== currentUser.uid && 
        user.username.toLowerCase() === newUsername.toLowerCase()
      );
      
      if (isUsernameTaken) {
        throw new Error('username-exists');
      }
    }
    
    // Update Firebase Auth profile
    await updateProfile(auth.currentUser, { displayName: newUsername });
    
    // Update user record in database
    await set(ref(db, `users/${currentUser.uid}`), {
      ...currentUser,
      username: newUsername,
    });
    
    // Update current user state
    setCurrentUser(prev => prev ? { ...prev, username: newUsername } : null);
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    updateUsername,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
