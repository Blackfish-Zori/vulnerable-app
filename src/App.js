import "./App.css";
import XssDemo from "./components/XssDemo";
import InsecureStorage from "./components/InsecureStorage";
import RedirectAndFetch from "./components/RedirectAndFetch";
import config from "./config";

// ⚠️ This app is intentionally vulnerable. Do not deploy it publicly
// or reuse any of its patterns in real projects.
function App() {
  return (
    <div className="App">
      <header className="App-header-simple">
        <h1>Vulnerable Test App</h1>
        <p>
          A deliberately insecure React app for SAST / DAST tool evaluation.
        </p>
        {/* Vulnerable: secret leaked into rendered HTML/JS bundle */}
        <p style={{ fontSize: "0.7em", opacity: 0.6 }}>
          debug: api base = {config.API_BASE_URL}
        </p>
      </header>

      <main>
        <XssDemo />
        <InsecureStorage />
        <RedirectAndFetch />
      </main>
    </div>
  );
}

export default App;
