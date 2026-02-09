"use client";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export default function Home() {
  const [tiles, setTiles] = useState([]);

  // Stable user id
  const [userId] = useState(() => {
    if (typeof window === "undefined") return null;

    let id = localStorage.getItem("uid");

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("uid", id);
    }

    return id;
  });

  // SOCKET LIFECYCLE
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("Connected:", socket.id);
    };

    socket.on("connect", handleConnect);

    socket.on("tile_updated", (updatedTile) => {
      setTiles((prev) =>
        prev.map((tile) => (tile.id === updatedTile.id ? updatedTile : tile)),
      );
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("tile_updated");
      socket.disconnect();
    };
  }, []);

  // FETCH ONCE
  useEffect(() => {
    async function fetchTiles() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_API_ENDPOINT}/tiles`,
      );

      const data = await res.json();
      setTiles(data);
    }

    fetchTiles();
  }, []);

  // CLICK HANDLER (VERY CLEAN)
  const handleClick = (tile) => {
    console.log("Clicked tile:", tile);
    socket.emit("claim_tile", {
      tileId: tile.id,
      userId,
    });
  };

  return (
    <div className="grid gap-2 grid-cols-30 px-2">
      {tiles.map((tile) => (
        <div
          key={tile.id}
          onClick={() => handleClick(tile)}
          className="h-10 w-10 cursor-pointer"
          style={{
            backgroundColor: tile.color || "#ddd",
          }}
        />
      ))}
    </div>
  );
}
