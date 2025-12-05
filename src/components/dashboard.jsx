import { useEffect, useState } from "react";
import LoginWindow from "../components/login_window";
import RegisterWindow from "../components/register_window";
import { NavLink, useNavigate } from "react-router-dom";

export default function Dashboard() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [showLogin, setShowLogin] = useState(false);
	const [showRegister, setShowRegister] = useState(false);

	const navigate = useNavigate();
	
	const navBarStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "64px",
        backgroundColor: "#1f2937",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
    };

	const navContainerStyle = {
        width: "100%",
        maxWidth: "1400px",
        padding: "0 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    };

	const centerLinksStyle = {
		display: "flex",
		gap: "22px",
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
	};

	const dividerStyle = {
		color: "rgba(255,255,255,0.4)",
		fontSize: "16px",
	};

	const linksGroupStyle = {
        display: "flex",
        gap: "24px",
        alignItems: "center",
    };

	const buttonStyle = {
        padding: "8px 16px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        transition: "opacity 0.2s",
    };

    const loginButtonStyle = {
        ...buttonStyle,
        color: "white",
        backgroundColor: "#2563eb",
    };

    const logoutButtonStyle = {
        ...buttonStyle,
        color: "white",
        backgroundColor: "#dc2626",
    };

    const getNavLinkStyle = ({ isActive }) => ({
        color: "white",
        textDecoration: "none",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "15px",
        fontWeight: "500",
        transition: "background-color 0.2s",
        backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
        opacity: isActive ? 1 : 0.8,
    });


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
                <div style={navContainerStyle}>
                    
                    <div style={centerLinksStyle}>
                        <NavLink to="/" style={getNavLinkStyle}>🏠 Home</NavLink>
						<span style={dividerStyle}>|</span>

						<NavLink to="/game" style={getNavLinkStyle}>⚽ Play</NavLink>
						<span style={dividerStyle}>|</span>

						<NavLink to="/leaderboard" style={getNavLinkStyle}>🏆 Leaderboard</NavLink>
						{isLoggedIn && <>
						<span style={dividerStyle}>|</span>
						<NavLink to="/profile" style={getNavLinkStyle}>👤 Profile</NavLink>
						</>}
                    </div>

                    <div style={{ marginLeft: "auto" }}>
                        {isLoggedIn ? (
                            <button onClick={handleLogout} style={logoutButtonStyle}>
								Logout
							</button>
							) : (
							<button onClick={() => setShowLogin(true)} style={loginButtonStyle}>
								Login
							</button>
							)}
                    </div>
                </div>
            </nav>

            <div style={{ height: "64px" }}></div>

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