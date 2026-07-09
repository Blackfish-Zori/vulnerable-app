import React, { useState } from "react";

// ⚠️ INTENTIONALLY VULNERABLE COMPONENT — open redirect & client-side SSRF-style fetch
function RedirectAndFetch() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");

  const handleRedirect = (e) => {
    e.preventDefault();
    // Vulnerable: open redirect — navigates to any attacker-supplied URL with no allow-list.
    window.location.href = url;
  };

  const handleFetch = async (e) => {
    e.preventDefault();
    try {
      // Vulnerable: fetch target fully controlled by user input, no allow-list/validation
      // (client-side analog of server-side SSRF; also enables data exfiltration).
      const resp = await fetch(url);
      const text = await resp.text();
      setResult(text.slice(0, 500));
    } catch (err) {
      setResult("Error: " + err.message);
    }
  };

  return (
    <div className="panel">
      <h2>External Link Preview (open redirect / SSRF test target)</h2>
      <form>
        <input
          placeholder="https://example.com or javascript:alert(1)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={handleRedirect}>Go to URL</button>
        <button onClick={handleFetch}>Fetch & Preview URL</button>
      </form>
      {result && <pre className="fetch-output">{result}</pre>}
    </div>
  );
}

export default RedirectAndFetch;
