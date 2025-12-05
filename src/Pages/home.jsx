import "../Pages-style/home.css";

export default function Home() {

  return (
    <div className="home-container fade-in">
      
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text slide-up">
            <span className="badge">New Season Live ⚽</span>
            <h1 className="hero-title">
              Dominate the Pitch. <br />
              <span className="gradient-text">Become a Legend.</span>
            </h1>
            <p className="hero-subtitle">
              Experience the fastest 1v1 soccer engine on the web. 
              Master your mechanics, climb the global leaderboards, and prove 
              you have what it takes to be a Super Star.
            </p>
          </div>
          
          <div className="hero-visual fade-in-slow">
            <div className="stat-card floating">
              <div className="stat-header">Global Rank</div>
              <div className="stat-number">#1</div>
              <div className="stat-label">Current Champion</div>
            </div>
            <div className="visual-circle"></div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <h2 className="section-header">Select Your Mode</h2>
        <div className="grid-container">
          <div className="feature-card">
            <div className="icon">🏆</div>
            <h3>Competitive League</h3>
            <p>Ranked 1v1 matchmaking. Win matches to gain ELO and unlock exclusive seasonal rewards.</p>
          </div>

          <div className="feature-card">
            <div className="icon">🎮</div>
            <h3>Casual Match</h3>
            <p>Practice your mechanics or play against friends with zero pressure. No ELO loss.</p>
          </div>
        </div>
      </section>

      <section className="section-block how-to-play">
        <div className="content-split">
          <div className="text-side">
            <h2 className="section-header">Master Controls</h2>
            <p>Precision is key. Use WASD or Arrow keys to maneuver. Spacebar to shoot. Hold Space for power shots.</p>
            
            <ul className="specs-list">
              <li><strong>Match Time:</strong> 5 Minutes</li>
              <li><strong>Overtime:</strong> Golden Goal</li>
              <li><strong>Physics:</strong> Arcade Realism</li>
            </ul>
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
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>Soccer Super Stars &copy; 2025. Train hard. Play harder.</p>
      </footer>
    </div>
  );
}
