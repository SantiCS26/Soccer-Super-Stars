import { useState, useEffect } from "react";
import { io } from "socket.io-client";

import GameSettings from "../components/game_settings.jsx";
import GamePlay from "../components/game_play.jsx";
import Lobby from "../components/lobby.jsx";

import "../Pages-style/home.css";
import "../Pages-style/game.css";

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
	const [mode, setMode] = useState("casual"); 
	const [settings, setSettings] = useState({
		matchDurationSec: 180,
		goalLimit: 5
	});

	const [searchStartTime, setSearchStartTime] = useState(null);
	const [searchElapsed, setSearchElapsed] = useState(0);
	const [matchFoundInfo, setMatchFoundInfo] = useState(null);

	const [username, setUsername] = useState(null);

	useEffect(() => {
		async function fetchUser() {
			try {
				const res = await fetch(`${SOCKET_URL}/api/validate-token`, {
					credentials: "include",
				});
				const data = await res.json();
				if (data.valid) {
					setUsername(data.username);
				} else {
					setUsername(null);
				}
			} catch (err) {
				console.error("Failed to validate token", err);
				setUsername(null);
			}
		}

		fetchUser();
	}, []);

	useEffect(() => {
		if (socketConnection && username) {
			socketConnection.emit("competitiveAttach", { username });
			console.log("Sent competitiveAttach for", username);
		}
	}, [socketConnection, username]);

	useEffect(() => {
		const newSocket = io(SOCKET_URL, {
			path: "/socket.io/",
			transports: ["websocket"],
		});

		setSocketConnection(newSocket);

		newSocket.on("connect", () => {
			console.log("Socket connected (client):", newSocket.id);

			if (username) {
				newSocket.emit("competitiveAttach", { username });
				newSocket.emit("casualAttach", { username });
			}
		});

		newSocket.on("lobbyState", (state) => {
			console.log("lobbyState from server:", state);

			if (state.settings) {
				setSettings((previousSettings) => {
					return {
						...previousSettings,
						...state.settings,
					};
				});
			}

			if (state.players) {
				setPlayers(state.players);
			}
		});

		newSocket.on("competitiveMatched", ({ roomId, you, opponent, isHost }) => {
			console.log("Matched competitive game:", roomId, "isHost:", isHost);
			setMode("competitive");
			setRoomId(roomId);
			setIsHost(isHost || false);
			setMatchFoundInfo({
				roomId,
				mode: "competitive",
				you,
				opponent,
			});
			setPhase("matchFound");
			setSearchStartTime(null);
			setSearchElapsed(0);
		});

		newSocket.on("casualMatched", ({ roomId, you, opponent, isHost }) => {
			console.log("Matched casual game:", roomId, "isHost:", isHost);
			setMode("casual");
			setRoomId(roomId);
			setIsHost(isHost || false);
			setMatchFoundInfo({
				roomId,
				mode: "casual",
				you,
				opponent,
			});
			setPhase("matchFound");
			setSearchStartTime(null);
			setSearchElapsed(0);
		});

		newSocket.on("gameStarted", ({ settings: serverSettings }) => {
			console.log("gameStarted from server");

			if (serverSettings) {
				setSettings((previousSettings) => {
					return {
						...previousSettings,
						...serverSettings,
					};
				});
			}

			setPhase("playing");
		});

		newSocket.on("opponentLeft", () => {
			console.log("Opponent left the match");
			resetToMenu();
		});

		return () => {
			newSocket.disconnect();
		};
	}, [username]);

	useEffect(() => {
		if (phase !== "searching" || !searchStartTime) {
			setSearchElapsed(0);
			return;
		}

		const intervalId = setInterval(() => {
			setSearchElapsed(Math.floor((Date.now() - searchStartTime) / 1000));
		}, 1000);

		return () => clearInterval(intervalId);
	}, [phase, searchStartTime]);

	function handleHostCasual(hostRoomId) {
		const upperRoomId = hostRoomId.toUpperCase();

		setMode("casual");
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

	function handleJoinCasual(joinCode) {
		const upperRoomId = joinCode.toUpperCase();

		setMode("casual");
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

	async function handleSearchCompetitive() {
		if (!socketConnection) {
			console.warn("No socket connection yet");
			return;
		}

		setMode("competitive");
		setPhase("searching");
		setSearchStartTime(Date.now());

		const res = await fetch(
			`${SOCKET_URL}/join-competitive`,
			{
				method: "POST",
				credentials: "include",
			}
		);

		if (!res.ok) {
			setPhase("menu");
			setSearchStartTime(null);

			if (res.status === 401) {
				alert("Please log in before searching for a competitive match.");
			} else {
				alert("Unable to join competitive queue. Please try again.");
			}
			return;
		}

		const data = await res.json();

		if (data.matched) {
			console.log("Server says matched; waiting for VS screen event…");
		} else {
			console.log("Searching for competitive match...");
		}
	}

	async function handleSearchCasual() {
		if (!socketConnection) {
			console.warn("No socket connection yet");
			return;
		}

		setMode("casual");
		setPhase("searching");
		setSearchStartTime(Date.now());

		const res = await fetch(
			`${SOCKET_URL}/join-casual`,
			{
				method: "POST",
				credentials: "include",
			}
		);

		if (!res.ok) {
			setPhase("menu");
			setSearchStartTime(null);

			if (res.status === 401) {
				alert("Please log in before searching for a casual match.");
			} else {
				alert("Unable to join casual queue. Please try again.");
			}
			return;
		}

		const data = await res.json();

		if (data.matched) {
			console.log("Server says matched; waiting for VS screen event…");
		} else {
			console.log("Searching for casual match...");
		}
	}

	function handleChangeSettings(nextSettingsOrUpdater) {
		if (mode === "competitive") return;

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
			if (mode === "casual") {
				socketConnection.emit("startGame", {
					roomId,
					settings
				});
				setPhase("playing");
			} else {
				socketConnection.emit("playerReady", { roomId });
			}
		}
	}

	function handleExitGame() {
		handleBackToMenu();
	}

	let content = null;

	if (phase === "menu") {
		content = (
			<GameSettings
				mode={mode}
				onHost={handleHostCasual}
				onJoin={handleJoinCasual}
				onCompetitive={handleSearchCompetitive}
				onCasualSearch={handleSearchCasual}
			/>
		);
	} else if (phase === "searching") {
		const label = mode === "competitive" ? "competitive" : "casual";

		content = (
			<div className="searchingBox">
				<h2>Searching for a {label} match</h2>
				<p>Time in queue: {searchElapsed}s</p>
			</div>
		);
	} else if (phase === "matchFound" && matchFoundInfo) {
		content = (
			<div className="matchFoundBox">
				<h2>Match Found!</h2>
				<p>
					{matchFoundInfo.you} vs {matchFoundInfo.opponent}
				</p>
				<p>Starting in a moment…</p>
			</div>
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
		<div className="home-container">
			<div className="hero-visual">
				{content}
			</div>
		</div>
	);
}