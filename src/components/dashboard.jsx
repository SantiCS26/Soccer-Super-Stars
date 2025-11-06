import { NavLink } from "react-router-dom";

export default function Dashboard() {
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

	return (
		<nav style={navBarStyle}>
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
		</nav>
	)
}
