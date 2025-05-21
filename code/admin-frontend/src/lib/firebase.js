// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8",
  authDomain: "smartvehicle-3yp.firebaseapp.com",
  databaseURL:
    "https://smartvehicle-3yp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartvehicle-3yp",
  storageBucket: "smartvehicle-3yp.appspot.com",
  messagingSenderId: "44322736365",
  appId: "1:44322736365:web:3cc7fa2f44c1df10a8eeb7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };
