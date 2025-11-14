import { useState } from "react";
import "../Pages-style/game_settings.css"

export default function GameSettings({ onStart }) {
	const [matchDuration, setMatchDuration] = useState(180)
	const [goalLimit, setGoalLimit] = useState(5)
	const [roomIdInput, setRoomIdInput] = useState("");
  	const [isJoining, setIsJoining] = useState(false);

	const handleStartGame = async () => {
		try {
			let roomId;

			if (isJoining && roomIdInput.trim() !== "") {
				roomId = roomIdInput.trim().toUpperCase();
			} else {
				const res = await fetch("https://soccer-super-stars.fly.dev/create", {
				method: "POST"
				});
				const data = await res.json();
				roomId = data.roomId;
			}

		onStart({ matchDurationSec: matchDuration, goalLimit, roomId });
		} catch (err) {
		console.error("Failed to start/join game room:", err);
		}
	};

	return (
		<div className="settingsBox">
			<h3 className="settingsTitle">Game Settings</h3>

			<div>
				<div className="settingsLabel">Match Duration</div>
				<select
					value={matchDuration}
					onChange={(e) => setMatchDuration(Number(e.target.value))}
					className="settingsSelect"
				>
					<option value={60}>1 minute</option>
					<option value={120}>2 minutes</option>
					<option value={180}>3 minutes</option>
					<option value={300}>5 minutes</option>
				</select>
			</div>

			<div className="settingsGroup">
				<div className="settingsLabel">Goals to Score</div>
				<select
					value={goalLimit}
					onChange={(e) => setGoalLimit(Number(e.target.value))}
					className="settingsSelect"
				>
					<option value={3}>3 Goals</option>
					<option value={5}>5 Goals</option>
					<option value={7}>7 Goals</option>
					<option value={10}>10 Goals</option>
				</select>
			</div>

			<div className="settingsGroup">
			<label>
			<input
				type="checkbox"
				checked={isJoining}
				onChange={() => setIsJoining(!isJoining)}
			/>{" "}
			Join Existing Room
			</label>

			{isJoining && (
			<input
				type="text"
				placeholder="Enter Room ID"
				value={roomIdInput}
				onChange={(e) => setRoomIdInput(e.target.value)}
				className="settingsInput"
			/>
			)}
		</div>

		<button onClick={handleStartGame} className="settingsButton">
			{isJoining ? "Join Game" : "Start Game"}
		</button>
		</div>
	);
}
