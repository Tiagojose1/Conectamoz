import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, where } from "firebase/firestore";

export async function createStory(storyData) {
  return await addDoc(collection(db, "stories"), {
    ...storyData,
    createdAt: new Date()
  });
}

export async function getActiveStories() {
  const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}