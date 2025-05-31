// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBf-ZdT6dz-39syOFnvWVzByU5B1Dhn9ws",
  authDomain: "yp-group-23.firebaseapp.com",
  databaseURL: "https://yp-group-23-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "yp-group-23",
  storageBucket: "yp-group-23.firebasestorage.app",
  messagingSenderId: "422453667678",
  appId: "1:422453667678:web:d5c5fdcc005fb2354591cf",
  measurementId: "G-D113LTZLW4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };

/*








*/