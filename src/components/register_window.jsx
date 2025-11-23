import { useState } from "react";
import Input from "./input";

export default function RegisterWindow({ onClose, onSwitchToLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (password.length < 12) {
            alert("Password must be at least 12 characters long.");
            return;
        } else if ((!/[A-Z]/.test(password)) && (!/[a-z]/.test(password)) && (!/[0-9]/.test(password)) && (!/[!@#$%^&*]/.test(password))) {
            alert("Password must contain at least one uppercase, lowercase letter, number and special symbol.");
            return;
        }

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL;

            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration successful! Please log in.");
                onSwitchToLogin();
            } else {
                alert(data.message || "Registration failed.");
            }
        } catch (error) {
            console.error("Error registering user:", error);
            alert("Server error. Please try again later.");
        }
    };

    const overlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
    };

    const windowStyle = {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "2rem",
        borderRadius: "1rem",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: "100%",
        maxWidth: "24rem",
        margin: "0 1rem",
        maxHeight: "90vh",
        overflowY: "auto"
    };

    return (
        <div style={overlayStyle}>
            <div style={windowStyle}>
                <h2 className="text-2xl font-semibold text-center mb-6">Create Account</h2>
                <form onSubmit={handleRegister}>
                    <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        Register
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-gray-400 text-white py-2 rounded-lg mt-3 hover:bg-gray-500 transition"
                    >
                        Cancel
                    </button>

                    <div className="text-sm text-center text-gray-600 mt-4">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Login here
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}