export default function Powerup({ x, y, typeId }) {
	const size = 24;

	const wrapperStyle = {
		position: "absolute",
		width: size,
		height: size,
		transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`,
		pointerEvents: "none",
		zIndex: 0
	};

	let bg = "rgba(59,130,246,0.9)";
	let label = "P";

	switch (typeId) {
		case "speed_boost":
			bg = "rgba(56,189,248,0.95)";
			label = "S";
			break;
		case "mega_kick":
			bg = "rgba(239,68,68,0.95)";
			label = "K";
			break;
		case "long_range":
			bg = "rgba(129,140,248,0.95)";
			label = "R";
			break;
		case "tank_mode":
			bg = "rgba(34,197,94,0.95)";
			label = "T";
			break;
		case "slippery_boots":
			bg = "rgba(96,165,250,0.95)";
			label = "B";
			break;
		case "hyper_dash":
			bg = "rgba(245,158,11,0.95)";
			label = "H";
			break;
		case "precision_kick":
			bg = "rgba(14,165,233,0.95)";
			label = "P";
			break;
		case "sticky_shot":
			bg = "rgba(190,24,93,0.95)";
			label = "SS";
			break;
		case "agility_mode":
			bg = "rgba(52,211,153,0.95)";
			label = "A";
			break;
		case "heavy_weight":
			bg = "rgba(148,163,184,0.95)";
			label = "HW";
			break;
		default:
			bg = "rgba(59,130,246,0.9)";
			label = "P";
	}

	const tokenStyle = {
		width: "100%",
		height: "100%",
		borderRadius: "999px",
		background: bg,
		boxShadow: "0 0 12px rgba(15,23,42,0.9)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontSize: 12,
		fontWeight: 700,
		color: "#e5e7eb",
		border: "2px solid rgba(15,23,42,0.8)"
	};

	return (
		<div style={wrapperStyle}>
			<div style={tokenStyle}>{label}</div>
		</div>
	);
}
