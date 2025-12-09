import { useState } from "react";
import "../Pages-style/game_settings.css"

import "../Pages-style/home.css"

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

	const handleCompetitiveRandomClick = () => {
		if (onCompetitive) {
			onCompetitive();
		}
	};

	const handleCasualRandomClick = () => {
		if (onCasualSearch) {
			onCasualSearch();
		}
	};

	return (
		<div className="settingsBox">
			<div className="settingsColumn settingsColumn-left">
				<div className="settingsGroup">
					<h3 className="settingsSectionTitle">Matchmaking</h3>
				</div>

				<div className="settingsGroup">
					<h4 className="settingsSubLabel">Competitive</h4>
					<p className="settingsOptionDescription">
						Ranked games with balanced matchmaking. Your performance impacts your MMR.
					</p>
					<button
						className="settingsButton randomCompetitive"
						onClick={handleCompetitiveRandomClick}
					>
						Start Search
					</button>
				</div>

				<div className="settingsGroup">
					<h4 className="settingsSubLabel">Casual</h4>
					<p className="settingsOptionDescription">
						Unranked matches with relaxed rules. Great for practice, testing lineups, or playing with friends.
					</p>
					<button
						className="settingsButton randomCasual"
						onClick={handleCasualRandomClick}
					>
						Start Search
					</button>
				</div>
			</div>

			<div className="settingsDivider" />

			<div className="settingsColumn settingsColumn-right">
				<div className="settingsGroup">
					<h3 className="settingsSectionTitle">Lobbies</h3>
				</div>

				<div className="settingsGroup">
					<h4 className="settingsSubLabel">Host Game</h4>
					<p className="settingsOptionDescription">
						Create a lobby and share the code so others can join. You control when the match starts.
					</p>
					<div className="settingsOption">
						<button
							className="settingsButton"
							onClick={handleHostClick}
						>
							Host Lobby
						</button>
					</div>
				</div>

				<div className="settingsGroup">
					<h4 className="settingsSubLabel">Join Game</h4>
					<p className="settingsOptionDescription">
						Use a lobby code from a friend or host to jump directly into their match.
					</p>
					<input
						type="text"
						placeholder="Enter Lobby Code"
						value={roomCode}
						onChange={(e) => setRoomCode(e.target.value)}
						className="settingsInput"
					/>
					<div className="settingsOption">
						<button
							className="settingsButton"
							onClick={handleJoinClick}
						>
							Join Lobby
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
