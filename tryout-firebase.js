// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvQeqhCw-t5fIrxcZZ8rVBhlAm6mhiPEQ",
  authDomain: "generic-user-server.firebaseapp.com",
  projectId: "generic-user-server",
  storageBucket: "generic-user-server.appspot.com",
  messagingSenderId: "362078840105",
  appId: "1:362078840105:web:74af500e471ab4ae4a8338",
  measurementId: "G-GY4QHZFGSR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
