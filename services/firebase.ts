import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDd5VW3dARtcE2y4mbdgH3G8--qPPcw1uU",
  authDomain: "rentail-app-b08ea.firebaseapp.com",
  projectId: "rentail-app-b08ea",
  storageBucket: "rentail-app-b08ea.firebasestorage.app",
  messagingSenderId: "636379772271",
  appId: "1:636379772271:web:09d9a0fcada7aa7e05e49a",
  measurementId: "G-74GL3J3ZS5"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);