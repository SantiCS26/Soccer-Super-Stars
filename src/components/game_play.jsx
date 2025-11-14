import { useState, useEffect, useRef } from "react"
import Field from "./field.jsx"
import Player from "./player.jsx"
import { movePlayer } from "../Game/movement.js"
import { useGameInputs } from "../Game/game_inputs.js"
import { io } from "socket.io-client";

export default function GamePlay({ settings, onExit }) {
	const fieldWidth = 750
	const fieldHeight = 400
	const playerSpeed = 300

	const playerElement = useRef(null)
	const lastFrameTime = useRef(null)
	const animationFrame = useRef(null)
	 const opponentElement = useRef(null);
	const keyInputs = useGameInputs()
	const playerData = useRef({
		x: fieldWidth / 4,
		y: fieldHeight / 2 - 10,
		size: 20
	})

	const opponentData = useRef({
		x: (fieldWidth / 4) * 3,
		y: fieldHeight / 2 - 10,
		size: 20
	});
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		if (!settings?.roomId) return;

		const newSocket = io("https://soccer-super-stars.fly.dev", {
			path: "/socket.io/",
			transports: ["websocket"]
		});

		setSocket(newSocket);

		newSocket.emit("joinRoom", { roomId: settings.roomId });

		newSocket.on("opponentMove", (data) => {
		opponentData.current = { ...opponentData.current, ...data };
		});

		return () => {
		newSocket.disconnect();
		};
	}, [settings?.roomId]);

	useEffect(() => {
		const gameLoop = (timestamp) => {
		if (lastFrameTime.current == null) lastFrameTime.current = timestamp;
		const deltaTime = (timestamp - lastFrameTime.current) / 1000;
		lastFrameTime.current = timestamp;

		movePlayer(playerData.current, keyInputs.current, deltaTime, fieldWidth, fieldHeight, playerSpeed);

		if (socket) {
			socket.emit("playerMove", {
			roomId: settings.roomId,
			move: { x: playerData.current.x, y: playerData.current.y }
			});
		}

		if (playerElement.current) {
			const p = playerData.current;
			playerElement.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
		}

		if (opponentElement.current) {
			const o = opponentData.current;
			opponentElement.current.style.transform = `translate3d(${o.x}px, ${o.y}px, 0)`;
		}

		animationFrame.current = requestAnimationFrame(gameLoop);
		};

		animationFrame.current = requestAnimationFrame(gameLoop);
		return () => cancelAnimationFrame(animationFrame.current);
	}, [socket]);

	const wrapperStyle = { width: fieldWidth, margin: "20px auto" }
	const exitButtonStyle = { marginTop: 10, padding: "6px 12px" }
	const helpTextStyle = { fontSize: 14, marginTop: 8 }

	return (
		<div style={wrapperStyle}>


			<div style={{ marginBottom: 10, fontSize: 16 }}>
			Room ID: <strong>{settings.roomId}</strong>
			</div>
			
			<Field>
				<Player ref={playerElement} color="blue" />
				<Player ref={opponentElement} color="red" />
			</Field>
			<div style={helpTextStyle}>Controls: W, A, S, D</div>
			<button onClick={onExit} style={exitButtonStyle}>Exit</button>
		</div>
	);
}