import { forwardRef } from "react"
import { PLAYER_SIZE, PLAYER_DRIBBLE_RADIUS, PLAYER_KICK_RADIUS } from "../Game/game_config.js";

const Player = forwardRef(function Player(props, ref) {
	const size = PLAYER_SIZE;

	const wrapperStyle = {
		position: "absolute",
		width: size,
		height: size,
		transform: "translate3d(0px, 0px, 0)",
	};

	const playerStyle = {
		position: "relative",
		width: size,
		height: size,
		background: props.color,
		borderRadius: "50%",
		zIndex: 3
	}

	const dribbleRingStyle = {
		position: "absolute",
		left: "50%",
		top: "50%",
		width: PLAYER_DRIBBLE_RADIUS * 2,
		height: PLAYER_DRIBBLE_RADIUS * 2,
		transform: "translate(-50%, -50%)",
		borderRadius: "50%",
		border: "2px solid rgba(255,255,255,0.25)",
		pointerEvents: "none",
		zIndex: 1
	};

	const kickRingStyle = {
		position: "absolute",
		left: "50%",
		top: "50%",
		width: PLAYER_KICK_RADIUS * 2,
		height: PLAYER_KICK_RADIUS * 2,
		transform: "translate(-50%, -50%)",
		borderRadius: "50%",
		border: "2px dashed rgba(255,255,255,0.15)",
		pointerEvents: "none",
		zIndex: 0
	};

	return (
		<div ref={ref} style={wrapperStyle}>
			<div style={kickRingStyle}></div>
			<div style={dribbleRingStyle}></div>
			<div style={playerStyle}></div>
		</div>
	);
});

export default Player;
