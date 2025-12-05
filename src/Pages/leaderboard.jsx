import { useState, useEffect } from "react";
import "../Pages-style/global.css"
import "../Pages-style/leaderboard.css";
import playerLeft from "../../design_images/soccer-player-left.png";
import playerRight from "../../design_images/soccer-player-right.png";

export default function Leaderboard() {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL;
                const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
                const data = await response.json();
                
                
                if (response.ok) {
                    setPlayers(data.players);
                } else {
                    console.error("Leaderboard load error:", data.message);
                }
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
            }
        };

        fetchLeaderboard();
    }, []);

	return (
        <div className="leaderboard-page fade-in">
            
            <img
                src={playerLeft}
                className="player-deco player-left"
                alt="Decoration Left"
            />
            <img
                src={playerRight}
                className="player-deco player-right"
                alt="Decoration Right"
            />

            <h1 className="page-title">Leaderboard</h1>

            <div className="leaderboard-card slide-up">
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Username</th>
                            <th>Score</th>
                        </tr>
                    </thead>

                    <tbody>
                        {players.map((value, key) => (
                            <tr key={key}>
                                <td className="rank-cell">#{key + 1}</td>
                                <td className="user-cell">{value.username}</td>
                                <td className="score-cell">{value.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
