import React, { useState } from "react";

// ⚠️ INTENTIONALLY VULNERABLE COMPONENT — insecure client-side storage & weak crypto
function InsecureStorage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ccNumber, setCcNumber] = useState("");
  const [status, setStatus] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Vulnerable: plaintext password stored in localStorage.
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);

    // Vulnerable: sensitive PII (credit card) stored in localStorage, unencrypted.
    localStorage.setItem("cc_number", ccNumber);

    // Vulnerable: "session token" generated with Math.random() (predictable/weak randomness)
    const weakToken = Math.random().toString(36).substring(2);
    localStorage.setItem("session_token", weakToken);

    // Vulnerable: weak "hash" using simple char code sum instead of a real crypto function
    const weakHash = password
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
      .toString();
    localStorage.setItem("password_hash", weakHash);

    document.cookie = `auth=${weakToken}; path=/`; // Vulnerable: no Secure/HttpOnly/SameSite flags

    setStatus("Logged in (insecurely) and stored credentials in localStorage.");
  };

  return (
    <div className="panel">
      <h2>Login (insecure storage test target)</h2>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          placeholder="Credit Card Number"
          value={ccNumber}
          onChange={(e) => setCcNumber(e.target.value)}
        />
        <button type="submit">Log In</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}

export default InsecureStorage;
