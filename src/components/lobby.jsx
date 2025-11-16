import "../Pages-style/lobby.css";

export default function Lobby({
	roomId,
	isHost,
	settings,
	players = [],
	onChangeSettings,
	onBack,
	onStart
}) {
	function handleDurationChange(event) {
		const value = Number(event.target.value);

		onChangeSettings((previousSettings) => {
			return {
				...previousSettings,
				matchDurationSec: value
			};
		});
	}

	function handleGoalLimitChange(event) {
		const value = Number(event.target.value);

		onChangeSettings((previousSettings) => {
			return {
				...previousSettings,
				goalLimit: value
			};
		});
	}

	return (
		<div className="lobbyContainer">
			<div className="lobbyHeader">
				<h2 className="lobbyTitle">Lobby</h2>
				<div className="lobbyCode">
					Code: <strong>{roomId}</strong>
				</div>
			</div>

			<div className="lobbyMain">

				<div className="lobbyColumn lobbyColumn--players">
					<h3 className="lobbySubTitle">Players</h3>
					<div className="lobbyPlayersBox">
						{players.length === 0 && (
							<div className="lobbyPlayersEmpty">Waiting for players to join…</div>
						)}

						{players.map((p) => (
							<div key={p.id} className="lobbyPlayerRow">
								<span className="lobbyPlayerId">{p.id}</span>
								<span className="lobbyPlayerFlags">{p.isHost && " (Host)"}</span>
							</div>
						))}
					</div>
				</div>

				<div className="lobbyColumn lobbyColumn--options">
					<h3 className="lobbySubTitle">Game Options</h3>

					<div className="lobbyOptionRow">
						<div className="settingsLabel">Match Duration</div>
						<select
							value={settings.matchDurationSec}
							onChange={handleDurationChange}
							disabled={!isHost}
							className="settingsSelect"
						>
							<option value={10}>10 seconds (test)</option>
							<option value={60}>1 minute</option>
							<option value={120}>2 minutes</option>
							<option value={180}>3 minutes</option>
							<option value={300}>5 minutes</option>
						</select>
					</div>

					<div className="lobbyOptionRow">
						<div className="settingsLabel">Goals to Score</div>
						<select
							value={settings.goalLimit}
							onChange={handleGoalLimitChange}
							disabled={!isHost}
							className="settingsSelect"
						>
							<option value={3}>3 Goals</option>
							<option value={5}>5 Goals</option>
							<option value={7}>7 Goals</option>
							<option value={10}>10 Goals</option>
						</select>
					</div>

					<div className="lobbyNote">Only the host can change options and start the game.</div>
				</div>
			</div>

			<div className="lobbyButtonRow">
				<button
					className="lobbyButton lobbyButton--secondary"
					onClick={onBack}
				>
					Back to Menu
				</button>

				{isHost && (
					<button
						className="lobbyButton lobbyButton--primary"
						onClick={onStart}
					>
						Start Game
					</button>
				)}
			</div>
		</div>
	);
}