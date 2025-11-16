import { useState, useEffect } from "react";
import { io } from "socket.io-client";

import GameSettings from "../components/game_settings.jsx";
import GamePlay from "../components/game_play.jsx";
import Lobby from "../components/lobby.jsx";

import "../Pages-style/global.css"

const SOCKET_URL =
	import.meta.env.DEV
		? "http://localhost:8080"
		: "https://soccer-super-stars.fly.dev";

export default function GamePage() {
	const [phase, setPhase] = useState("menu");
	const [roomId, setRoomId] = useState(null);
	const [isHost, setIsHost] = useState(false);
	const [socketConnection, setSocketConnection] = useState(null);
	const [players, setPlayers] = useState([]);
	const [settings, setSettings] = useState({
		matchDurationSec: 180,
		goalLimit: 5
	});

	useEffect(() => {
		const newSocket = io(SOCKET_URL, {
			path: "/socket.io/",
			transports: ["websocket"]
		});

		setSocketConnection(newSocket);

		newSocket.on("connect", () => {
			console.log("Socket connected (client):", newSocket.id);
		});

		newSocket.on("lobbyState", (state) => {
			console.log("lobbyState from server:", state);

			if (state.settings) {
				setSettings((previousSettings) => {
					return {
						...previousSettings,
						...state.settings
					};
				});
			}

			if (state.players) {
				setPlayers(state.players);
			}
		});

		newSocket.on("gameStarted", ({ settings: serverSettings }) => {
			console.log("gameStarted from server");

			if (serverSettings) {
				setSettings((previousSettings) => {
					return {
						...previousSettings,
						...serverSettings
					};
				});
			}

			setPhase("playing");
		});

		newSocket.on("joinError", (error) => {
			console.warn("joinError:", error);

			let message = "Could not join that lobby.";

			if (error && error.message) {
				message = error.message;
			}

			alert(message);

			setPhase("menu");
			setRoomId(null);
			setIsHost(false);
			setPlayers([]);
		});

		return () => {
			newSocket.disconnect();
		};
	}, []);

	function handleHost(hostRoomId) {
		const upperRoomId = hostRoomId.toUpperCase();

		setRoomId(upperRoomId);
		setIsHost(true);
		setPhase("lobby");

		if (socketConnection) {
			socketConnection.emit("joinRoom", {
				roomId: upperRoomId,
				isHost: true
			});
		}
	}

	function handleJoin(joinCode) {
		const upperRoomId = joinCode.toUpperCase();

		setRoomId(upperRoomId);
		setIsHost(false);
		setPhase("lobby");

		if (socketConnection) {
			socketConnection.emit("joinRoom", {
				roomId: upperRoomId,
				isHost: false
			});
		}
	}

	function handleChangeSettings(nextSettingsOrUpdater) {
		setSettings((previousSettings) => {
			let nextSettings = nextSettingsOrUpdater;

			if (typeof nextSettingsOrUpdater === "function") {
				nextSettings = nextSettingsOrUpdater(previousSettings);
			}

			if (isHost && socketConnection && roomId) {
				socketConnection.emit("updateSettings", {
					roomId: roomId,
					settings: nextSettings
				});
			}

			return nextSettings;
		});
	}

	function resetToMenu() {
		setPhase("menu");
		setRoomId(null);
		setIsHost(false);
		setPlayers([]);
		setSettings({
			matchDurationSec: 180,
			goalLimit: 5
		});
	}

	function handleBackToMenu() {
		if (socketConnection && roomId) {
			socketConnection.emit("leaveRoom", { roomId: roomId });
		}

		resetToMenu();
	}

	function handleStartGame() {
		if (socketConnection && roomId) {
			socketConnection.emit("startGame", {
				roomId: roomId,
				settings: settings
			});
		}

		setPhase("playing");
	}

	function handleExitGame() {
		handleBackToMenu();
	}

	let content = null;

	if (phase === "menu") {
		content = (
			<GameSettings
				onHost={handleHost}
				onJoin={handleJoin}
			/>
		);
	} else if (phase === "lobby") {
		content = (
			<Lobby
				roomId={roomId}
				isHost={isHost}
				settings={settings}
				players={players}
				onChangeSettings={handleChangeSettings}
				onBack={handleBackToMenu}
				onStart={handleStartGame}
			/>
		);
	} else if (phase === "playing") {
		content = (
			<GamePlay
				settings={settings}
				roomId={roomId}
				socket={socketConnection}
				isHost={isHost}
				onExit={handleExitGame}
			/>
		);
	}

	return (
		<div className="pageWrapper">
			<h1 className="pageTitle">Play Game</h1>
			{content}
		</div>
	);
}
