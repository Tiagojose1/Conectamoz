import { db } from "../firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";

export async function sendMessage(chatId, messageData) {
  return await addDoc(collection(db, "chats", chatId, "messages"), {
    ...messageData,
    createdAt: new Date()
  });
}

export function subscribeToMessages(chatId, callback) {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
}