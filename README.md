# ⚡ Live Tile Board

A playful real-time web app where multiple users can claim tiles on a shared board and see updates instantly across all connected clients.

Built to demonstrate real-time communication, backend conflict handling, and interactive UI design.

---

## 🚀 Live Demo

👉 https://live-tile-client.vercel.app

---

## 🧠 Overview

Live Tile Board is a multiplayer interactive grid that allows users to capture tiles in real time. When a tile is claimed, the update is broadcast instantly so every connected user sees the change without refreshing.

The system is designed to safely handle simultaneous clicks by multiple users using atomic database updates.

---

## ✨ Features

✅ Real-time tile updates using WebSockets  
✅ Multiplayer interaction across browser sessions  
✅ Conflict-safe tile claiming (prevents double ownership)  
✅ Responsive grid layout for desktop and mobile  
✅ Clean and minimal UI focused on usability

---

## ⚙️ Tech Stack

**Frontend**

- Next.js
- React
- Tailwind CSS
- Socket.IO Client

**Backend**

- Node.js
- Express
- Socket.IO

**Database**

- PostgreSQL (Neon)

---

## 🔥 How Real-Time Sync Works

1. A user clicks a tile.
2. The client emits a WebSocket event to the server.
3. The server attempts an atomic SQL update:

```sql
UPDATE tiles
SET owner_id = $1
WHERE id = $2
AND owner_id IS NULL;
```
