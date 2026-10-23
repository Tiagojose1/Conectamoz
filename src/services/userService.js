import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export async function followUser(currentUserId, targetUserId) {
  const currentUserRef = doc(db, "users", currentUserId);
  const targetUserRef = doc(db, "users", targetUserId);

  await updateDoc(currentUserRef, { following: arrayUnion(targetUserId) });
  await updateDoc(targetUserRef, { followers: arrayUnion(currentUserId) });
}

export async function unfollowUser(currentUserId, targetUserId) {
  const currentUserRef = doc(db, "users", currentUserId);
  const targetUserRef = doc(db, "users", targetUserId);

  await updateDoc(currentUserRef, { following: arrayRemove(targetUserId) });
  await updateDoc(targetUserRef, { followers: arrayRemove(currentUserId) });
}