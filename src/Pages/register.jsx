import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, UserPlus } from "lucide-react";

export default function Register() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();

	const handleRegister = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			alert("Passwords do not match.");
			return;   
		}

		if (password.length < 12) {
			alert("Password must be at least 12 characters long.");
			return;
		} else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
			alert("Password must contain at least one uppercase, lowercase letter, number, and special symbol.");
			return;
		}



		console.log("THIS IS THE BODY: ", JSON.stringify({ username, password }));
		try {
			const API_BASE_URL = import.meta.env.VITE_API_URL;

			const response = await fetch(`${API_BASE_URL}/api/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
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
		<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
			<div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-gray-200">

				<h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
					Create an Account
				</h1>

				<form onSubmit={handleRegister} className="space-y-6">

					<div className="relative">
						<User className="absolute left-3 top-3 text-gray-400" size={20} />
						<input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
							required
						/>
					</div>

					<div className="relative">
						<Lock className="absolute left-3 top-3 text-gray-400" size={20} />
						<input
							type={showPassword ? "text" : "password"}
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
							required
						/>
					</div>

					<div className="relative">
						<Lock className="absolute left-3 top-3 text-gray-400" size={20} />
						<input
							type={showPassword ? "text" : "password"}
							placeholder="Confirm Password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
							required
						/>
						<button
							type="button"
							className="absolute right-3 top-3 text-gray-500"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
					>
						<UserPlus size={20} />
						{isLoading ? "Creating Account..." : "Register"}
					</button>
				</form>

				<p className="text-center text-gray-600 text-sm mt-8">
					Already have an account?{" "}
					<Link to="/" className="text-blue-600 font-medium hover:underline">
						Login here
					</Link>
				</p>
			</div>
		</div>
	);
}
