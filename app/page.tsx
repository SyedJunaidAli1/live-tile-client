"use client";
import { useEffect } from "react";
import { socket } from "@/lib/socket";

export default function Home() {
  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      console.log("Connected:", socket.id);
    };

    socket.on("connect", handleConnect);

    socket.emit("hello", "Realtime is working!");

    return () => {
      socket.off("connect", handleConnect); // ✅ remove listener
      socket.disconnect();
    };
  }, []);

  return <div>Realtime App</div>;
}
