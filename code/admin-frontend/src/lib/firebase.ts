// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBf-ZdT6dz-39syOFnvWVzByU5B1Dhn9ws",
    authDomain: "yp-group-23.firebaseapp.com",
    projectId: "yp-group-23",
    databaseURL: "https://yp-group-23-default-rtdb.asia-southeast1.firebasedatabase.app/",
    storageBucket: "yp-group-23.firebasestorage.app",
    messagingSenderId: "422453667678",
    appId: "1:422453667678:web:d5c5fdcc005fb2354591cf",
    measurementId: "G-D113LTZLW4"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app)


export { database }