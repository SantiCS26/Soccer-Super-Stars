import { useState } from "react";
import Input from "./input";

export default function LoginWindow({ onClose, onSuccess, onSwitchToRegister }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL;

            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess();   
                onClose();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    const overlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
    };

    const windowStyle = {
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        padding: "2rem",
        borderRadius: "1rem",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        width: "100%",
        maxWidth: "24rem",
        margin: "0 1rem",
        maxHeight: "90vh",
        overflowY: "auto"
    };

    return (
        <div style={overlayStyle}>
            <div style={windowStyle}>
                <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

                <form onSubmit={handleLogin}>
                    <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-gray-400 text-white py-2 rounded-lg mt-3 hover:bg-gray-500 transition"
                    >
                        Cancel
                    </button>

                    <div className="text-sm text-center text-gray-600 mt-4">
                        Need to create an account?{" "}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Register here
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
