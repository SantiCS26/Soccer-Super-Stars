import { useState, useEffect } from "react";
import "../Pages-style/global.css";
import "../Pages-style/profile.css";

export default function Profile() {
	const [avatar, setAvatar] = useState("/default-avatar.png");
	const [playerName, setPlayerName] = useState("Loading...");

	useEffect(() => {
		async function fetchProfile() {
			try {
				const API_BASE_URL = import.meta.env.VITE_API_URL;

				const res = await fetch(`${API_BASE_URL}/api/profileData`, {
					method: "GET",
					credentials: "include",
				});

				const data = await res.json();

				if (data.success) {
					setPlayerName(data.playername);
				}
			} catch (err) {
				console.error("Failed to load profile:", err);
			}
		}

		fetchProfile();
	}, []);

	async function handleAvatarChange(e) {
		const file = e.target.files[0];
		if (!file) return;

		const previewUrl = URL.createObjectURL(file);
		setAvatar(previewUrl);

		const formData = new FormData();
		formData.append("avatar", file);

		const API_BASE_URL = import.meta.env.VITE_API_URL;

		const res = await fetch(`${API_BASE_URL}/api/upload-avatar`, {
			method: "POST",
			credentials: "include",
			body: formData,
		});

		const data = await res.json();

		if (data.avatar) {
			setAvatar(data.avatar);
		}
	}


	return (
		<div className="profileWrapper">

			<div className="profileLeft">
				<div className="avatarSection">
					<label htmlFor="avatarUpload" className="avatarCircle">
						<img src={avatar} alt="Profile" />
						<div className="avatarOverlay">Change</div>
					</label>

					<input
						id="avatarUpload"
						type="file"
						accept="image/*"
						style={{ display: "none" }}
						onChange={handleAvatarChange}
					/>
				</div>

				<h2 className="profileName">{playerName}</h2>

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
