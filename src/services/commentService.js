import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, increment } from "firebase/firestore";

export async function addComment(postId, commentData) {
  const commentRef = await addDoc(collection(db, "comments"), {
    postId,
    ...commentData,
    createdAt: new Date()
  });

  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, { commentsCount: increment(1) });

  return commentRef;
}

export async function getCommentsByPost(postId) {
  const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}