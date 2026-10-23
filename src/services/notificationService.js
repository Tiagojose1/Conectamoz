import { db } from "../firebase";
import { collection, addDoc, query, where, orderBy, getDocs } from "firebase/firestore";

export async function sendNotification(notificationData) {
  return await addDoc(collection(db, "notifications"), {
    ...notificationData,
    read: false,
    createdAt: new Date()
  });
}

export async function getUserNotifications(userId) {
  const q = query(collection(db, "notifications"), where("targetUserId", "==", userId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}