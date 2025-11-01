import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Dashboard from "./components/dashboard";
import Home from "./Pages/home";
import Game from "./Pages/game";
import Leaderboard from "./Pages/leaderboard";
import Profile from "./Pages/profile";

function App() {
  return (
    <Router>
      <Dashboard />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
