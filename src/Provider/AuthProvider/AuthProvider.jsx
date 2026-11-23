import {
    GithubAuthProvider,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from 'firebase/auth';
import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';
import auth from '../../Firebase/firebase.config';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const googleProvider = new GoogleAuthProvider();
    const githubProvider = new GithubAuthProvider();

    // onAuthStateChanged only fires on success, so a failed attempt must
    // clear the loading flag itself or protected routes spin forever.
    const withLoading = (promise) =>
        promise.catch((error) => {
            setLoading(false);
            throw error;
        });

    // Create user with email and password
    const createUser = (email, password) => {
        setLoading(true);
        return withLoading(createUserWithEmailAndPassword(auth, email, password));
    };

    // update
    const updateUserProfile = (profileData) => {
        if (auth.currentUser) {
            return updateProfile(auth.currentUser, profileData)
                .then(() => {
                    setUser(auth.currentUser); 
                })
                .catch((error) => {
                    console.error("Profile update error:", error);
                });
        }
    };

    // Sign in user with email and password
    const signInUser = (email, password) => {
        setLoading(true);
        return withLoading(signInWithEmailAndPassword(auth, email, password));
    };

    // Google login
    const googleLogin = () => {
        setLoading(true);
        return withLoading(signInWithPopup(auth, googleProvider));
    };

    // GitHub login
    const githubLogin = () => {
        setLoading(true);
        return withLoading(signInWithPopup(auth, githubProvider));
    };

    // Logout
    const logout = () => {
        setLoading(true);
        return signOut(auth).then(() => {
            setUser(null);
            setLoading(false);
        });
    };

    // Observer for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const authValues = {
        createUser,
        signInUser,
        googleLogin,
        githubLogin,
        user,
        loading,
        logout,
        updateUserProfile,
    };

    return (
        <AuthContext.Provider value={authValues}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthProvider;
