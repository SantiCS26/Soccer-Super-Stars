import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <nav className="flex gap-6 p-4 bg-gray-800 text-white shadow-md">
      <Link to="/" className="hover:text-blue-400">Home page</Link>
      <Link to="/game" className="hover:text-blue-400">Play Game</Link>
      <Link to="/leaderboard" className="hover:text-blue-400">Leaderboard</Link>
      <Link to="/profile" className="hover:text-blue-400">My Profile</Link>
    </nav>
  );
}