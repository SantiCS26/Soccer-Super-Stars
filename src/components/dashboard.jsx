import { useEffect, useState } from "react";
import LoginWindow from "../components/login_window";
import RegisterWindow from "../components/register_window";
import { NavLink, useNavigate } from "react-router-dom";

export default function Dashboard() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [showLogin, setShowLogin] = useState(false);
	const [showRegister, setShowRegister] = useState(false);

	const navigate = useNavigate();
	const navLinkStyle = {
		color: "white",
		padding: "6px 12px",
		borderRadius: "4px"
	}

	const activeNavLinkStyle = {
		backgroundColor: "#222",
	}

	function getNavLinkStyle(isActive) {
		let style = navLinkStyle
		if (isActive) {
			style = { ...navLinkStyle, ...activeNavLinkStyle }
		}
		return style
	}

	const navBarStyle = {
		position: "fixed",
		top: 0,
		left: 0,
		width: "100%",
		backgroundColor: "#1f2937",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
        gap: "16px",
        padding: "10px 0",
        zIndex: 40
	}

	const navLinksContainerStyle = {
		display: "flex",
		gap: "16px",
		alignItems: "center"
	};

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
    }, []);

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
			<nav style={navBarStyle}>
				<div style={navLinksContainerStyle}>
					<NavLink to="/" style={({ isActive }) => getNavLinkStyle(isActive)}>
						Home
					</NavLink>

					<NavLink to="/game" style={({ isActive }) => getNavLinkStyle(isActive)}>
						Play Game
					</NavLink>

					<NavLink to="/leaderboard" style={({ isActive }) => getNavLinkStyle(isActive)}>
						Leaderboard
					</NavLink>

					{isLoggedIn && (
						<NavLink to="/profile" style={({ isActive }) => getNavLinkStyle(isActive)}>
							My Profile
						</NavLink>
					)}
				</div>

				<div>
                	{isLoggedIn ? (

						<button
							onClick={handleLogout}
							style={{
								color: "white",
								backgroundColor: "#dc2626",
								padding: "6px 12px",
								borderRadius: "4px",
								border: "none",
								cursor: "pointer",
							}}
						>
							Logout
						</button>
					) : (
						<button
							onClick={() => setShowLogin(true)}
							style={{
								color: "white",
								backgroundColor: "#2563eb",
								padding: "8px 16px",
								borderRadius: "6px",
								border: "none",
								cursor: "pointer",
								fontSize: "16px"
							}}
						>
							Login
						</button>
					)}
				</div>
			</nav>

			{showLogin && (
                <LoginWindow
                    onClose={() => setShowLogin(false)}
                    onSuccess={() => setIsLoggedIn(true)}
                    onSwitchToRegister={() => {
                        setShowLogin(false);
                        setShowRegister(true);
                    }}
                />
            )}

            {showRegister && (
                <RegisterWindow
                    onClose={() => setShowRegister(false)}
                    onSwitchToLogin={() => {
                        setShowRegister(false);
                        setShowLogin(true);
                    }}
                />
            )}
		</>
	);
}