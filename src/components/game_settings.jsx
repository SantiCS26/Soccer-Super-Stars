import { useState } from "react";
import "../Pages-style/game_settings.css"

export default function GameSettings({ onHost, onJoin }) {
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
			onHost(data.roomId.toUpperCase());
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
		onJoin(trimmed);
	};

	async function onJoinCompetitive() {
		const res = await fetch("https://soccer-super-stars.fly.dev/join", {
			method: "POST",
			credentials: "include"
		});

		const data = await res.json();

		if (data.matched) {
			onJoin(data.roomId);
		} else {
			alert("Waiting for another player with similar skill…");
		}
	}

	const onJoinCasual = () => {
		onJoin("RANDOM_CASUAL");
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
					onClick={onJoinCompetitive}
				>
					Competitive Match
				</button>

				<button
					className="settingsButton randomCasual"
					onClick={onJoinCasual}
				>
					Casual Match
				</button>
			</div>
		</div>
	);
}
