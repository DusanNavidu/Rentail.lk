import { getAuth } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase";
import * as FileSystem from 'expo-file-system/legacy';

const auth = getAuth();
const vehiclesCollection = collection(db, "vehicles");

const CLOUD_NAME = "dkige4fxm"; 
const UPLOAD_PRESET = "rentail_preset"; 
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const uploadToCloudinary = async (uri: string) => {
  if (!uri) return null;

  try {
    console.log("Starting Upload to:", CLOUDINARY_URL);

    const response = await FileSystem.uploadAsync(CLOUDINARY_URL, uri, {
      httpMethod: 'POST',
      uploadType: 1,
      fieldName: 'file',
      parameters: {
        upload_preset: UPLOAD_PRESET,
        folder: 'vehicle_images',
      },
    });

    const data = JSON.parse(response.body);

    // Error එකක් ආවොත් බලනවා
    if (data.error) {
      console.error("Cloudinary Error:", data.error.message);
      throw new Error(data.error.message);
    }

    console.log("Upload Success! URL:", data.secure_url);
    return data.secure_url;

  } catch (error) {
    console.error("Upload Failed:", error);
    throw error;
  }
};

// 2. Add Vehicle
export const addVehicle = async (
  imageUri: string,
  title: string,
  price: string,
  seats: string,
  location: string,
  description: string
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");

  let imageUrl = "";
  if (imageUri) {
    imageUrl = (await uploadToCloudinary(imageUri)) || "";
  }

  await addDoc(vehiclesCollection, {
    imageUrl,
    title,
    price: Number(price),
    seats: Number(seats),
    location,
    description,
    userId: user.uid,
    createdAt: new Date().toISOString(),
  });
};

// 3. Get All Vehicles
export const getAllVehicles = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");

  const q = query(
    vehiclesCollection,
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
    };
  });
};

// 4. Delete Vehicle
export const deleteVehicle = async (id: string) => {
  const ref = doc(db, "vehicles", id);
  await deleteDoc(ref);
};