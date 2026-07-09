# Vulnerable Test App

A deliberately insecure application, scaffolded with `create-react-app`, built
for exercising **SAST** (static analysis) and **DAST** (dynamic/running-app
scanning) tools. It is **not** a production template — do not deploy it
publicly or reuse these patterns.

## What's inside

```
vulnerable-test-app/
├── src/
│   ├── config.js                  # hardcoded secrets (SAST secret-scanning)
│   ├── App.js                     # wires up the panels below
│   └── components/
│       ├── XssDemo.js             # reflected/DOM XSS, eval()
│       ├── InsecureStorage.js     # localStorage secrets, weak crypto/random, cookie flags
│       └── RedirectAndFetch.js    # open redirect, client-side SSRF-style fetch
├── backend/                       # OPTIONAL companion server for DAST
│   ├── server.js                  # SQLi, command injection, path traversal, SSRF, IDOR, CORS, etc.
│   └── public/readme.txt
└── package.json                   # includes known-vulnerable dependency versions
```

## Running the frontend (SAST + basic DAST target)

```bash
cd vulnerable-test-app
npm install
npm start        # http://localhost:3000
```

Point your SAST tool at the `src/` folder (and `package.json`/`package-lock.json`
for software-composition-analysis / dependency scanning). Point your DAST tool
at `http://localhost:3000` once it's running.

## Running the backend (adds real server-side surface for DAST)

A pure client-side React app gives a DAST scanner very little to interact
with — no server logic, no real injection points. The `backend/` folder adds
a small Express API with classic server-side bugs so a scanner (e.g. OWASP
ZAP, Burp Suite) has something to actually crawl and attack.

```bash
cd vulnerable-test-app/backend
npm install
npm start        # http://localhost:4000
```

Run it alongside the frontend (`npm start` in the project root) for the full
test rig.

## Vulnerabilities included

### Frontend (React / `src/`)
| Vulnerability | Location | Notes |
|---|---|---|
| Hardcoded secrets (API keys, AWS creds, DB connection string, JWT secret) | `src/config.js` | Classic SAST secret-detection targets |
| Reflected XSS | `XssDemo.js` (`dangerouslySetInnerHTML`) | User input rendered as raw HTML |
| DOM-based XSS | `XssDemo.js` (`innerHTML` from `location.search`) | Sink fed by untrusted URL param |
| Use of `eval()` on user input | `XssDemo.js` | Code injection sink |
| Sensitive data in `localStorage` | `InsecureStorage.js` | Password, credit card, session token stored unencrypted |
| Insecure cookie (no `Secure`/`HttpOnly`/`SameSite`) | `InsecureStorage.js` | |
| Weak randomness (`Math.random()` for tokens) | `InsecureStorage.js` | Predictable session tokens |
| Weak/home-grown "hashing" | `InsecureStorage.js` | Not a real cryptographic hash |
| Open redirect | `RedirectAndFetch.js` | Unvalidated `window.location.href` |
| Client-side SSRF-style fetch | `RedirectAndFetch.js` | Fetches attacker-supplied URL with no allow-list |
| Vulnerable dependency versions | `package.json` | `lodash@4.17.15`, `axios@0.21.0`, `jsonwebtoken@8.5.1`, `js-yaml@3.13.0` — all have known CVEs, good for SCA/dependency-audit tools |

### Backend (`backend/server.js`, optional, for DAST)
| Vulnerability | Endpoint |
|---|---|
| SQL Injection | `GET /api/users/search?username=` |
| Command Injection | `GET /api/ping?host=` |
| Path Traversal | `GET /api/files?name=` |
| Server-Side Request Forgery | `GET /api/fetch-url?url=` |
| Insecure Direct Object Reference (IDOR) | `GET /api/users/:id` |
| Reflected XSS (server-rendered) | `GET /api/greet?name=` |
| Hardcoded JWT secret / weak auth | `POST /api/login` |
| Wide-open CORS (`origin: true, credentials: true`) | all routes |
| Missing security headers (no CSP/HSTS/X-Frame-Options) | all routes |
| Verbose error messages (stack/DB errors returned to client) | several routes |

## Suggested manual test cases

- `XssDemo`: submit `<img src=x onerror=alert(1)>` in the comment box; visit
  `http://localhost:3000/?name=<script>alert(1)</script>`.
- `InsecureStorage`: log in, then inspect DevTools → Application → Local
  Storage / Cookies.
- `RedirectAndFetch`: try `javascript:alert(1)` or a non-allow-listed internal
  URL.
- Backend: `curl "http://localhost:4000/api/users/search?username=' OR '1'='1"`,
  `curl "http://localhost:4000/api/ping?host=127.0.0.1;whoami"`,
  `curl "http://localhost:4000/api/files?name=../server.js"`.

## Cleanup / safety notes

- Never expose this app to the public internet.
- Rotate/never reuse the dummy secrets in `config.js` — they're fake but the
  *format* is realistic on purpose for detection testing.
- Consider running both frontend and backend in an isolated container/VM
  when pointing real DAST scanners at them.
