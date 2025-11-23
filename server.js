import express from "express";
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
	stepGame
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


let app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ["http://localhost:5173", "https://soccer-super-stars.fly.dev"],
		methods: ["GET", "POST"],
	}
});

app.use(cors({
	origin: ["http://localhost:5173", "https://soccer-super-stars.fly.dev"],
	methods: ["GET","POST","OPTIONS"],
	allowedHeaders: ["Content-Type"],
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

app.post("/create", (req, res) => {
	const roomId = generateRoomCode();
	return res.json({ roomId });
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
		user: { username: user.username }
    });
	} catch (err) {
		console.error("Login error:", err);
		return res.status(500).json({ message: "Server error" });
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
		expires: new Date(0)
	});
	return res.sendStatus(200);
});

app.get("/public", (req, res) => res.send("THIS IS PUBLIC\n"));
app.get("/private", authorize, (req, res) => res.send("THIS IS PRIVATE\n"));

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
					players: {}
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

	socket.on("disconnect", () => {
		console.log(`Socket disconnected: ${socket.id}`);

		for (const roomId in rooms) {
			const room = rooms[roomId];

			if (!room) {
				continue;
			}

			if (!room.players[socket.id]) {
				continue;
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
			round: room.game.round
		});

		if (roundReset) {
			io.to(roomId).emit("roundReset", roundReset);
		}

		if (matchEnded) {
			io.to(roomId).emit("matchEnded", matchEnded);
		}
	}
}, PHYSICS_TICK_MS);

server.listen(PORT, host, () => {
	console.log(`LISTENING https://${host}:${PORT}`);
});
