import express from "express";
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8080;
const { Pool } = pkg;

const app = express();

app.use(cors({
	origin: ["http://localhost:5173", "https://soccer-super-stars.fly.dev"],
	methods: ["GET", "POST"],
	allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const pool = new Pool({
	connectionString: process.env.DATABASE_URL || "postgresql://postgres:@localhost:5432/soccersuperstars",
});

pool.connect()
	.then(() => console.log("Connected to PostgreSQL"))
	.catch(err => console.error("Connection error:", err.stack));

app.post("/api/register", async (req, res) => {
	const { email, password } = req.body;

	try {
		const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
		if (existing.rows.length > 0) {
			return res.status(400).json({ message: "User already exists" });
		}

		const hashed = await bcrypt.hash(password, 10);
		await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hashed]);

		res.status(201).json({ message: "User registered successfully" });
	} catch (err) {
		console.error("Registration error:", err);
		res.status(500).json({ message: "Server error" });
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

		res.json({ message: "Login successful", user: { email: user.email } });
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ message: "Server error" });
	}
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server running on port ${PORT}`);
});
