import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const googleLogin = async (idToken: string) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    
    const result = await signInWithCredential(auth, credential);
    const user = result.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        name: user.displayName,
        email: user.email,
        uid: user.uid,
        role: "user",
        photoUrl: user.photoURL,
        createdAt: new Date().toISOString(),
      });
    }

    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth)
  AsyncStorage.clear()
  return
}

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCred.user, {
    displayName: name,
    photoURL: ""
  })

  setDoc(doc(db, "users", userCred.user.uid), {
    name, // name: name
    role: "",
    email,
    createdAt: new Date()
  })
  return userCred.user
}
