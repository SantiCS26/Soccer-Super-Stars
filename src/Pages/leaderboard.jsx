import "../Pages-style/global.css"
import "../Pages-style/leaderboard.css";

const players = [
    { username: "Joe", score: 50},
    { username: "Santi", score: 25},
    { username: "Joeski", score: 0},
];

export default function Leaderboard() {
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
