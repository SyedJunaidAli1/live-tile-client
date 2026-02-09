"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface Tile {
  id: number;
  owner_id: string | null;
  color: string | null;
  claimed_at: string | null;
}

export default function Home() {
  const [liveTiles, setLiveTiles] = useState<Tile[]>([]);

  const [userColor] = useState(() => {
    if (typeof window === "undefined") return null;

    let color = localStorage.getItem("user-color");

    if (!color) {
      color = `hsl(${Math.random() * 360},70%,60%)`;
      localStorage.setItem("user-color", color);
    }

    return color;
  });

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

  // ✅ Fetch tiles (initial snapshot only)
  const fetchTiles = async (): Promise<Tile[]> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SOCKET_API_ENDPOINT}/tiles`,
    );

    if (!res.ok) {
      throw new Error("Failed to fetch tiles");
    }

    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["tiles"],
    queryFn: fetchTiles,
    staleTime: Infinity,
    gcTime: Infinity,
    // ⭐ CRITICAL for realtime apps
    refetchOnWindowFocus: false,
  });

  // ✅ Sync query → live state ONCE
  useEffect(() => {
    if (data) {
      setLiveTiles(data);
    }
  }, [data]);

  // ✅ Socket lifecycle
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("Connected:", socket.id);
    };

    const handleTileUpdate = (updatedTile: Tile) => {
      setLiveTiles((prev) => {
        const index = prev.findIndex((t) => t.id === updatedTile.id);
        if (index === -1) return prev;

        const copy = [...prev];
        copy[index] = updatedTile;
        return copy;
      });
    };

    socket.on("connect", handleConnect);
    socket.on("tile_updated", handleTileUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("tile_updated", handleTileUpdate);
      socket.disconnect();
    };
  }, []);

  // ✅ Claim tile
  const handleClick = (tile: Tile) => {
    if (!socket.connected) return;
    if (tile.owner_id || !userId || !userColor) return; // prevent double click

    // ✅ OPTIMISTIC UPDATE
    setLiveTiles((prev) =>
      prev.map((t) =>
        t.id === tile.id
          ? {
              ...t,
              owner_id: userId,
              color: userColor,
              claimed_at: new Date().toISOString(),
            }
          : t,
      ),
    );

    // ✅ tell server
    socket.emit("claim_tile", {
      tileId: tile.id,
      userId,
      color: userColor,
    });
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Please wait a second The server takes time to wake up since it's
        deployed on the free plan of Render...
      </div>
    );
  }

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
        {liveTiles.map((tile) => (
          <motion.div
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
                  : "cursor-pointer"
              }
            `}
            style={{
              backgroundColor: tile.color || "#e5e7eb",
            }}
            initial={{ scale: 1 }}
            animate={{ scale: tile.owner_id ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.25 }}
          />
        ))}
      </div>
    </div>
  );
}
