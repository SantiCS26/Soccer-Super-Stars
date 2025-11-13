import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/input";

export default function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const navigate = useNavigate();

	const handleRegister = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			alert("Passwords do not match.");
			return;   
		}

		console.log("THIS IS THE BODY: ", JSON.stringify({ email, password }));
		try {
			const API_BASE_URL = import.meta.env.VITE_API_URL || "";
			const response = await fetch(`${API_BASE_URL}/api/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (response.ok) {
				alert("Registration successful! You can now log in.");
				navigate("/");
			} else {
				alert(data.message || "Registration failed.");
			}
		} catch (error) {
			console.error("Error registering user:", error);
			alert("Server error. Please try again later.");
		}
	};

	return (
		<div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
			<h2 className="text-2xl font-semibold text-center mb-6">Create Account</h2>
			<form onSubmit={handleRegister}>
				<Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
				<Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				<Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

				<button
					type="submit"
					className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
				>
					Register
				</button>
			</form>

			<p className="text-sm text-center text-gray-600 mt-4">
				Already have an account?{" "}
				<Link to="/" className="text-green-600 hover:underline">
					Login
				</Link>
			</p>
		</div>
	);
}
