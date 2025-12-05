import { useState, useEffect } from "react";
import "../Pages-style/global.css";
import { Link } from "react-router-dom";

export default function Home() {
	const [darkMode, setDarkMode] = useState(false);

	useEffect(() => {
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		setDarkMode(prefersDark);
		document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
	}, []);

	const toggleDark = () => {
		const newMode = !darkMode;
		setDarkMode(newMode);
		document.documentElement.setAttribute("data-theme", newMode ? "dark" : "light");
	};


  return (
    <div className="home-container">

      <button className="dark-toggle" onClick={toggleDark}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <section className="hero fade-in">
        <h1 className="hero-title slide-up">⚽ Soccer Super Stars</h1>
        <p className="hero-subtitle">
          Master your skills. Compete globally. Become the superstar you were meant to be.
        </p>

        <div className="hero-buttons fade-in-slow">
          <Link to="/game" className="btn-primary">Play Now</Link>
          <Link to="/leaderboard" className="btn-secondary">Leaderboard</Link>
        </div>
      </section>

      <section className="how-to-play fade-in">
        <h2 className="section-title">🎮 How to Play</h2>

        <ul className="info-list">
          <li><strong>Match Duration:</strong> Games last 5 minutes.</li>

          <li>
            <strong>Controls:</strong>
            <div className="control-icons">
              <div className="key">W</div>
              <div className="key-row">
                <div className="key">A</div>
                <div className="key">S</div>
                <div className="key">D</div>
              </div>

              <span className="or">or</span>

              <div className="arrows">
                <div className="arrow">↑</div>
                <div className="arrow-row">
                  <div className="arrow">←</div>
                  <div className="arrow">↓</div>
                  <div className="arrow">→</div>
                </div>
              </div>

              <div className="space-key">SPACE</div>
            </div>
          </li>

          <li><strong>Objective:</strong> Score more goals than your opponent.</li>
          <li><strong>Modes:</strong> Competitive or Casual play.</li>
        </ul>
      </section>

      <section className="modes fade-in">
        <h2 className="section-title">⚔️ Game Modes</h2>

        <div className="modes-grid">

          <div className="mode-card lift">
            <h3>🏆 Competitive Mode</h3>
            <p>Ranked 1v1 matchmaking for serious players.</p>
          </div>

          <div className="mode-card lift">
            <h3>🎮 Casual Mode</h3>
            <p>Quick, friendly matches with zero pressure.</p>
          </div>

          <div className="mode-card lift">
            <h3>📅 Daily Challenges</h3>
            <p>Earn bonus rewards for completing daily objectives.</p>
          </div>

          <div className="mode-card lift">
            <h3>📊 Player Stats</h3>
            <p>Track your wins, goals, streaks, and performance.</p>
          </div>

        </div>
      </section>

      <section className="footer-tagline fade-in-slow">
        <p>Train hard. Play harder. Become a legend.</p>
      </section>
    </div>
  );
}
