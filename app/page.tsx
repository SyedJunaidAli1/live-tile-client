"use client";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export default function Home() {
  const [tiles, setTiles] = useState([]);

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

  useEffect(() => {
    async function fetchTiles() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_API_ENDPOINT}/tiles`);

      const data = await res.json();

      setTiles(data);
    }

    fetchTiles();
  }, []);

  return (
    <div>
      Realtime App
      {tiles.map((tile: any) => (
        <div key={tile.id}>
          <p>{tile.color}</p>
          <p>{tile.id}</p>
          <p>{tile.owner_id}</p>
        </div>
      ))}
    </div>
  );
}
