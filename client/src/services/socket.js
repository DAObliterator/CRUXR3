// socket.js
import io from "socket.io-client";


const apiUrl =
  import.meta.env.VITE_ENV === "development"
    ? import.meta.env.VITE_API_DEV
    : import.meta.env.VITE_API_PROD;
// Create and export the socket instance
const socket = io(apiUrl, {
  withCredentials: true,
  auth: {
    name:
      window.sessionStorage.getItem("name") &&
      window.sessionStorage.getItem("name"),
    roomId: window.sessionStorage.getItem(
      window.sessionStorage.getItem("podcastTopic")
    ),
  },
});

export default socket;
