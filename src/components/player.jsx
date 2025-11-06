import { forwardRef } from "react"

const Player = forwardRef(function Player(_, ref) {
	const playerStyle = {
		position: "absolute",
		width: 20,
		height: 20,
		background: "#60a5fa",
		transform: "translate3d(20px, 20px, 0)"
	}

	return <div ref={ref} style={playerStyle}></div>
})

export default Player
