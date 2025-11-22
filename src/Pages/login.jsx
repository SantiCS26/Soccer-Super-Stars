import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/input";

export default function Login() {
	const [username, setusername] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const handleLogin = async (e) => {
	e.preventDefault();
	try {
		const API_BASE_URL = import.meta.env.VITE_API_URL;
		console.log("API BASE URL: ", API_BASE_URL);

		const response = await fetch(`${API_BASE_URL}/api/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password }),
		});

		const data = await response.json();
		if (response.ok) {
			alert("Login successful!");
			navigate("/home");
		} else {
			alert(data.message);
		}
		} catch (error) {
			    console.log("Body being sent: ", JSON.stringify({ username, password }));
				console.error("Error logging in:", error);
		}
	};


	return (
		<div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
			<h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
			<form onSubmit={handleLogin}>
				<Input label="username" type="username" value={username} onChange={(e) => setusername(e.target.value)} />
				<Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

				<button
					type="submit"
					className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
				>
					Login
				</button>

				<button
					type="button"
					onClick={() => navigate("/home")}
					className="w-full bg-gray-500 text-white py-2 rounded-lg mt-3 hover:bg-gray-600 transition"
				>
					Continue as Guest
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
