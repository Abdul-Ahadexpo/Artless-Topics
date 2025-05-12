import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAg0NBBVQg3s-8CDZLWICGxdfr7OIDkHmQ",
  authDomain: "artless-topics.firebaseapp.com",
  projectId: "artless-topics",
  storageBucket: "artless-topics.firebasestorage.app",
  messagingSenderId: "701795578106",
  appId: "1:701795578106:web:d33c6879e879921d631943",
  databaseURL: "https://artless-topics-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;