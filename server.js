import express from "express";
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const { Pool } = pkg;
let host;
let databaseConfig;
let rooms = {};

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
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const pool = new Pool(databaseConfig);

pool.connect().then(() => {
	console.log("Connected to db");
});

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

app.post("/create", (req, res) => {
  	let roomId = generateRoomCode();
  	rooms[roomId] = {};
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

		return res.status(201).json({ message: "User registered successfully" });
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

		return res.json({ message: "Login successful", user: { username: user.username } });
	} catch (err) {
		console.error("Login error:", err);
		return res.status(500).json({ message: "Server error" });
	}
});

app.use(express.static(path.join(__dirname, "dist")));

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("joinRoom", ({ roomId }) => {
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = socket;
    socket.join(roomId);

    const players = Object.keys(rooms[roomId]);
    if (players.length === 2) io.to(roomId).emit("gameStart", { roomId, players });
  });

  socket.on("playerMove", ({ roomId, move }) => {
    socket.to(roomId).emit("opponentMove", move);
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      if (rooms[roomId][socket.id]) {
        delete rooms[roomId][socket.id];
        if (Object.keys(rooms[roomId]).length === 0) delete rooms[roomId];
      }
    }
  });
});


server.listen(PORT, host, () => {
  console.log(`LISTENING https://${host}:${PORT}`);
});
