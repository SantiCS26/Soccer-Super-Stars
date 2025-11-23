import { FIELD_WIDTH, FIELD_HEIGHT } from "../Game/game_config.js";

export default function Field({ children }) {
    const fieldStyle = {
		position: "relative",
		width: FIELD_WIDTH,
		height: FIELD_HEIGHT,
		background: "#1f2937",
		border: "1px solid #ccc",
		borderRadius: 6,
		boxSizing: "border-box",
		overflow: "visible"
	}

	const midLineStyle = {
		position: "absolute",
		left: "50%",
		top: 0,
		bottom: 0,
		borderLeft: "1px dashed rgba(255, 255, 255, 0.5)",
		transform: "translateX(-50%)"
	}

	return (
		<div style={fieldStyle}>
			<div style={midLineStyle}></div>
			{children}
		</div>
	)
}
