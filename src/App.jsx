import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import './App.css'
import Dashboard from "./components/dashboard";
import Home from "./Pages/home";
import Game from "./Pages/game";
import Leaderboard from "./Pages/leaderboard";
import Profile from "./Pages/profile";
import Login from "./Pages/login";
import Register from "./Pages/register";

function Layout({ children }) {
	const location = useLocation();

	return (
		<>
			{!hideDashboard && <Dashboard />}
			{children}
		</>
	);
}

function App() {
	return (
		<Router>
			<Layout>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/game" element={<Game />} />
					<Route path="/leaderboard" element={<Leaderboard />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
				</Routes>
			</Layout>
		</Router>
	);
}

export default App;
