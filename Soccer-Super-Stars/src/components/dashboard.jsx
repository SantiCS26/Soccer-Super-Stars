import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        padding: "16px",
        backgroundColor: "#1f2937",
        color: "white",
      }}
    >
      <Link to="/">Home page</Link>
      <Link to="/game">Play Game</Link>
      <Link to="/leaderboard">Leaderboard</Link>
      <Link to="/profile">My Profile</Link>
    </nav>
  );
}