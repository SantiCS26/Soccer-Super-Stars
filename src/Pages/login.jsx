import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, LogIn } from "lucide-react";
import "../Pages-style/login.css";


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
		<div className="login-page-container dark-mode">

			<div className="floating-shape neon-blue"></div>
			<div className="floating-shape neon-purple"></div>
			<div className="floating-shape neon-pink"></div>

			<div className="login-wrapper dark-card">

				<div className="login-hero hidden md:flex">
					<h1 className="hero-title">Welcome Back</h1>
					<p className="hero-subtitle">
						Continue your journey with us.
					</p>
				</div>

				<div className="login-card">
					<div className="accent-bar"></div>

					<h2 className="card-title">Sign In</h2>
					<p className="card-subtitle">Enter your credentials below</p>

					<form onSubmit={handleLogin} className="space-y-6">

						<div className="relative group">
							<User className="input-icon" size={20} />
							<input
								type="text"
								placeholder="Username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="modern-input dark-input"
								required
							/>
						</div>

						<div className="relative group">
							<Lock className="input-icon" size={20} />
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="modern-input dark-input"
								required
							/>

							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="password-toggle"
							>
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="modern-btn neon-btn"
						>
							<LogIn size={18} />
							{isLoading ? "Logging in..." : "Login"}
						</button>
					</form>

					<p className="register-text">
						Don't have an account?{" "}
						<Link to="/register" className="text-blue-400 font-medium hover:underline">
							Register here
						</Link>
					</p>
				</div>

			</div>
		</div>
	);
}
