// ⚠️ INTENTIONALLY INSECURE — hardcoded secrets for SAST secret-scanning tests.
// A real app must NEVER commit credentials like this.

export const config = {
  // Hardcoded API key (classic SAST secret-detection target)
  STRIPE_API_KEY: "sk_live_51H8f2kJ9x7QwErTyUiOpAsDfGhJkLzXcVbNm0000000000",

  // Hardcoded AWS credentials
  AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE",
  AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",

  // Hardcoded database connection string with embedded password
  DB_CONNECTION_STRING: "postgres://admin:SuperSecret123!@db.internal.example.com:5432/appdb",

  // Hardcoded JWT signing secret
  JWT_SECRET: "my-super-secret-jwt-key-do-not-use-in-prod",

  // Hardcoded third-party token
  GITHUB_TOKEN: "ghp_16C7e42F292c6912E7710c838347Ae178B4a",

  API_BASE_URL: "http://api.internal.example.com", // insecure: plain HTTP
};

export default config;
