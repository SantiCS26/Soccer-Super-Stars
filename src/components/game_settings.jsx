import { useState } from "react";
import "../Pages-style/game_settings.css"

export default function GameSettings({ onStart }) {
	const [matchDuration, setMatchDuration] = useState(180)
	const [goalLimit, setGoalLimit] = useState(5)

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

			<button 
				onClick={() => onStart({ matchDurationSec: matchDuration, goalLimit: goalLimit })}
				className="settingsButton"
			>
				Start Game
			</button>
		</div>
	)
}
