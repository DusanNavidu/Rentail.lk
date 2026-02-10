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
  where
} from "firebase/firestore";

// 1. Chat ID එක හදන එක
export const getChatId = (currentUserId: string, otherUserId: string) => {
  const sortedIds = [currentUserId, otherUserId].sort();
  return sortedIds.join("_");
};

// 2. Chat එක පටන් ගන්න එක
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

// 3. Message යවන එක
export const sendMessage = async (chatId: string, text: string, senderId: string) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const chatRef = doc(db, "chats", chatId);

  await addDoc(messagesRef, {
    text,
    senderId,
    createdAt: serverTimestamp(),
  });

  await setDoc(chatRef, {
    lastMessage: text,
    lastMessageTimestamp: serverTimestamp(),
  }, { merge: true });
};

// 4. Real-time Messages ගන්න එක
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

// 5. User ගේ Chat List එක ගන්න එක (Inbox එකට)
export const getUserChats = (userId: string, callback: (chats: any[]) => void) => {
  const chatsRef = collection(db, "chats");
  // participants array එකේ මගේ ID එක තියෙන ඒවා විතරක් ගන්න
  const q = query(chatsRef, where("participants", "array-contains", userId), orderBy("lastMessageTimestamp", "desc"));

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(chats);
  });
};

// 6. User විස්තර ගන්න එක (නම සහ පින්තූරය පෙන්වන්න)
export const getUserDetails = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};