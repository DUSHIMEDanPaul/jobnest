// Import Firebase modules properly
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuhDEg07QtAUwrSwArCehV0Rh0LXOvjCA",
  authDomain: "jobnest-83ff5.firebaseapp.com",
  projectId: "jobnest-83ff5",
  storageBucket: "jobnest-83ff5.appspot.com", // Fixed incorrect domain
  messagingSenderId: "1059142940358",
  appId: "1:1059142940358:web:119d9569112cc2462bc9c7",
  measurementId: "G-YMN379TDW6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Correctly initializing Firebase Auth
const analytics = getAnalytics(app);

// Export auth properly
export default auth;
