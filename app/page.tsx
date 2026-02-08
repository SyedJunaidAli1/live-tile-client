"use client";
import { socket } from "@/lib/socket";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    socket.connect();

    socket.emit("hello", "Realtime is working!");

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between sm:items-start">
        hello world
      </main>
    </div>
  );
}
