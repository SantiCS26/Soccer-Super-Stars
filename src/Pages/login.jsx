import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, LogIn } from "lucide-react";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
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
		<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
			<div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
				
				<h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
					Welcome Back
				</h1>

				<form onSubmit={handleLogin} className="space-y-5">

					<div className="relative">
						<User className="absolute left-3 top-3 text-gray-400" size={20} />
						<input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
							className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
							required
						/>
						<button
							type="button"
							className="absolute right-3 top-2.5 text-gray-500"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
					>
						<LogIn size={20} />
						{isLoading ? "Logging in..." : "Login"}
					</button>
				</form>

				<p className="text-center text-gray-600 text-sm mt-6">
					Don't have an account?{" "}
					<Link to="/register" className="text-blue-600 font-medium hover:underline">
						Register here
					</Link>
				</p>
			</div>
		</div>
	);
}
