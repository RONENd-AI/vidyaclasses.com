import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB181F0U5tN0A2Bgej3KyZAAhdz66vjdc0",
  authDomain: "com-service-94cd6.firebaseapp.com",
  projectId: "com-service-94cd6",
  storageBucket: "com-service-94cd6.firebasestorage.app",
  messagingSenderId: "883384574146",
  appId: "1:883384574146:web:d8e4bc26641e4944b79b5b",
  measurementId: "G-VK1KPGYJHH"
};

let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase Initialization Error:", error);
}

export { auth, db };
