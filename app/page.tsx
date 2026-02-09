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
    <div className="min-h-screen flex flex-col items-center py-6 px-2">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
        Live Tile Board
      </h1>

      <p className="text-gray-500 mb-4 text-center text-sm sm:text-base">
        Claim a tile before someone else does 👀
      </p>

      <div
        className="
          grid
          gap-2
          justify-center
          w-full
          max-w-[420px]
          sm:max-w-none
          grid-cols-[repeat(auto-fit,minmax(32px,1fr))]
        "
      >
        {tiles.map((tile) => (
          <div
            key={tile.id}
            onClick={() => {
              if (!tile.owner_id) handleClick(tile);
            }}
            className={`
              aspect-square
              rounded-md
              transition-all duration-150
              ${
                tile.owner_id
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:scale-105"
              }
            `}
            style={{
              backgroundColor: tile.color || "#e5e7eb",
            }}
          />
        ))}
      </div>
    </div>
  );
}
