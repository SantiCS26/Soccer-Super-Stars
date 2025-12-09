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
	if (typeId === "mega_kick") {
		bg = "rgba(239,68,68,0.9)";
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

	const label = typeId === "mega_kick" ? "K" : "S";

	return (
		<div style={wrapperStyle}>
			<div style={tokenStyle}>{label}</div>
		</div>
	);
}
