import { useState } from "react";

export default function RequestCode() {
  const [phone, setPhone] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPairingCode("");

    try {
      const res = await fetch("/api/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to get code");

      setPairingCode(data.pairingCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 20 }}>Neon WhatsApp Session Generator</h1>

      <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
        <input
          type="text"
          placeholder="Enter phone number (e.g. +2348123456789)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={{
            padding: "10px 15px",
            borderRadius: 6,
            border: "1px solid #555",
            outline: "none",
            width: 300,
            marginRight: 10,
            color: "#fff",
            background: "#111",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#00ff88",
            border: "none",
            borderRadius: 6,
            padding: "10px 20px",
            cursor: "pointer",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          {loading ? "Requesting..." : "Get Pairing Code"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: 20 }}>Error: {error}</p>
      )}

      {pairingCode && (
        <div
          style={{
            background: "#111",
            padding: 20,
            marginTop: 30,
            borderRadius: 8,
            border: "1px solid #333",
          }}
        >
          <h3>Your Pairing Code:</h3>
          <h1 style={{ letterSpacing: "3px", color: "#00ff88" }}>
            {pairingCode}
          </h1>
          <p>Enter this code on your WhatsApp to pair your device.</p>
        </div>
      )}
    </div>
  );
}
