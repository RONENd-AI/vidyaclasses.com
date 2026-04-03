const firebaseConfig = {
    apiKey: "AIzaSyBWV2sgzBcJG3lFNFLdTebHR5K9D12o29g",
    authDomain: "vidyaclasses-6de90.firebaseapp.com",
    projectId: "vidyaclasses-6de90",
    storageBucket: "vidyaclasses-6de90.firebasestorage.app",
    messagingSenderId: "116164197592",
    appId: "1:116164197592:web:1dd31b589daa5fe7b2ebad",
    measurementId: "G-JTPGG5D32G"
};

try {
    firebase.initializeApp(firebaseConfig);
    window.auth = firebase.auth();
    window.db = firebase.firestore();
} catch (error) {
    console.error("Firebase Initialization Error:", error);
}