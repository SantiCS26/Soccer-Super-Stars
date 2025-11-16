import { forwardRef } from "react"

const Player = forwardRef(function Player(props, ref) {
	const playerStyle = {
		position: "absolute",
		width: 20,
		height: 20,
		background: props.color,
		transform: "translate3d(0px, 0px, 0)"
	}

	return <div ref={ref} style={playerStyle}></div>
})

export default Player
