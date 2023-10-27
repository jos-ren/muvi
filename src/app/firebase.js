import { initializeApp } from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBp941xwMHijzUbeF2InHGnUTd7eEoTKaE",
    authDomain: "muvi-9fce0.firebaseapp.com",
    databaseURL: "https://muvi-9fce0-default-rtdb.firebaseio.com",
    projectId: "muvi-9fce0",
    storageBucket: "muvi-9fce0.appspot.com",
    messagingSenderId: "378829729747",
    appId: "1:378829729747:web:9a89da8b3e075ce8394926",
    measurementId: "G-B6E6DMB770"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp); // Initialize Firestore
