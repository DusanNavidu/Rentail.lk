import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; 
import { getAuth } from "firebase/auth";

const bookingsCollection = collection(db, "bookings");
const auth = getAuth();

export const createBooking = async (
  vehicleId: string,
  vehicleDetails: any,
  startDate: string,
  endDate: string,
  totalPrice: number
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to book.");

  // --- 1. Prevent Self-Booking ---
  if (vehicleDetails.userId === user.uid) { // userId is usually the owner's ID in vehicle doc
    throw new Error("You cannot book your own vehicle.");
  }

  // --- 2. Prevent Past Dates ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison
  
  const start = new Date(startDate);
  if (start < today) {
    throw new Error("Cannot book for a past date.");
  }

  const end = new Date(endDate);
  if (end < start) {
    throw new Error("End date cannot be before start date.");
  }

  try {
    const docRef = await addDoc(bookingsCollection, {
      vehicleId,
      vehicleBrand: vehicleDetails.vehicleBrand,
      vehicleModel: vehicleDetails.vehicleModel,
      vehicleImage: vehicleDetails.imageUrl,
      
      // Owner Info
      ownerId: vehicleDetails.userId, // This should match the field name in your 'vehicles' collection (userId or ownerId)
      ownerName: vehicleDetails.ownerName,
      ownerContact: vehicleDetails.ownerContact,

      // Customer Info
      customerId: user.uid,
      customerName: user.displayName || "Customer",
      customerEmail: user.email,
      
      // Booking Details
      startDate,
      endDate,
      totalPrice,
      status: "pending", // pending, approved, rejected, completed
      createdAt: new Date().toISOString(),
    });
    
    console.log("Booking created successfully with ID: ", docRef.id);
    return docRef.id;

  } catch (error: any) {
    console.error("Error creating booking: ", error);
    // Re-throw the error so the UI can catch and display it
    throw new Error(error.message || "Failed to create booking.");
  }
};

export const getUserBookings = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    // Get bookings where the current user is the CUSTOMER
    const q = query(
      bookingsCollection, 
      where("customerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching user bookings: ", error);
    return [];
  }
};

// Optional: Get bookings for OWNER (To see who booked their cars)
export const getOwnerBookings = async () => {
    const user = auth.currentUser;
    if (!user) return [];
  
    try {
      const q = query(
        bookingsCollection, 
        where("ownerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching owner bookings: ", error);
      return [];
    }
  };