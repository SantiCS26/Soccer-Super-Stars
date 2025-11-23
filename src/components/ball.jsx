import { BALL_SIZE } from "../Game/game_config.js";

export default function Ball({ x, y, radius = BALL_SIZE }) {
	const size = radius * 2;

	const style = {
		position: "absolute",
		width: size,
		height: size,
		borderRadius: "50%",
		background: "white",
		boxShadow: "0 0 6px rgba(0,0,0,0.5)",
		transform: `translate3d(${x - radius}px, ${y - radius}px, 0)`
	};

	return <div style={style}></div>;
}
