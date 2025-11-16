import { useState, useEffect, useRef } from "react";

import Field from "./field.jsx";
import Player from "./player.jsx";

import { movePlayer } from "../Game/movement.js";
import { useGameInputs } from "../Game/game_inputs.js";

export default function GamePlay({ settings, roomId, socket, isHost, onExit }) {
	const fieldWidth = 750;
	const fieldHeight = 400;
	const playerSpeed = 300;

	const playerElementRef = useRef(null);
	const opponentElementRef = useRef(null);
	const lastFrameTimeRef = useRef(null);
	const animationFrameRef = useRef(null);

	const keyInputsRef = useGameInputs();

	let localStartX = fieldWidth / 4;
	let remoteStartX = (fieldWidth / 4) * 3;

	if (!isHost) {
		localStartX = (fieldWidth / 4) * 3;
		remoteStartX = fieldWidth / 4;
	}

	const localStartY = fieldHeight / 2 - 10;

	const playerDataRef = useRef({
		x: localStartX,
		y: localStartY,
		size: 20
	});

	const opponentDataRef = useRef({
		x: remoteStartX,
		y: localStartY,
		size: 20
	});

	const [countdown, setCountdown] = useState(3);
	const [canMove, setCanMove] = useState(false);

	const [remainingTime, setRemainingTime] = useState(0);


	useEffect(() => {
		if (!socket || !roomId) {
			return;
		}

		function handleOpponentMove(data) {
			opponentDataRef.current = {
				...opponentDataRef.current,
				...data
			};
		}

		socket.on("opponentMove", handleOpponentMove);

		return () => {
			socket.off("opponentMove", handleOpponentMove);
		};
	}, [socket, roomId]);

	useEffect(() => {
		if (!socket || !roomId) {
			return;
		}

		socket.emit("playerMove", {
			roomId: roomId,
			move: {
				x: playerDataRef.current.x,
				y: playerDataRef.current.y
			}
		});
	}, [socket, roomId]);

	useEffect(() => {
		setCountdown(3);
		setCanMove(false);

		let remainingSeconds = 3;

		const intervalId = setInterval(() => {
			remainingSeconds = remainingSeconds - 1;

			if (remainingSeconds <= 0) {
				setCountdown(0);
				setCanMove(true);
				clearInterval(intervalId);
			} else {
				setCountdown(remainingSeconds);
			}
		}, 1000);

		return () => {
			clearInterval(intervalId);
		};
	}, [roomId]);

	useEffect(() => {
		if (!canMove) {
			return;
		}

		let matchDurationSeconds = 180;

		if (settings && typeof settings.matchDurationSec === "number") {
			matchDurationSeconds = settings.matchDurationSec;
		}

		setRemainingTime(matchDurationSeconds);

		let secondsLeft = matchDurationSeconds;

		const timerId = setInterval(() => {
			secondsLeft = secondsLeft - 1;

			if (secondsLeft <= 0) {
				setRemainingTime(0);
				setCanMove(false);
				clearInterval(timerId);

				if (socket && roomId) {
					socket.emit("matchEnd", {
						roomId: roomId
					});
				}

				if (onExit) {
					onExit();
				}
			} else {
				setRemainingTime(secondsLeft);
			}
		}, 1000);

		return () => {
			clearInterval(timerId);
		};
	}, [canMove]);

	useEffect(() => {
		function gameLoop(timestamp) {
			if (lastFrameTimeRef.current === null) {
				lastFrameTimeRef.current = timestamp;
			}

			const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000;
			lastFrameTimeRef.current = timestamp;

			if (canMove) {
				movePlayer(
					playerDataRef.current,
					keyInputsRef.current,
					deltaTime,
					fieldWidth,
					fieldHeight,
					playerSpeed
				);
			}

			if (socket && roomId) {
				socket.emit("playerMove", {
					roomId: roomId,
					move: {
						x: playerDataRef.current.x,
						y: playerDataRef.current.y
					}
				});
			}

			if (playerElementRef.current) {
				const playerData = playerDataRef.current;
				playerElementRef.current.style.transform =
					`translate3d(${playerData.x}px, ${playerData.y}px, 0)`;
			}

			if (opponentElementRef.current) {
				const opponentData = opponentDataRef.current;
				opponentElementRef.current.style.transform =
					`translate3d(${opponentData.x}px, ${opponentData.y}px, 0)`;
			}

			animationFrameRef.current = requestAnimationFrame(gameLoop);
		}

		animationFrameRef.current = requestAnimationFrame(gameLoop);

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [socket, roomId, canMove, keyInputsRef]);

	const wrapperStyle = {
		width: fieldWidth,
		margin: "20px auto",
		position: "relative"
	};

	const exitButtonStyle = {
		marginTop: 10,
		padding: "6px 12px"
	};

	const helpTextStyle = {
		fontSize: 14,
		marginTop: 8
	};

	const countdownOverlayStyle = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		fontSize: 48,
		fontWeight: "bold",
		color: "white",
		pointerEvents: "none"
	};

	const hudStyle = {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
		fontWeight: "bold",
		fontSize: 18
	};

	const hudLeftStyle = {
		marginRight: 20,
		flex: 1,
		textAlign: "right"
	};

	const hudRightStyle = {
		marginLeft: 20,
		flex: 1,
		textAlign: "left"
	};

	function formatMatchTime(totalSeconds) {
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		const paddedSeconds = seconds.toString().padStart(2, "0");

		return minutes + ":" + paddedSeconds;
	}

	return (
		<div style={wrapperStyle}>
			<div style={hudStyle}>
				<div style={hudLeftStyle}>Score: 0 | 0</div>
				<div style={hudRightStyle}>Time: {formatMatchTime(remainingTime)}</div>
			</div>
			<div style={{ position: "relative" }}>
				<Field>
					<Player ref={playerElementRef} color="#60a5fa" />
					<Player ref={opponentElementRef} color="#fa6060ff" />
				</Field>

				{countdown > 0 && (
					<div style={countdownOverlayStyle}>
						{countdown}
					</div>
				)}
			</div>

			<div style={helpTextStyle}>Controls: W, A, S, D</div>
			<button onClick={onExit} style={exitButtonStyle}>
				Exit
			</button>
		</div>
	);
}
