import { useState, useEffect, useRef } from "react";

import Field from "./field.jsx";
import Player from "./player.jsx";
import Ball from "./ball.jsx";
import Goal from "./goal.jsx";
import Powerup from "./powerup.jsx";

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
	const basePlayerSpeed = PLAYER_SPEED;

	const playerElementRef = useRef(null);
	const opponentElementRef = useRef(null);
	const lastFrameTimeRef = useRef(null);
	const animationFrameRef = useRef(null);

	const keyInputsRef = useGameInputs();
	const lastSpaceDownRef = useRef(false);
	const matchTimerStartedRef = useRef(false);
	const matchTimerIdRef = useRef(null);
	const lastUseKeyDownRef = useRef(false);
	const lastDiscardKeyDownRef = useRef(false);

	const scoreReportedRef = useRef(false);

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

	const [powerups, setPowerups] = useState([]);
	const [myHeldPowerup, setMyHeldPowerup] = useState(null);
	const [myActivePowerup, setMyActivePowerup] = useState(null);

	const reportMatchResult = async (won, isCompetitive) => {
		if (!isCompetitive || scoreReportedRef.current) {
			return;
		}

		scoreReportedRef.current = true;

		try {
			const API_BASE_URL = import.meta.env.VITE_API_URL;
			const response = await fetch(`${API_BASE_URL}/api/match-result`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ roomId, won }),
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				console.log("Score updated:", data);
			} else {
				console.error("Failed to update score");
			}
		} catch (error) {
			console.error("Error reporting match result:", error);
		}
	};

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
				const speedMult =
					myActivePowerup &&
					myActivePowerup.effects &&
					typeof myActivePowerup.effects.speedMultiplier === "number"
						? myActivePowerup.effects.speedMultiplier
						: 1;

				const effectiveSpeed = basePlayerSpeed * speedMult;

				movePlayer(
					playerDataRef.current,
					keyInputsRef.current,
					deltaTime,
					fieldWidth,
					fieldHeight,
					effectiveSpeed
				);
			}


			const isSpaceDown = !!(keyState[" "] || keyState["space"] || keyState["spacebar"]);

			if (isSpaceDown && !lastSpaceDownRef.current) {
				if (socket && roomId) {
					socket.emit("kickBall", { roomId });
				}
			}

			lastSpaceDownRef.current = isSpaceDown;

			const useKeyDown = !!(keyState["k"] || keyState["K"]);
			const discardKeyDown = !!(keyState["l"] || keyState["L"]);

			if (useKeyDown && !lastUseKeyDownRef.current) {
				if (socket && roomId) {
					socket.emit("usePowerup", { roomId });
				}
			}

			if (discardKeyDown && !lastDiscardKeyDownRef.current) {
				if (socket && roomId) {
					socket.emit("discardPowerup", { roomId });
				}
			}

			lastUseKeyDownRef.current = useKeyDown;
			lastDiscardKeyDownRef.current = discardKeyDown;


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
	}, [socket, roomId, canMove, keyInputsRef, myActivePowerup]);

	useEffect(() => {
		if (!socket || !roomId) {
			return;
		}

			function handleGameState({ ball, score, round, powerupsOnField, playerPowerups }) {
				if (ball) {
					setBallState(ball);
				}

				if (score) {
					setScore(score);
				}

				if (typeof round === "number") {
					setServerRound(round);
				}

				if (Array.isArray(powerupsOnField)) {
					setPowerups(powerupsOnField);
				}

				if (playerPowerups && socket) {
					const myState = playerPowerups[socket.id];
					if (myState) {
						setMyHeldPowerup(myState.heldTypeId || null);
						setMyActivePowerup(myState.active || null);
					} else {
						setMyHeldPowerup(null);
						setMyActivePowerup(null);
					}
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

		//testing
		function handleMatchEnded({ score, winnerSide, isCompetitive }) {
			console.log("Match ended:", score, "winner:", winnerSide);

			setCanMove(false);

			let myScore;
			let opponentScore;

			if (isHost) {
				myScore = score.left;
				opponentScore = score.right;
			} else {
				myScore = score.right;
				opponentScore = score.left;
			}

			const won = myScore > opponentScore;

			if (isCompetitive) {
				reportMatchResult(won, isCompetitive);
			}

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
	}, [socket, roomId, onExit, isHost]);

	const wrapperStyle = {
		width: fieldWidth,
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

	const hudRowStyle = {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12
	};

	const powerupHudStyle = {
		flex: 1,
		marginRight: 14,
		padding: "8px 12px",
		borderRadius: 12,
		background: "rgba(15,23,42,0.9)",
		border: "1px solid rgba(148,163,184,0.7)",
		boxShadow: "0 3px 10px rgba(15,23,42,0.9)",
		display: "flex",
		alignItems: "center",
		gap: 8,
		fontSize: 15,
		minHeight: 32
	};

	const powerupLabelStyle = {
		fontSize: 15,
		fontWeight: 700,
		textTransform: "uppercase",
		letterSpacing: "0.18em",
		color: "#94a3b8"
	};

	const powerupNameStyle = {
		fontSize: 15,
		fontWeight: 600
	};

	const powerupTimeStyle = {
		fontSize: 15,
		fontWeight: 500,
		marginLeft: 12
	};

	const scoreHudStyle = {
		padding: "8px 14px",
		borderRadius: 12,
		background: "rgba(15,23,42,0.95)",
		border: "1px solid rgba(148,163,184,0.8)",
		boxShadow: "0 3px 10px rgba(15,23,42,0.9)",
		fontSize: 15,
		color: "#e5e7eb",
		whiteSpace: "nowrap",
		marginRight: 10,
		display: "flex",
		alignItems: "center",
		minHeight: 32,
		minWidth: 150
	};

	const timeHudStyle = {
		padding: "8px 14px",
		borderRadius: 12,
		background: "rgba(15,23,42,0.95)",
		border: "1px solid rgba(59,130,246,0.85)",
		boxShadow: "0 4px 14px rgba(37,99,235,0.85)",
		fontSize: 15,
		fontWeight: 600,
		color: "#eff6ff",
		whiteSpace: "nowrap",
		display: "flex",
		alignItems: "center",
		minHeight: 32,
		minWidth: 150
	};

	const countdownOverlayStyle = {
		position: "absolute",
		top: "25%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		fontSize: 48,
		fontWeight: 900,
		color: "#ffffff",
		textShadow: "0 6px 18px rgba(0, 0, 0, 0.6)",
		pointerEvents: "none"
	};

	function getPowerupLabel(typeId) {
		if (!typeId) {
			return "None";
		}

		switch (typeId) {
			case "speed_boost":
				return "4x Speed";
			case "mega_kick":
				return "4x Kick Power";
			case "long_range":
				return "Long Range";
			case "tank_mode":
				return "Tank Mode";
			case "slippery_boots":
				return "Slippery Boots";
			case "hyper_dash":
				return "Hyper Dash";
			case "precision_kick":
				return "Precision Kick";
			case "sticky_shot":
				return "Sticky Shot";
			case "agility_mode":
				return "Agility Mode";
			case "heavy_weight":
				return "Heavy Weight";
			default:
				return typeId;
		}
	}

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

	let powerupNameText = "None";
	let powerupNameColor = "#94a3b8";
	let powerupTimeText = "";

	if (myActivePowerup && myActivePowerup.typeId) {
		const label = getPowerupLabel(myActivePowerup.typeId);
		powerupNameText = label;
		powerupNameColor = "#22c55e";

		if (myActivePowerup.expiresAt) {
			const msRemaining = myActivePowerup.expiresAt - Date.now();
			if (msRemaining > 0) {
				const secs = Math.ceil(msRemaining / 1000);
				powerupTimeText = `${secs}s`;
			}
		}
	} else if (myHeldPowerup) {
		const label = getPowerupLabel(myHeldPowerup);
		powerupNameText = label;
		powerupNameColor = "#e5e7eb";
	} else {
		powerupNameText = "None";
		powerupNameColor = "#94a3b8";
	}

	const powerupNameDynamicStyle = {
		...powerupNameStyle,
		color: powerupNameColor
	};

	return (
		<div style={wrapperStyle}>
			<div style={hudRowStyle}>
				<div style={powerupHudStyle}>
					<span style={powerupLabelStyle}>Power-Up:</span>
					<span style={powerupNameDynamicStyle}>{powerupNameText}</span>
					{powerupTimeText && (
						<span style={powerupTimeStyle}>{powerupTimeText}</span>
					)}
				</div>

				<div style={scoreHudStyle}>
					<span>You: {myScore}</span>
					<span style={{ marginLeft: 12 }}>Opponent: {opponentScore}</span>
				</div>

				<div style={timeHudStyle}>
					Time Left: {formatMatchTime(remainingTime)}
				</div>
			</div>

			<div style={{ position: "relative" }}>
				<Field>
					<Goal side="left" />
					<Goal side="right" />

					{powerups.map((p) => (
						<Powerup
							key={p.id}
							x={p.x}
							y={p.y}
							typeId={p.typeId}
						/>
					))}

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

			<div style={helpTextStyle}>
				Controls: W, A, S, D or Arrow Keys | Spacebar: Kick | K: Use Power-Up | L: Discard Power-Up
			</div>

			<button onClick={onExit} style={exitButtonStyle}>
				Exit Match
			</button>
		</div>
	);
}
