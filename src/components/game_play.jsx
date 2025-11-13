import { useEffect, useRef } from "react"
import Field from "./field.jsx"
import Player from "./player.jsx"
import { movePlayer } from "../Game/movement.js"
import { useGameInputs } from "../Game/game_inputs.js"

export default function GamePlay({ onExit }) {
	const fieldWidth = 750
	const fieldHeight = 400
	const playerSpeed = 300

	const playerElement = useRef(null)
	const lastFrameTime = useRef(null)
	const animationFrame = useRef(null)
	const keyInputs = useGameInputs()
	const playerData = useRef({
		x: fieldWidth / 4,
		y: fieldHeight / 2 - 10,
		size: 20
	})

	useEffect(() => {
		const gameLoop = (timestamp) => {
			if (lastFrameTime.current == null) lastFrameTime.current = timestamp
			const deltaTime = (timestamp - lastFrameTime.current) / 1000
			lastFrameTime.current = timestamp

			movePlayer(playerData.current, keyInputs.current, deltaTime, fieldWidth, fieldHeight, playerSpeed)

			if (playerElement.current) {
				const p = playerData.current
				playerElement.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
			}

			animationFrame.current = requestAnimationFrame(gameLoop)
		}
		animationFrame.current = requestAnimationFrame(gameLoop)
		return () => cancelAnimationFrame(animationFrame.current)
	}, [])

	const wrapperStyle = { width: fieldWidth, margin: "20px auto" }
	const exitButtonStyle = { marginTop: 10, padding: "6px 12px" }
	const helpTextStyle = { fontSize: 14, marginTop: 8 }

	return (
		<div style={wrapperStyle}>
			<Field>
				<Player ref={playerElement} />
			</Field>
			<div style={helpTextStyle}>Controls: W, A, S, D</div>
			<button onClick={onExit} style={exitButtonStyle}>Exit</button>
		</div>
	)
}