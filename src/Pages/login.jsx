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
		setIsLoading(true);

		try {
			const API_BASE_URL = import.meta.env.VITE_API_URL;

			const response = await fetch(`${API_BASE_URL}/api/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
				credentials: "include",
			});

			const data = await response.json();
			if (response.ok) {
				navigate("/");
			} else {
				alert(data.message);
			}
		} catch (error) {
			console.error("Error logging in:", error);
		} finally {		
			setIsLoading(false);
		}
	};


	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
			<div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl p-10 transition-all">

				<h1 className="text-4xl font-extrabold text-gray-900 text-center mb-2">
					Welcome Back
				</h1>
				<p className="text-center text-gray-600 mb-8">
					Sign in to continue
				</p>

				<form onSubmit={handleLogin} className="space-y-6">

					<div className="relative group">
						<User className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition" size={20} />
						<input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full pl-11 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
							required
						/>
					</div>

					<div className="relative group">
						<Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition" size={20} />
						<input
							type={showPassword ? "text" : "password"}
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
							required
						/>

						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition"
						>
							{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-md hover:bg-blue-700 disabled:opacity-60 transition-all"
					>
						<LogIn size={20} />
						{isLoading ? "Logging in..." : "Login"}
					</button>
				</form>

				<p className="text-center text-gray-600 text-sm mt-8">
					Don't have an account?{" "}
					<Link to="/register" className="text-blue-600 font-medium hover:underline">
						Register here
					</Link>
				</p>
			</div>
		</div>
	);
}
