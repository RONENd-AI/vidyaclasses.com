// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWV2sgzBcJG3lFNFLdTebHR5K9D12o29g",
  authDomain: "vidyaclasses-6de90.firebaseapp.com",
  projectId: "vidyaclasses-6de90",
  storageBucket: "vidyaclasses-6de90.firebasestorage.app",
  messagingSenderId: "116164197592",
  appId: "1:116164197592:web:1dd31b589daa5fe7b2ebad",
  measurementId: "G-JTPGG5D32G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
