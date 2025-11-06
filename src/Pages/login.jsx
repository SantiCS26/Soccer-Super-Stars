import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../components/input";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async (e) => {
	e.preventDefault();
	try {
		const response = await fetch("http://localhost:5000/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const data = await response.json();
		if (response.ok) {
			alert("Login successful!");
			console.log("User:", data.email);
		} else {
			alert(data.message);
		}
		} catch (error) {
				console.error("Error logging in:", error);
		}
	};


	return (
		<div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
			<h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
			<form onSubmit={handleLogin}>
				<Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
				<Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

				<button
					type="submit"
					className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
				>
					Login
				</button>
			</form>

			<p className="text-sm text-center text-gray-600 mt-4">
				Don’t have an account?{" "}
				<Link to="/register" className="text-blue-600 hover:underline">
					Register
				</Link>
			</p>
		</div>
	);
}
