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
        <div className="relative w-full min-h-screen flex flex-col items-center bg-gray-900 text-white p-6">

            <img
                src={playerLeft}
                className="hidden lg:block absolute left-0 bottom-10 w-48 opacity-25"
                alt="Player Left"
            />

            <img
                src={playerRight}
                className="hidden lg:block absolute right-0 top-10 w-48 opacity-25 scale-y-[-1]"
                alt="Player Right"
            />

            <h1 className="text-4xl font-bold mb-8 tracking-wide">Leaderboard</h1>

            <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-300 uppercase text-sm">
                            <th className="py-3">Ranking #</th>
                            <th className="py-3">Username</th>
                            <th className="py-3">Score</th>
                        </tr>
                    </thead>

                    <tbody>
                        {players.map((value, key) => (
                            <tr
                            key={key}
                            className="hover:bg-gray-700 transition-all duration-150"
                            >
                                <td className="py-3 font-semibold text-gray-200">{key + 1}</td>
                                <td className="py-3 text-gray-300">{value.username}</td>
                                <td className="py-3 text-gray-300">{value.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
