import express from "express";
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const { Pool } = pkg;
let host;
let databaseConfig;

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


app.post("/api/register", async (req, res) => {
	const { email, password } = req.body;

	try {
		const testResult = await pool.query(`
			SELECT table_name
			FROM information_schema.tables
			WHERE table_schema = 'public'
			`);
		console.log("THIS IS A TEST:\n\n\n\n", testResult.rows);

		const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
		if (existing.rows.length > 0) {
			return res.status(400).json({ message: "User already exists" });
		}

		const hashed = await bcrypt.hash(password, 10);
		await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hashed]);

		return res.status(201).json({ message: "User registered successfully" });
	} catch (err) {
		console.error("Registration error:", err);
		return res.status(500).json({ message: "Server error" });
	}
});

app.post("/api/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
		if (result.rows.length === 0) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const user = result.rows[0];
		const valid = await bcrypt.compare(password, user.password);

		if (!valid) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		return res.json({ message: "Login successful", user: { email: user.email } });
	} catch (err) {
		console.error("Login error:", err);
		return res.status(500).json({ message: "Server error" });
	}
});

app.use(express.static(path.join(__dirname, "dist")));

app.listen(PORT, host, () => {
	console.log(`LISTENING https://${host}:${PORT}`);
});
