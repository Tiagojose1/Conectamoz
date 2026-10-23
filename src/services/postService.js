import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  orderBy, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";

export async function createPost(postData) {
  return await addDoc(collection(db, "posts"), {
    ...postData,
    likes: [],
    commentsCount: 0,
    createdAt: new Date()
  });
}

export async function getPosts() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function toggleLikePost(postId, userId, isLiked) {
  const postRef = doc(db, "posts", postId);
  if (isLiked) {
    await updateDoc(postRef, { likes: arrayRemove(userId) });
  } else {
    await updateDoc(postRef, { likes: arrayUnion(userId) });
  }
}