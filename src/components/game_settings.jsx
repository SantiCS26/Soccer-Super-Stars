import { useState } from "react";
import "../Pages-style/game_settings.css"

export default function GameSettings({
	onHost,
	onJoin,
	onCompetitive,
	onCasualSearch
}) {
	const [roomCode, setRoomCode] = useState("");

	const handleHostClick = async () => {
		try {
			const res = await fetch("https://soccer-super-stars.fly.dev/create", {
				method: "POST"
			});
			const data = await res.json();
			if (!data.roomId) {
				console.error("No roomId returned from /create");
				return;
			}
			onHost({ roomId: data.roomId.toUpperCase(), mode: "host" });
		} catch (err) {
			console.error("Failed to create lobby:", err);
			alert("Could not create lobby, please try again.");
		}
	};

	const handleJoinClick = () => {
		const trimmed = roomCode.trim().toUpperCase();
		if (!trimmed) {
			alert("Enter a lobby code first.");
			return;
		}
		onJoin({ roomId: trimmed, mode: "join" });
	};

	const handleCompetitiveRandomClick = () => {
		if (onCompetitive) {
			onCompetitive({ mode: "competitive" });
		}
	};

	const handleCasualRandomClick = () => {
		if (onCasualSearch) {
			onCasualSearch({ mode: "casual" });
		}
	};

	return (
		<div className="settingsBox">
			<h3 className="settingsLabel">Create a Lobby</h3>

			<div className="settingsGroup">
				<button
					className="settingsButton"
					onClick={handleHostClick}
				>
					Host Game
				</button>
			</div>

			<div className="settingsGroup" style={{ marginTop: 24 }}>
				<h3 className="settingsLabel">Join a Lobby</h3>
				<input
					type="text"
					placeholder="Enter Lobby Code"
					value={roomCode}
					onChange={(e) => setRoomCode(e.target.value)}
					className="settingsInput"
				/>
				<button
					className="settingsButton"
					style={{ marginTop: 12 }}
					onClick={handleJoinClick}
				>
					Join Game
				</button>
			</div>

			<div className="settingsGroup randomGroup">
				<h3 className="settingsLabel">Or Join Random Match</h3>

				<button
					className="settingsButton randomCompetitive"
					onClick={handleCompetitiveRandomClick}
				>
					Competitive Match
				</button>

				<button
					className="settingsButton randomCasual"
					onClick={handleCasualRandomClick}
				>
					Casual Match
				</button>
			</div>
		</div>
	);
}
