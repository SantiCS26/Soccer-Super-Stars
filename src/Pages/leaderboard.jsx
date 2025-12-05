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
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-900 text-white p-6">

        <div className="hidden md:block absolute left-0 top-0 h-full w-40 bg-gradient-to-r from-gray-800/60 to-transparent pointer-events-none"></div>

        <div className="hidden md:block absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-gray-800/60 to-transparent pointer-events-none"></div>

        <img
            src="../../design_images/soccer-player-left.png"
            className="hidden lg:block absolute left-0 bottom-10 w-48 opacity-25"
            alt="Player Left"
        />

        <img
            src="../../design_images/soccer-player-right.png"
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
