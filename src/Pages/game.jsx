import { useState } from "react";
import GameSettings from "../components/game_settings.jsx";
import GamePlay from "../components/game_play.jsx";

import "../Pages-style/global.css"

export default function GamePage() {
	const [gameStatus, setGameStatus] = useState("menu");
	const [gameSettings, setGameSettings] = useState(null);

	let content
	if (gameStatus === "menu") {
		content = (
			<GameSettings
				onStart={(config) => {
					setGameSettings(config)
					setGameStatus("playing")
				}}
			/>
		)
	} else {
		content = (
			<GamePlay
				settings={gameSettings}
				onExit={() => setGameStatus("menu")}
			/>
		)
	}

	return (
		<div className="pageWrapper">
			<h1 className="pageTitle">Play Game</h1>
			{content}
		</div>
	)
}
