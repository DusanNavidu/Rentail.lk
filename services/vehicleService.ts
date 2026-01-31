import { getAuth } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";
import * as FileSystem from 'expo-file-system/legacy';

const auth = getAuth();
const vehiclesCollection = collection(db, "vehicles");

const CLOUD_NAME = "dkige4fxm"; 
const UPLOAD_PRESET = "rentail_preset"; 
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Upload Function
const uploadToCloudinary = async (uri: string) => {
  if (!uri) return null;

  if (uri.startsWith('http')) {
      return uri; 
  }

  try {
    console.log("Starting Upload to:", CLOUDINARY_URL);

    const response = await FileSystem.uploadAsync(CLOUDINARY_URL, uri, {
      httpMethod: 'POST',
      uploadType: 1, // Multipart
      fieldName: 'file',
      parameters: {
        upload_preset: UPLOAD_PRESET,
        folder: 'vehicle_images',
      },
    });

    const data = JSON.parse(response.body);

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

export const addVehicle = async (
  imageUri: string,
  
  // 1. Vehicle Identity
  vehicleBrand: string,      // e.g., Nissan
  vehicleModel: string,      // e.g., GT-R R35
  vehicleCategory: string,   // e.g., Car
  vehicleType: string,       // e.g., Sports
  numberPlate: string,       // Full String (WP-CAB-1234)
  engineNumber: string,      // New
  chassisNumber: string,     // New
  
  // 2. Rental Info
  price: string,
  seats: string,
  
  // 3. Location (Map Data)
  location: {
    address: string;
    latitude: number;
    longitude: number;
  },
  
  // 4. Description (Combined)
  description: string,

  // 5. Owner Info (New)
  ownerName: string,
  ownerId: string,
  ownerContact: string,
  ownerEmail: string,
  ownerAddress: string
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");

  // Image Upload
  let imageUrl = "";
  if (imageUri) {
    imageUrl = (await uploadToCloudinary(imageUri)) || "";
  }

  // Save to Firestore
  await addDoc(vehiclesCollection, {
    imageUrl,

    // Identity
    vehicleBrand,
    vehicleModel,
    vehicleCategory,
    vehicleType,
    numberPlate,
    engineNumber,
    chassisNumber,

    // Rental Stats
    price: Number(price),
    seats: Number(seats),

    // Location Data (Stored separately for Maps)
    locationName: location.address,
    latitude: location.latitude,
    longitude: location.longitude,

    description,

    // Owner Details
    ownerName,
    ownerId,
    ownerContact,
    ownerEmail,
    ownerAddress,

    // App Stats (Default 0)
    likes: 0,
    rating: 0,

    // System Info
    userId: user.uid,
    createdAt: new Date().toISOString(),
  });
};

export const getAllVehicles = async () => {
  try {
    const q = query(vehiclesCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return [];
  }
};

export const deleteVehicle = async (id: string) => {
  const ref = doc(db, "vehicles", id);
  await deleteDoc(ref);
};

// 4. ✅ Get Single Vehicle (For Edit/View)
export const getVehicleById = async (id: string) => {
    const docSnap = await getDoc(doc(db, "vehicles", id));
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    throw new Error("Vehicle not found");
};

// 5. ✅ Update Vehicle
export const updateVehicle = async (id: string, updatedData: any, imageUri?: string) => {
    // අලුත් පින්තූරයක් තියෙනවා නම් Upload කරන්න
    if (imageUri) {
        const newImageUrl = await uploadToCloudinary(imageUri);
        updatedData.imageUrl = newImageUrl;
    }
    
    // Undefined දේවල් අයින් කරන්න JSON trick එක
    const cleanData = JSON.parse(JSON.stringify(updatedData));
    await updateDoc(doc(db, "vehicles", id), cleanData);
};