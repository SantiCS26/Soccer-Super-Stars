import { useState, useEffect, useRef } from "react";

import Field from "./field.jsx";
import Player from "./player.jsx";
import Ball from "./ball.jsx";
import Goal from "./goal.jsx";

import { movePlayer } from "../Game/movement.js";
import { useGameInputs } from "../Game/game_inputs.js";
import { 
	FIELD_WIDTH, 
	FIELD_HEIGHT, 
	PLAYER_SPEED, 
} from "../Game/game_config.js";

export default function GamePlay({ settings, roomId, socket, isHost, onExit }) {
	const fieldWidth = FIELD_WIDTH;
	const fieldHeight = FIELD_HEIGHT;
	const playerSpeed = PLAYER_SPEED;

	const playerElementRef = useRef(null);
	const opponentElementRef = useRef(null);
	const lastFrameTimeRef = useRef(null);
	const animationFrameRef = useRef(null);

	const keyInputsRef = useGameInputs();
	const lastSpaceDownRef = useRef(false);
	const matchTimerStartedRef = useRef(false);
	const matchTimerIdRef = useRef(null);

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

	const [ballState, setBallState] = useState({
		x: fieldWidth / 2,
		y: fieldHeight / 2,
		radius: 8
	});

	const [score, setScore] = useState({
		left: 0,
		right: 0
	});

	const [serverRound, setServerRound] = useState(0);

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
	}, [roomId, serverRound]);

	useEffect(() => {
		if (!canMove || matchTimerStartedRef.current) {
			return;
		}

		matchTimerStartedRef.current = true;

		let matchDurationSeconds = 180;

		if (settings && typeof settings.matchDurationSec === "number") {
			matchDurationSeconds = settings.matchDurationSec;
		}

		setRemainingTime(matchDurationSeconds);

		let secondsLeft = matchDurationSeconds;

		const id = setInterval(() => {
			secondsLeft = secondsLeft - 1;

			if (secondsLeft <= 0) {
				setRemainingTime(0);
				setCanMove(false);
				clearInterval(id);
				matchTimerIdRef.current = null;

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

		matchTimerIdRef.current = id;
	}, [canMove, settings, socket, roomId, onExit]);

	useEffect(() => {
		return () => {
			if (matchTimerIdRef.current) {
				clearInterval(matchTimerIdRef.current);
			}
		};
	}, []);

	useEffect(() => {
		function gameLoop(timestamp) {
			if (lastFrameTimeRef.current === null) {
				lastFrameTimeRef.current = timestamp;
			}

			const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000;
			lastFrameTimeRef.current = timestamp;

			const keyState = keyInputsRef.current || {};

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

			const isSpaceDown = !!(keyState[" "] || keyState["space"] || keyState["spacebar"]);

			if (isSpaceDown && !lastSpaceDownRef.current) {
				if (socket && roomId) {
					socket.emit("kickBall", { roomId });
				}
			}

			lastSpaceDownRef.current = isSpaceDown;

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

	useEffect(() => {
		if (!socket || !roomId) {
			return;
		}

		function handleGameState({ ball, score, round }) {
			if (ball) {
				setBallState(ball);
			}

			if (score) {
				setScore(score);
			}

			if (typeof round === "number") {
				setServerRound(round);
			}
		}

		function handleRoundReset(payload) {

			if (payload.ball) {
				setBallState(payload.ball);
			}

			if (payload.score) {
				setScore(payload.score);
			}

			if (typeof payload.round === "number") {
				setServerRound(payload.round);
			}

			if (payload.playerPositions && socket.id) {
				const myPos = payload.playerPositions[socket.id];
				const opponentId = Object.keys(payload.playerPositions).find(
					(id) => id !== socket.id
				);

				let oppPos;
				if (opponentId) {
					oppPos = payload.playerPositions[opponentId];
				} else {
					oppPos = null;
				}

				if (myPos) {
					playerDataRef.current = {
						...playerDataRef.current,
						x: myPos.x,
						y: myPos.y
					};
				}

				if (oppPos) {
					opponentDataRef.current = {
						...opponentDataRef.current,
						x: oppPos.x,
						y: oppPos.y
					};
				}
			}

			setCountdown(3);
			setCanMove(false);
		}

		function handleMatchEnded({ score, winnerSide }) {
			console.log("Match ended:", score, "winner:", winnerSide);

			setCanMove(false);

			if (onExit) {
				onExit();
			}
		}

		function handleOpponentLeft() {
			console.log("Opponent disconnected during match");
			if (onExit) {
				onExit();
			}
		}

		socket.on("gameState", handleGameState);
		socket.on("roundReset", handleRoundReset);
		socket.on("matchEnded", handleMatchEnded);
		socket.on("opponentLeft", handleOpponentLeft);

		return () => {
			socket.off("gameState", handleGameState);
			socket.off("roundReset", handleRoundReset);
			socket.off("matchEnded", handleMatchEnded);
			socket.off("opponentLeft", handleOpponentLeft);
		};
	}, [socket, roomId, onExit]);

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
		top: "25%",
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

	let myScore;
	let opponentScore;

	if (isHost) {
		myScore = score.left;
		opponentScore = score.right;
	} else {
		myScore = score.right;
		opponentScore = score.left;
	}

	return (
		<div style={wrapperStyle}>
			<div style={hudStyle}>
				<div style={hudLeftStyle}>Score: {myScore} | {opponentScore}</div>
				<div style={hudRightStyle}>Time: {formatMatchTime(remainingTime)}</div>
			</div>
			<div style={{ position: "relative" }}>
				<Field>
					<Goal side="left" />
					<Goal side="right" />

					<Player ref={playerElementRef} color="#60a5fa" />
					<Player ref={opponentElementRef} color="#fa6060ff" />

					<Ball
						x={ballState.x}
						y={ballState.y}
						radius={ballState.radius || 8}
					/>
				</Field>
				{countdown > 0 && (
					<div style={countdownOverlayStyle}>
						{countdown}
					</div>
				)}
			</div>

			<div style={helpTextStyle}>Controls: W, A, S, D or Arrow Keys | Spacebar to Kick</div>
			<button onClick={onExit} style={exitButtonStyle}>
				Exit
			</button>
		</div>
	);
}
