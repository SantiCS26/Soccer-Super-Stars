import { useState } from "react";
import Input from "./input";

export default function LoginWindow({ onClose, onSuccess }) {
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

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
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

                    <button
                        type="button"
                        onClick={() => { onClose(); onSuccess("guest"); }}
                        className="w-full bg-gray-700 text-white py-2 rounded-lg mt-3 hover:bg-gray-800 transition"
                    >
                        Continue as Guest
                    </button>
                </form>
            </div>
        </div>
    );
}
