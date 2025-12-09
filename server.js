  import express from "express";
  import multer from "multer";
  import cors from "cors";
  import pkg from "pg";
  import bcrypt from "bcrypt";
  import dotenv from "dotenv";
  import path from "path";
  import { fileURLToPath } from "url";
  import http from "http";
  import { Server } from "socket.io";
  import crypto from "crypto";
  import cookieParser from "cookie-parser";
  import {
    createInitialGameState,
    updatePlayerPosition,
    applyKick,
    stepGame,
    usePowerup,
    discardPowerup
  } from "./src/Game/game_state.js";

  dotenv.config();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const PORT = process.env.PORT || 3000;
  const { Pool } = pkg; 
  let host;
  let databaseConfig;
  let rooms = {};
  let tokenStorage = {};
  let competitiveQueue = [];
  let casualQueue = [];
  let usernameToSocketId = {};

  const DEFAULT_SETTINGS = {
    matchDurationSec: 180,
    goalLimit: 5
  };

  const PHYSICS_TICK_MS = 1000 / 60;

  if (process.env.FLY_APP_NAME) {
    host = "0.0.0.0";
    databaseConfig = { connectionString: process.env.DATABASE_URL };
  } else {
    host = "localhost";
    let { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT } = process.env;
    databaseConfig = {
      user: PGUSER,
      password: PGPASSWORD,
      database: PGDATABASE,
      host: PGHOST,
      port: PGPORT
    };
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "uploads"));
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });

  import fs from "fs";
  if (!fs.existsSync(path.join(__dirname, "uploads"))) {
    fs.mkdirSync(path.join(__dirname, "uploads"));
  }


  let app = express();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://soccer-super-stars.fly.dev"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  app.use(cors({
    origin: ["http://localhost:5173", "https://soccer-super-stars.fly.dev"],
    methods: ["GET","POST","OPTIONS"],
    allowedHeaders: ["Content-Type", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    credentials: true
  }));
  app.use(cookieParser());
  app.use(express.json());

  const pool = new Pool(databaseConfig);

  (async () => {
      try {
          await pool.query("SELECT NOW()");
          console.log("Database connection verified.");
      } catch (err) {
          console.error("Database connection failed:", err);
          process.exit(1);
      }
  })();

  function makeToken() {
    return crypto.randomBytes(32).toString("hex");
  }


  let cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
  };


  function generateRoomCode() {
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // for debugging
  function printRooms() {
    for (let [roomId, sockets] of Object.entries(rooms)) {
      console.log(roomId);
      for (let [socketId, socket] of Object.entries(sockets)) {
        console.log(`\t${socketId}`);
      }
    }
  }

  app.get("/api/leaderboard", async (req, res) => {
      try {
          const result = await pool.query(`
              SELECT username, score
              FROM users
              ORDER BY score DESC
              LIMIT 50
          `);

          return res.json({ players: result.rows });
      } catch (err) {
          console.error("Leaderboard error:", err);
          return res.status(500).json({ message: "Server error loading leaderboard" });
      }
  });

  app.get("/api/profileData", async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token || !tokenStorage[token]) {
        return res.json({ success: false });
      }

      const username = tokenStorage[token];

      const result = await pool.query(
        "SELECT username FROM users WHERE username = $1",
        [username]
      );

      if (result.rows.length === 0)
      return res.json({ success: false });

    return res.json({
      success: true,
      playername: result.rows[0].username
    });

    } catch (err) {
      console.error("Leaderboard error:", err);
      return res.status(500).json({ message: "Server error loading leaderboard" });
    }
  });

  app.post("/create", (req, res) => {
    const roomId = generateRoomCode();
    return res.json({ roomId });
  });

  app.get("/api/validate-token", (req, res) => {
      try {
        const { token } = req.cookies;
        
        console.log("Validating token:", token);
        console.log("Available tokens:", Object.keys(tokenStorage));

        if (token && tokenStorage[token]) {
            return res.json({ 
              valid: true, 
              username: tokenStorage[token] 
            });
        }

        return res.json({ valid: false });
      } catch (error) {
        console.error("Token validation error:", error);
        return res.json({ valid: false });
      }
  });

  app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    try {
      const testResult = await pool.query(`SELECT * FROM users`);
      console.log("THIS IS A TEST:\n\n\n\n", testResult.rows);

      const existing = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashed = await bcrypt.hash(password, 10);
      await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashed]);

      const token = makeToken();
      tokenStorage[token] = username;

      res.cookie("token", token, cookieOptions);
      return res.status(201).json({ message: "User registered & logged in" });
    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    try {
      const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      let token = makeToken();
      tokenStorage[token] = username;

      res.cookie("token", token, cookieOptions);
      return res.status(200).json({
        message: "Login successful",
        user: { username: user.username },
        token: token
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/match-result", async (req, res) => {
  const { token } = req.cookies;
  const { roomId, won } = req.body;

  if (!token || !tokenStorage[token]) {
    return res.status(401).json({ message: "Not logged in" });
  }

  if (!roomId || typeof won !== "boolean") {
    return res.status(400).json({ message: "Invalid data" });
  }

  const username = tokenStorage[token];
  const upperRoomId = roomId.toUpperCase();
  const room = rooms[upperRoomId];

  if (!room || !room.isCompetitive) {
    return res.json({ message: "Not a competitive match or room not found" });
  }

  try {
    const scoreChange = won ? 5 : -5;
    
    await pool.query(
      "UPDATE users SET score = score + $1 WHERE username = $2",
      [scoreChange, username]
    );

    const result = await pool.query(
      "SELECT score FROM users WHERE username = $1",
      [username]
    );

    const newScore = result.rows[0]?.score || 0;

    console.log(`Updated score for ${username}: ${won ? "+" : ""}${scoreChange} (new total: ${newScore})`);

    return res.json({ 
      success: true, 
      scoreChange,
      newScore 
    });
  } catch (err) {
    console.error("Score update error:", err);
    return res.status(500).json({ message: "Server error updating score" });
  }
});


  let authorize = (req, res, next) => {
    let { token } = req.cookies;
    console.log(token, tokenStorage);
    if (token === undefined || !tokenStorage.hasOwnProperty(token)) {
      return res.sendStatus(403); // TODO
    }
    next();
  };

  app.post("/api/logout", (req, res) => {
    const { token } = req.cookies;

    if (!token || !tokenStorage[token]) {
      return res.sendStatus(400);
    }

    delete tokenStorage[token];
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      expires: new Date(0)
    });
    return res.sendStatus(200);
  });

  app.post("/api/upload-avatar", authorize, upload.single("avatar"), async (req, res) => {
    const { token } = req.cookies;
    const username = tokenStorage[token];

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = `/uploads/${req.file.filename}`;

    try {
        await pool.query(
            "UPDATE users SET avatar_url = $1 WHERE username = $2",
            [filePath, username]
        );

        return res.json({ message: "Avatar updated", avatar: filePath });
    } catch (err) {
        console.error("Avatar update error:", err);
        return res.status(500).json({ message: "Server error saving avatar" });
    }
});

  function tryMatchCompetitivePlayers() {
    if (competitiveQueue.length < 2) return null;

    const p1 = competitiveQueue.shift();
    const p2 = competitiveQueue.shift();
    const roomId = generateRoomCode();

    rooms[roomId] = {
      settings: { matchDurationSec: 180, goalLimit: 5 },
      players: {},
      game: null,
      isCompetitive: true
    };

    return { roomId, p1, p2 };
  }

  function tryMatchCasualPlayers() {
    if (casualQueue.length < 2) return null;

    const p1 = casualQueue.shift();
    const p2 = casualQueue.shift();

    const roomId = generateRoomCode();

    rooms[roomId] = {
      settings: { matchDurationSec: 180, goalLimit: 5 },
      players: {},
      game: null,
      isCompetitive: false
    };

    return { roomId, p1, p2 };
  }

  app.post("/join-casual", authorize, async (req, res) => {
    const { token } = req.cookies;
    const username = tokenStorage[token];

    if (!username) {
      return res.status(401).json({ message: "Not logged in" });
    }

    if (casualQueue.find(p => p.username === username)) {
      return res.json({ matched: false });
    }

    casualQueue.push({ username });
    console.log("Casual queue:", casualQueue);

    const match = tryMatchCasualPlayers();

    if (match) {
      const { roomId, p1, p2 } = match;
      const p1SocketId = usernameToSocketId[p1.username];
      const p2SocketId = usernameToSocketId[p2.username];

      if (!p1SocketId || !p2SocketId) {
        console.warn("Sockets not ready yet");
        casualQueue.push(p1, p2);
        return res.json({ matched: false });
      }

      const p1Socket = io.sockets.sockets.get(p1SocketId);
      const p2Socket = io.sockets.sockets.get(p2SocketId);
      
      if (p1Socket) p1Socket.join(roomId);
      if (p2Socket) p2Socket.join(roomId);

      rooms[roomId].players = {
        [p1SocketId]: { id: p1SocketId, username: p1.username, isHost: true },
        [p2SocketId]: { id: p2SocketId, username: p2.username, isHost: false }
      };

      rooms[roomId].game = createInitialGameState(rooms[roomId]);

      io.to(p1SocketId).emit("casualMatched", {
        roomId,
        you: p1.username,
        opponent: p2.username,
        isHost: true
      });
      io.to(p2SocketId).emit("casualMatched", {
        roomId,
        you: p2.username,
        opponent: p1.username,
        isHost: false
      });

      setTimeout(() => {
        io.to(p1SocketId).emit("gameStarted", {
          roomId: roomId,
          settings: rooms[roomId].settings
        });
        io.to(p2SocketId).emit("gameStarted", {
          roomId: roomId,
          settings: rooms[roomId].settings
        });
      }, 3000);

      return res.json({ matched: true, roomId });
    }

    return res.json({ matched: false });
  });

  app.post("/join-competitive", authorize, async (req, res) => {
    const { token } = req.cookies;
    const username = tokenStorage[token];

    if (!username) {
      return res.status(401).json({ message: "Not logged in" });
    }

    if (competitiveQueue.find(p => p.username === username)) {
      return res.json({ matched: false });
    }

    competitiveQueue.push({ username });
    console.log("Competitive queue:", competitiveQueue);

    const match = tryMatchCompetitivePlayers();

    if (match) {
      const { roomId, p1, p2 } = match;
      const p1SocketId = usernameToSocketId[p1.username];
      const p2SocketId = usernameToSocketId[p2.username];

      if (!p1SocketId || !p2SocketId) {
        console.warn("Sockets not ready yet");
        competitiveQueue.push(p1, p2);
        return res.json({ matched: false });
      }

      const p1Socket = io.sockets.sockets.get(p1SocketId);
      const p2Socket = io.sockets.sockets.get(p2SocketId);
      
      if (p1Socket) p1Socket.join(roomId);
      if (p2Socket) p2Socket.join(roomId);

      rooms[roomId].players = {
        [p1SocketId]: { id: p1SocketId, username: p1.username, isHost: true },
        [p2SocketId]: { id: p2SocketId, username: p2.username, isHost: false }
      };

      rooms[roomId].game = createInitialGameState(rooms[roomId]);

      io.to(p1SocketId).emit("competitiveMatched", {
        roomId,
        you: p1.username,
        opponent: p2.username,
        isHost: true
      });
      io.to(p2SocketId).emit("competitiveMatched", {
        roomId,
        you: p2.username,
        opponent: p1.username,
        isHost: false
      });

      setTimeout(() => {
        io.to(p1SocketId).emit("gameStarted", {
          roomId: roomId,
          settings: rooms[roomId].settings
        });
        io.to(p2SocketId).emit("gameStarted", {
          roomId: roomId,
          settings: rooms[roomId].settings
        });
      }, 3000);

      return res.json({ matched: true, roomId });
    }

    return res.json({ matched: false });
  });


  app.get("/public", (req, res) => res.send("THIS IS PUBLIC\n"));
  app.get("/private", authorize, (req, res) => res.send("THIS IS PRIVATE\n"));
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.use(express.static(path.join(__dirname, "dist")));

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    const sendLobbyState = (roomId) => {
      const room = rooms[roomId];

      if (!room) {
        return;
      }

      const playersArray = Object.values(room.players).map((player) => {
        return {
          id: player.id,
          username: player.username || "Guest",
          isHost: player.isHost
        };
      });


      io.to(roomId).emit("lobbyState", {
        roomId: roomId,
        settings: room.settings,
        players: playersArray
      });
    }

    socket.on("joinRoom", ({ roomId, isHost }) => {
      if (!roomId) {
        return;
      }

      const upperRoomId = roomId.toUpperCase();

      if (isHost) {
        if (!rooms[roomId]) {
          rooms[upperRoomId] = {
            settings: { ...DEFAULT_SETTINGS },
            players: {},
            isCompetitive: false
          };
        }
      } else {
        if (!rooms[upperRoomId]) {
          socket.emit("joinError", { message: "Lobby not found" });
          return;
        }
      }

      const room = rooms[upperRoomId];
      const playerIds = Object.keys(room.players);
      const playerCount = playerIds.length;

      if (!room.players[socket.id] && playerCount >= 2) {
        socket.emit("joinError", { message: "Lobby is full" });
        return;
      }

      room.players[socket.id] = {
        id: socket.id,
        isHost: isHost === true
      };

      socket.join(upperRoomId);
      console.log(`Socket ${socket.id} joined room ${upperRoomId} (host: ${!!isHost})`);

      sendLobbyState(upperRoomId);
    });

    socket.on("updateSettings", ({ roomId, settings }) => {
      if (!roomId) {
        return;
      }

      const upperRoomId = roomId.toUpperCase();
      const room = rooms[upperRoomId];

      if (!room) {
        return;
      }

      room.settings = { ...room.settings, ...settings };

      sendLobbyState(upperRoomId);
    });

    socket.on("startGame", ({ roomId, settings }) => {
      if (!roomId) {
        return;
      }

      const upperRoomId = roomId.toUpperCase();
      const room = rooms[upperRoomId];

      if (!room) {
        return;
      }

      if (settings) {
        room.settings = { ...room.settings, ...settings };
      }

      room.game = createInitialGameState(room);

      console.log(`Game started in room ${upperRoomId}`);

      io.to(upperRoomId).emit("gameStarted", {
        roomId: upperRoomId,
        settings: room.settings
      });
    });

    socket.on("leaveRoom", ({ roomId }) => {
      if (!roomId) {
        return;
      }

      const upperRoomId = roomId.toUpperCase();
      const room = rooms[upperRoomId];

      if (!room) {
        return;
      }

      if (room.players[socket.id]) {
        delete room.players[socket.id];
        socket.leave(upperRoomId);
        console.log(`Socket ${socket.id} left room ${upperRoomId}`);

        const remainingPlayerIds = Object.keys(room.players);

        if (remainingPlayerIds.length === 0) {
          delete rooms[upperRoomId];
          console.log(`Room ${upperRoomId} deleted (empty)`);
        } else {
          sendLobbyState(upperRoomId);
        }
      }
    });

    socket.on("playerMove", ({ roomId, move }) => {
      if (!roomId) {
        return;
      }

      const upperRoomId = roomId.toUpperCase();
      const room = rooms[upperRoomId];

      if (room && room.game && move && typeof move.x === "number" && typeof move.y === "number") {
        updatePlayerPosition(room.game, socket.id, move.x, move.y);
      }

      socket.to(upperRoomId).emit("opponentMove", move);
    });

    socket.on("kickBall", ({ roomId }) => {
      if (!roomId) {
        return;
      }

      const upperRoomId = roomId.toUpperCase();
      const room = rooms[upperRoomId];

      if (!room || !room.game) {
        return;
      }

      applyKick(room.game, socket.id);
    });

    socket.on("usePowerup", ({ roomId }) => {
      if (!roomId) {
        return;
      }

      const upperRoomId = roomId.toUpperCase();
      const room = rooms[upperRoomId];

      if (!room || !room.game) {
        return;
      }

      usePowerup(room.game, socket.id, Date.now());
    });

    socket.on("discardPowerup", ({ roomId }) => {
      if (!roomId) {
        return;
      }

      const upperRoomId = roomId.toUpperCase();
      const room = rooms[upperRoomId];

      if (!room || !room.game) {
        return;
      }

      discardPowerup(room.game, socket.id);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);

      for (const [name, id] of Object.entries(usernameToSocketId)) {
        if (id === socket.id) {
          delete usernameToSocketId[name];

          for (const [name, id] of Object.entries(usernameToSocketId)) {
            if (id === socket.id) {
              competitiveQueue = competitiveQueue.filter(p => p.username !== name);
              casualQueue = casualQueue.filter(p => p.username !== name);
              delete usernameToSocketId[name];
              break;
            }
          }

          break;
        }
      }

      for (const roomId in rooms) {
        const room = rooms[roomId];

        if (!room) {
          continue;
        }

        if (!room.players[socket.id]) {
          continue;
        }

        if (room.game && room.game.isPlaying) {
          socket.to(roomId).emit("opponentLeft");
        }

        delete room.players[socket.id];
        socket.leave(roomId);

        const remainingPlayerIds = Object.keys(room.players);

        if (remainingPlayerIds.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted (empty after disconnect)`);
        } else {
          sendLobbyState(roomId);
        }
      }
    });

    socket.on("competitiveAttach", ({ username }) => {
      if (!username) return;

      usernameToSocketId[username] = socket.id;
      console.log("Attached username to socket", username, socket.id);
    });

    socket.on("casualAttach", ({ username }) => {
      for (const player of casualQueue) {
        if (player.username === username) {
          player.socketId = socket.id;
        }
      }
    });

  });

  let lastPhysicsTime = Date.now();

  setInterval(() => {
    const now = Date.now();
    const deltaTime = (now - lastPhysicsTime) / 1000;
    lastPhysicsTime = now;

    for (const [roomId, room] of Object.entries(rooms)) {
      if (!room.game || !room.game.isPlaying) {
        continue;
      }

      const { roundReset, matchEnded } = stepGame(
        room.game,
        deltaTime,
        room.settings,
        now
      );

      io.to(roomId).emit("gameState", {
        ball: room.game.ball,
        score: room.game.score,
        round: room.game.round,
        powerupsOnField: room.game.powerupsOnField,
        playerPowerups: room.game.playerPowerups
      });

      if (roundReset) {
        io.to(roomId).emit("roundReset", roundReset);
      }

      if (matchEnded) {
        io.to(roomId).emit("matchEnded", {
        ...matchEnded,
        isCompetitive: room.isCompetitive
        });
      }
    }
  }, PHYSICS_TICK_MS);

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });

  server.listen(PORT, host, () => {
    console.log(`LISTENING https://${host}:${PORT}`);
  });
