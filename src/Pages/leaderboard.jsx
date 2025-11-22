import { useState, useEffect } from "react";
import "../Pages-style/global.css"
import "../Pages-style/leaderboard.css";

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
		<div className="pageWrapper">
			<h1 className="pageTitle">Leaderboard</h1>

            <div className="Leaderboard">
                <table>
                    <tbody>
                        <tr>
                            <th>Ranking #</th>
                            <th>Username</th>
                            <th>Score</th>
                        </tr> 
                    
                    {players.map((value, key) => {
                        return (
                            <tr key={key}>
                                <td>{key + 1}</td>
                                <td>{value.username}</td>
                                <td>{value.score}</td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
