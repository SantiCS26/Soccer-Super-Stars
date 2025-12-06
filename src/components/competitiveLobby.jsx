import "../Pages-style/lobby.css";

export default function CompetitiveLobby({ roomId, players }) {
    return (
        <div className="lobbyContainer">
            <div className="lobbyHeader">
                <h2 className="lobbyTitle">Competitive Match</h2>
                <div className="lobbyCode">Match Code: <strong>{roomId}</strong></div>
            </div>

            <div className="lobbyMain">
                <div className="lobbyColumn lobbyColumn--players">
                    <h3 className="lobbySubTitle">Players</h3>

                    <div className="lobbyPlayersBox">
                        {players.length === 0 && (
                            <div className="lobbyPlayersEmpty">Waiting for opponent…</div>
                        )}

                        {players.map((p) => (
                            <div key={p.id} className="lobbyPlayerRow">
                                <span className="lobbyPlayerId">{p.username}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lobbyColumn lobbyColumn--options">
                    <h3 className="lobbySubTitle">Game Rules</h3>

                    <div className="lobbyOptionRow">
                        <div>Match Duration:</div>
                        <strong>3 minutes</strong>
                    </div>

                    <div className="lobbyOptionRow">
                        <div>Goal Limit:</div>
                        <strong>5 goals</strong>
                    </div>

                    <div className="lobbyNote">
                        Competitive settings are fixed and cannot be changed.
                        The match will start automatically when 2 players join.
                    </div>
                </div>
            </div>
        </div>
    );
}
