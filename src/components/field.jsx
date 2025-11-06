export default function Field({ children }) {
    const fieldStyle = {
		position: "relative",
		width: 900,
		height: 580,
		background: "#1f2937",
		border: "1px solid #ccc",
		borderRadius: 6,
		boxSizing: "border-box"
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
