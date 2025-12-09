import "../Pages-style/home.css";
import { NavLink } from "react-router-dom";

export default function Home() {

	return (
		<div className="home-container">
			
			<section className="hero-section">
				<div className="hero-content">
					<div className="hero-text">
						<span className="badge">⚽ Welcome to Soccer Super Stars</span>
						<h1 className="hero-title">
							Master Your Skills. <br />
							<span className="gradient-text">Climb the Ranks.</span>
						</h1>
						<p className="hero-subtitle">
							Fast-paced 1v1 soccer gameplay. Test your reflexes, perfect your 
							strategy, and compete on the leaderboard. Every match is a new 
							challenge.
						</p>
						<div className="hero-buttons">
							<NavLink to="/game" className="btn-primary">🎮 Start Playing</NavLink>
							<NavLink to="/leaderboard" className="btn-secondary">🏆 Leaderboard</NavLink>
						</div>
					</div>
					
					<div className="hero-visual">
						<div className="stat-card floating">
							<div className="stat-header">Ready to Play?</div>
							<div className="stat-number">1v1</div>
							<div className="stat-label">Soccer Showdown</div>
						</div>
						<div className="visual-circle"></div>
					</div>
				</div>
			</section>

			<section className="section-block">
				<h2 className="section-header">Game Modes</h2>
				<div className="grid-container">
					<div className="feature-card">
						<div className="icon">🏆</div>
						<h3>Ranked Match</h3>
						<p>Compete in ranked 1v1 matches. Win to increase your ELO rating and climb the global leaderboard. Every match affects your standing.</p>
						<ul className="feature-list">
							<li>✓ ELO-based matchmaking</li>
							<li>✓ Track your progress</li>
							<li>✓ Competitive gameplay</li>
						</ul>
					</div>

					<div className="feature-card">
						<div className="icon">⚡</div>
						<h3>Quick Match</h3>
						<p>Practice your skills in casual matches. Perfect for warming up or learning the mechanics without affecting your ranking.</p>
						<ul className="feature-list">
							<li>✓ No ranking pressure</li>
							<li>✓ Practice mechanics</li>
							<li>✓ Quick gameplay</li>
						</ul>
					</div>
				</div>

				<div className="custom-lobby-section">
					<div className="feature-card custom-lobby">
						<div className="icon">🎮</div>
						<h3>Custom Lobby</h3>
						<p>Create your own private matches with custom rules. Invite friends, adjust match settings, and play your way.</p>
						<ul className="feature-list horizontal">
							<li>✓ Create private lobbies</li>
							<li>✓ Customize match settings</li>
							<li>✓ Invite friends to play</li>
							<li>✓ Host tournaments</li>
						</ul>
					</div>
				</div>
			</section>

			<section className="section-block how-to-play">
				<h2 className="section-header">How to Play</h2>
				<div className="content-split">
					<div className="text-side">
						<p className="intro-text">Simple controls, competitive gameplay. Master the basics and develop your own strategies.</p>
						
						<div className="rules-grid">
							<div className="rule-item">
								<div className="rule-icon">⏱️</div>
								<div className="rule-content">
									<h4>5-Minute Matches</h4>
									<p>Fast-paced games. Score more goals than your opponent to win.</p>
								</div>
							</div>
							<div className="rule-item">
								<div className="rule-icon">⚽</div>
								<div className="rule-content">
									<h4>Golden Goal Overtime</h4>
									<p>If tied after regulation, first goal in overtime wins.</p>
								</div>
							</div>
							<div className="rule-item">
								<div className="rule-icon">🎯</div>
								<div className="rule-content">
									<h4>Skill-Based</h4>
									<p>Physics-based gameplay rewards precision and timing.</p>
								</div>
							</div>
						</div>
					</div>

					<div className="controls-visual">
						<div className="keyboard-layout">
							<div className="key-group">
								<div className="key">W</div>
								<div className="row">
									<div className="key">A</div>
									<div className="key">S</div>
									<div className="key">D</div>
								</div>
								<div className="label">Movement</div>
							</div>

							<div className="divider"></div>

							<div className="key-group">
								<div className="space-key">SPACE</div>
								<div className="label">Shoot / Sprint</div>
							</div>
						</div>
						<p className="controls-hint">💡 Hold SPACE for power shots</p>
					</div>
				</div>
			</section>

			<footer className="home-footer">
				<div className="footer-content">
					<div className="footer-brand">
						<span className="footer-logo">⚽</span>
						<span className="footer-name">Soccer Super Stars</span>
					</div>
					<p className="footer-copyright">© 2025 Soccer Super Stars • Drexel CS375</p>
				</div>
			</footer>
		</div>
	);
}