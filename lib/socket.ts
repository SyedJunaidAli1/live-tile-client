import { io } from "socket.io-client";

// const socket = io("http://localhost:5000");
export const socket = io(process.env.NEXT_PUBLIC_SOCKET_API_ENDPOINT, {
  autoConnect: false,
});

socket.emit("hello", "Realtime is working!");
