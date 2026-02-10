import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
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
  if (!user) {
      console.error("Service Error: User not logged in");
      throw new Error("Please login to book.");
  }

  try {
    const bookingPayload = {
      vehicleId,
      vehicleBrand: vehicleDetails.vehicleBrand,
      vehicleModel: vehicleDetails.vehicleModel,
      vehicleImage: vehicleDetails.imageUrl,
      ownerId: vehicleDetails.userId || "unknown",
      customerId: user.uid,
      customerName: user.displayName || "Customer",
      customerEmail: user.email,
      startDate,
      endDate,
      totalPrice,
      status: "pending",
      createdAt: new Date().toISOString(),
    };


    const docRef = await addDoc(bookingsCollection, bookingPayload);
    
    return docRef.id;

  } catch (error: any) {
    console.error("Service Error: Create booking failed:", error);
    throw new Error("Booking failed");
  }
};

export const getUserBookings = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      bookingsCollection, 
      where("customerId", "==", user.uid)
    );
    const snapshot = await getDocs(q);
    

    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Service Error: Fetching bookings failed:", error);
    return [];
  }
};

export const updateBookingStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status: status
    });
    return true;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

export const getOwnerBookings = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      bookingsCollection, 
      where("ownerId", "==", user.uid)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
  } catch (error) {
    console.error("Service Error: Fetching owner bookings failed:", error);
    return [];
  }
};

export const deleteBooking = async (id: string) => {
  try {
    const bookingRef = doc(db, "bookings", id);
    await deleteDoc(bookingRef);
    console.log("Booking deleted:", id);
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
};

export const getBookingById = async (bookingId: string) => {
  try {
    const docRef = doc(db, "bookings", bookingId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Booking not found");
    }
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
};

export const updateBooking = async (
  bookingId: string, 
  startDate: string, 
  endDate: string, 
  totalPrice: number
) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    
    await updateDoc(bookingRef, {
      startDate,
      endDate,
      totalPrice,
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating booking:", error);
    throw error;
  }
};