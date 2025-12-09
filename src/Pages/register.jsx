import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, UserPlus } from "lucide-react";
import "../Pages-style/login.css";

// Registration Page Component
export default function Register() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();

	const getPasswordStrength = (password) => {
		let score = 0;

		if (password.length >= 12) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/[a-z]/.test(password)) score++;
		if (/[0-9]/.test(password)) score++;
		if (/[!@#$%^&*]/.test(password)) score++;

		return score;
	};

	const strength = getPasswordStrength(password);

	const strengthLabel = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
	const strengthColor = ["#ff2e2e", "#ff6b2e", "#ffc42e", "#4fd34f", "#2ecc71", "#00ffaa"][strength];

	const handleRegister = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			alert("Passwords do not match.");
			return;   
		}
	
		if (strength < 4) {
			alert("Password is too weak. Try using more characters, symbols, and numbers.");
			return;
		}


		setIsLoading(true);

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
				navigate("/login");
			} else {
				alert(data.message || "Registration failed.");
			}
		} catch (error) {
			console.error("Error registering user:", error);
			alert("Server error. Please try again later.");
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
				<h1 className="hero-title">Create Your Account</h1>
				<p className="hero-subtitle">Join our community today.</p>
			</div>

			<div className="login-card">
				<div className="accent-bar"></div>

				<h2 className="card-title">Register</h2>
				<p className="card-subtitle">Fill out your details below</p>

				<form onSubmit={handleRegister} className="space-y-6">

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
					</div>

					<div className="relative group">
						<Lock className="input-icon" size={20} />
						<input
							type={showPassword ? "text" : "password"}
							placeholder="Confirm Password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
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
						<UserPlus size={18} />
						{isLoading ? "Creating Account..." : "Register"}
					</button>
				</form>

				<p className="register-text">
					Already have an account?{" "}
					<Link to="/login" className="text-blue-400 font-medium hover:underline">
						Login here
					</Link>
				</p>
			</div>
		</div>
	</div>
);
}
