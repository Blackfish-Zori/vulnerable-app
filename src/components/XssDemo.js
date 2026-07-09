import React, { useState, useRef, useEffect } from "react";

// ⚠️ INTENTIONALLY VULNERABLE COMPONENT — Reflected & DOM-based XSS
// Do not use these patterns in production code.
function XssDemo() {
  const [comment, setComment] = useState("");
  const [rendered, setRendered] = useState("");
  const rawDivRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Vulnerable: raw user input rendered via dangerouslySetInnerHTML with no sanitization.
    setRendered(comment);
  };

  useEffect(() => {
    if (rawDivRef.current) {
      // Vulnerable: user input written directly into innerHTML (DOM XSS sink).
      const params = new URLSearchParams(window.location.search);
      const name = params.get("name");
      if (name) {
        rawDivRef.current.innerHTML = "Hello, " + name + "!";
      }
    }
  }, []);

  const handleEvalDemo = () => {
    // Vulnerable: eval() on user-controlled input.
    // eslint-disable-next-line no-eval
    eval(comment);
  };

  return (
    <div className="panel">
      <h2>Comment Box (XSS test target)</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Try: <img src=x onerror=alert(1)>"
        />
        <button type="submit">Post Comment</button>
        <button type="button" onClick={handleEvalDemo}>
          Run as script (eval demo)
        </button>
      </form>

      {/* Vulnerable sink: renders raw HTML from user input */}
      <div
        className="comment-output"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />

      {/* Vulnerable sink: DOM XSS via location.search -> innerHTML */}
      <div ref={rawDivRef} className="greeting-output" />
    </div>
  );
}

export default XssDemo;
