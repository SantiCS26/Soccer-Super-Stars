import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../Pages-style/dashboard.css";

export default function Dashboard() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const checkLogin = async () => {
			try {
				const API_BASE_URL = import.meta.env.VITE_API_URL;

				const res = await fetch(`${API_BASE_URL}/api/validate-token`, {
					method: "GET",
					credentials: "include",
				});

				const data = await res.json();
				setIsLoggedIn(data.valid === true);
			} catch (err) {
				console.error("Login check failed:", err);
				setIsLoggedIn(false);
			}
		};

		checkLogin();
	}, [location]);

	const handleLogout = async () => {
		try {
			const API_BASE_URL = import.meta.env.VITE_API_URL;
			const response = await fetch(`${API_BASE_URL}/api/logout`, {
				method: "POST",
				credentials: "include" 
			});

			if (response.ok) {
				navigate("/");
				setIsLoggedIn(false); 
			} else {
				alert("Logout failed");
			}
		} catch (err) {
			console.error("Logout error:", err);
			alert("Server error during logout");
		}
	};

	return (
		<>
			<nav className="nav-bar">
				<div className="nav-container">
					<NavLink to="/" className="nav-logo">
						<span className="logo-emoji">⚽</span>
						<span className="logo-text">Soccer Super Stars</span>
					</NavLink>
					
					<div className="nav-links">
						<NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
							🏠 Home
						</NavLink>
						<span className="nav-divider">|</span>

						<NavLink to="/game" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
							🎮 Play
						</NavLink>
						<span className="nav-divider">|</span>

						<NavLink to="/leaderboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
							🏆 Leaderboard
						</NavLink>
						{isLoggedIn && <>
							<span className="nav-divider">|</span>
							<NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
								👤 Profile
							</NavLink>
						</>}
					</div>

					<div className="auth-container">
						{isLoggedIn ? (
							<button onClick={handleLogout} className="auth-button logout-button">
								Logout
							</button>
						) : (
							<NavLink to="/login" className="auth-button login-button">
								Login / Register
							</NavLink>
						)}
					</div>
				</div>
			</nav>
		</>
	);
}