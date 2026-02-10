import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp, 
  Timestamp,
  where,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import * as FileSystem from 'expo-file-system/legacy';

// --- ☁️ CLOUDINARY CONFIGURATION ---
const CLOUD_NAME = "dkige4fxm"; 
const UPLOAD_PRESET = "rentail_preset"; 
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

// --- 📤 UPLOAD FUNCTION (Images & Audio) ---
export const uploadToCloudinary = async (uri: string, resourceType: 'image' | 'video' | 'auto' = 'auto') => {
  if (!uri) return null;

  try {
    const response = await FileSystem.uploadAsync(CLOUDINARY_URL, uri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'file',
      parameters: {
        upload_preset: UPLOAD_PRESET,
        resource_type: resourceType,
      },
    });

    const data = JSON.parse(response.body);

    if (data.error) {
      console.error("Cloudinary Error:", data.error.message);
      return null;
    }

    return data.secure_url;
  } catch (error) {
    console.error("Upload Failed:", error);
    return null;
  }
};

// --- 💬 CHAT LOGIC ---

// 1. Chat ID Generator
export const getChatId = (currentUserId: string, otherUserId: string) => {
  const sortedIds = [currentUserId, otherUserId].sort();
  return sortedIds.join("_");
};

// 2. Initialize Chat Room
export const initializeChat = async (currentUserId: string, otherUserId: string) => {
  const chatId = getChatId(currentUserId, otherUserId);
  const chatRef = doc(db, "chats", chatId);
  
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [currentUserId, otherUserId],
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageTimestamp: serverTimestamp(),
    });
  }
  return chatId;
};

// 3. Send Message (Supports Text, Image, Audio)
export const sendMessage = async (
  chatId: string, 
  content: string, 
  senderId: string, 
  type: 'text' | 'image' | 'audio' = 'text'
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const chatRef = doc(db, "chats", chatId);

  let lastMessagePreview = content;
  if (type === 'image') lastMessagePreview = '📷 Photo';
  if (type === 'audio') lastMessagePreview = '🎤 Voice Message';

  try {
    await addDoc(messagesRef, {
      text: content,
      senderId,
      type, 
      createdAt: serverTimestamp(),
    });

    await setDoc(chatRef, {
      lastMessage: lastMessagePreview,
      lastMessageTimestamp: serverTimestamp(),
    }, { merge: true });

  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// 4. Real-time Message Listener
export const subscribeToMessages = (chatId: string, callback: (messages: any[]) => void) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      _id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt ? (doc.data().createdAt as Timestamp).toDate() : new Date(),
    }));
    callback(messages);
  });

  return unsubscribe;
};

// 5. Get User's Chat List (For Inbox)
export const getUserChats = (userId: string, callback: (chats: any[]) => void) => {
  const chatsRef = collection(db, "chats");
  
  const q = query(
    chatsRef, 
    where("participants", "array-contains", userId), 
    orderBy("lastMessageTimestamp", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(chats);
  });
};

// 6. Get Other User Details
export const getUserDetails = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};

// --- 📞 VOICE CALL LOGIC ---

// 7. Start Call (Caller Side)
export const startVoiceCall = async (callerId: string, receiverId: string, callerName: string, callerPhoto: string) => {
  const callId = `${callerId}_${receiverId}`; // Unique ID based on user pair
  const callDoc = doc(db, "calls", callId);
  
  // Set status to 'ringing' so receiver's listener picks it up
  await setDoc(callDoc, {
    callerId,
    callerName,
    callerPhoto,
    receiverId,
    status: "ringing", 
    createdAt: serverTimestamp(),
  });

  return callId;
};

// 8. End Call (Both Sides)
export const endVoiceCall = async (callerId: string, receiverId: string) => {
  const callId = `${callerId}_${receiverId}`;
  try {
      await deleteDoc(doc(db, "calls", callId));
  } catch (error) {
      console.log("Call ended or document already deleted");
  }
};

// 9. Listen for Incoming Calls (Receiver Side)
export const listenForIncomingCalls = (userId: string, callback: (call: any) => void) => {
  const callsRef = collection(db, "calls");
  // Only listen for calls where I am the receiver AND status is 'ringing'
  const q = query(callsRef, where("receiverId", "==", userId), where("status", "==", "ringing"));

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const callData = snapshot.docs[0].data();
      // Pass the call details to the UI to show the Incoming Call Screen
      callback({ id: snapshot.docs[0].id, ...callData });
    } else {
      callback(null); // No incoming call
    }
  });
};

// 10. Send Call Log to Chat (Call Log Display)
export const sendCallLog = async (chatId: string, senderId: string, status: "Voice Call" | "Missed Call") => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const chatRef = doc(db, "chats", chatId);

  // Add a system message to the chat
  await addDoc(messagesRef, {
    text: status, 
    senderId,
    type: 'call', // Special type for UI rendering
    createdAt: serverTimestamp(),
  });

  // Update the inbox preview
  await setDoc(chatRef, {
    lastMessage: status === "Missed Call" ? "📞 Missed Call" : "📞 Voice Call",
    lastMessageTimestamp: serverTimestamp(),
  }, { merge: true });
};