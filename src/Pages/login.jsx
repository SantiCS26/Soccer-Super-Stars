import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, LogIn } from "lucide-react";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState(null);
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
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4 sm:px-6 lg:px-8 font-sans">
			<div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden">
				
				<div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

				<div className="text-center mb-10">
				<div className="mx-auto h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
					<LogIn size={24} />
				</div>
				<h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
					Welcome Back
				</h2>
				<p className="mt-2 text-sm text-slate-500">
					Please sign in to access your dashboard
				</p>
				</div>

				<form className="space-y-6" onSubmit={handleLogin}>
				<div>
					<label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-1">
					Username
					</label>
					<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
						<User size={18} />
					</div>
					<input
						id="username"
						name="username"
						type="text"
						required
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
						placeholder="Enter your username"
					/>
					</div>
				</div>

				<div>
					<label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
					Password
					</label>
					<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
						<Lock size={18} />
					</div>
					<input
						id="password"
						name="password"
						type={showPassword ? "text" : "password"}
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
						placeholder="Enter your password"
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
					>
						{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
					</div>
				</div>

				{error && (
					<div className="rounded-lg bg-red-50 p-4 border border-red-100 flex items-center gap-2 text-red-700 text-sm">
					<svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
					</svg>
					{error}
					</div>
				)}

				<button
					type="submit"
					disabled={isLoading}
					className={`w-full flex justify-center py-3.5 rounded-xl text-white font-bold shadow-lg shadow-blue-500/30 transition-transform duration-200 active:scale-[0.98] ${
					isLoading
						? "bg-blue-400 cursor-not-allowed"
						: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
					}`}
				>
					{isLoading ? "Signing in..." : "Sign in"}
				</button>

				<div className="relative my-4">
					<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-slate-200"></div>
					</div>
					<div className="relative flex justify-center text-sm text-slate-500 px-2 bg-white">New here?</div>
				</div>

				<div className="text-center">
					<Link
					to="/register"
					className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-700 transition-colors"
					>
					Create an account
					<svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
					</svg>
					</Link>
				</div>
				</form>
			</div>
		</div>
	);
}
