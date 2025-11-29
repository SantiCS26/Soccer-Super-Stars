import "../Pages-style/global.css";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <h1 className="hero-title">⚽ Soccer Super Stars</h1>
        <p className="hero-subtitle">
          Play matches, climb the leaderboard, and compete with players around the world.
        </p>

        <div className="hero-buttons">
          <Link to="/game" className="btn-primary">Play Now</Link>
          <Link to="/leaderboard" className="btn-secondary">View Leaderboard</Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h2>🔥 Competitive Mode</h2>
          <p>Challenge real players or AI, improve your score, and rise in global rankings.</p>
        </div>

        <div className="feature-card">
          <h2>🎮 Casual Matches</h2>
          <p>Kick back and play friendly matches with fun, dynamic gameplay.</p>
        </div>

        <div className="feature-card">
          <h2>📊 Player Stats</h2>
          <p>Track your wins, goals scored, form, and match performance in real time.</p>
        </div>

        <div className="feature-card">
          <h2>🏆 Daily Challenges</h2>
          <p>Play special matches every day and earn unique rewards.</p>
        </div>
      </section>

      <section className="footer-tagline">
        <p>Train hard. Play harder. Become a legend.</p>
      </section>
    </div>
  );
}
