export function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Agora mesmo";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`;
  return `${Math.floor(diffInSeconds / 86400)} d`;
}