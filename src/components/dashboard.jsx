import { NavLink } from "react-router-dom";

export default function Dashboard() {
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
		gap: "16px",
		padding: "10px 0"
	}

	const navLinksContainerStyle = {
		display: "flex",
		gap: "16px"
	};

	const handleLogout = async () => {
		try {
			const API_BASE_URL = import.meta.env.VITE_API_URL;
			const response = await fetch(`${API_BASE_URL}/logout`, {
				method: "POST",
				credentials: "include" 
			});

			if (response.ok) {
				navigate("/"); 
			} else {
				alert("Logout failed");
			}
		} catch (err) {
			console.error("Logout error:", err);
			alert("Server error during logout");
		}
	};

	return (
		<nav style={navBarStyle}>
			<div style={navLinksContainerStyle}>
				<NavLink to="/home" style={({ isActive }) => getNavLinkStyle(isActive)}>
					Home
				</NavLink>

				<NavLink to="/game" style={({ isActive }) => getNavLinkStyle(isActive)}>
					Play Game
				</NavLink>

				<NavLink to="/leaderboard" style={({ isActive }) => getNavLinkStyle(isActive)}>
					Leaderboard
				</NavLink>

				<NavLink to="/profile" style={({ isActive }) => getNavLinkStyle(isActive)}>
					My Profile
				</NavLink>
			</div>

			<button
				onClick={handleLogout}
				style={{
					color: "white",
					backgroundColor: "#dc2626",
					padding: "6px 12px",
					borderRadius: "4px",
					border: "none",
					cursor: "pointer"
				}}
			>
				Logout
			</button>
		</nav>
	)
}
