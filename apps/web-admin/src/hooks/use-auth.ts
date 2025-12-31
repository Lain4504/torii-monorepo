```typescript
import { useEffect, useState } from 'react';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase-config';
import { apiClient } from '../lib/api-client';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    emailVerified: boolean;
}

export const useAuth = () => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in, sync with backend
                try {
                    await syncWithBackend(firebaseUser);
                } catch (error) {
                    console.error('Failed to sync with backend:', error);
                    setFirebaseUser(null);
                    setUser(null);
                }
            } else {
                // User is signed out
                setFirebaseUser(null);
                setUser(null);
            }
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const syncWithBackend = async (firebaseUser: FirebaseUser) => {
        try {
            const response = await apiClient.post('/auth/firebase-sync', {
                firebaseUid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
            });

            if (response.data.success && response.data.data?.user) {
                setUser(response.data.data.user);
                setFirebaseUser(firebaseUser);
            } else {
                throw new Error('Failed to sync user data');
            }
        } catch (error) {
            console.error('Backend sync error:', error);
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            // Sign in with Firebase
            await signInWithEmailAndPassword(auth, email, password);
            
            // Firebase auth state listener will handle backend sync
            return { success: true };
        } catch (error: any) {
            let errorMessage = 'Login failed';

            // Firebase error codes
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No user found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
                default:
                    errorMessage = error.message || errorMessage;
            }

            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            // Auth state listener will handle cleanup
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout on client even if Firebase fails
            setFirebaseUser(null);
            setUser(null);
            window.location.href = '/login';
        }
    };

    return {
        isAuthenticated: !!firebaseUser && !!user,
        isLoading,
        login,
        logout,
        user,
        firebaseUser
    };
};
```
