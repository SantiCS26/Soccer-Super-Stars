import "../Pages-style/global.css";
import "./profile.css";

export default function Profile() {
	return (
		<div className="profileWrapper">

			<div className="profileLeft">
				<div className="avatarSection">
					<label htmlFor="avatarUpload" className="avatarCircle">
						<img
							id="avatarPreview"
							src="/default-avatar.png"
							alt="Profile"
						/>
						<div className="avatarOverlay">Change</div>
					</label>
					<input
						id="avatarUpload"
						type="file"
						accept="image/*"
						style={{ display: "none" }}
						onChange={(e) => {
							const file = e.target.files[0];
							if (file) {
								const url = URL.createObjectURL(file);
								document.getElementById("avatarPreview").src = url;
							}
						}}
					/>
				</div>

				<h2 className="profileName">Player123</h2>

				<div className="statsBox">
					<h3>Player Stats</h3>
					<ul>
						<li>Matches Played: 42</li>
						<li>Wins: 25</li>
						<li>Losses: 15</li>
						<li>Goals Scored: 68</li>
						<li>Rank: Platinum III</li>
					</ul>
				</div>
			</div>

			<div className="profileRight">
				<h2 className="settingsHeader">Settings</h2>

				<div className="settingsCategory">
					<h3>Controls</h3>
					<p>Customize your movement and gameplay bindings.</p>
				</div>

				<div className="settingsCategory">
					<h3>Gameplay</h3>
					<p>Adjust camera, UI, and game speed preferences.</p>
				</div>

				<div className="settingsCategory">
					<h3>Accessibility</h3>
					<p>Options for colorblind mode, text size, and contrast.</p>
				</div>
			</div>
		</div>
	);
}
