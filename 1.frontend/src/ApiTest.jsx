
import { useState } from "react";
import api from "./services/api";

function ApiTest() {
  const [message, setMessage] = useState("Testing connection...");
  const [error, setError] = useState("");

  async function testConnection() {
    try {
      setError("");
      const response = await api.get("/api/test");
      setMessage(response.data);
    } catch (err) {
      setMessage("");
      setError(
        "Connection failed. Make sure the backend is running."
      );
    }
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>SafeSignal Backend Test</h2>
      <button onClick={testConnection}>
        Test Backend Connection
      </button>

      <p>{message}</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default ApiTest;
