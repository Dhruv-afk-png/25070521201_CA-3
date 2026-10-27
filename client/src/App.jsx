
import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";

import {
  signupUser,
  loginUser,
  getThreats,
  createThreat,
  updateThreat,
  deleteThreat,
} from "./api";

function HomePage({ threatCount }) {
  return (
    <>
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="status-dot"></span>
            YOUR DIGITAL SAFETY STARTS HERE
          </div>

          <h1>
            Stay Ahead.
            <br />
            Stay <span>Secure.</span>
          </h1>

          <p>
            Understand cyber threats, protect your digital identity,
            and build smarter online habits with CyberShield.
          </p>

          <Link className="primary-button" to="/threats">
            Explore Threats <span>→</span>
          </Link>

          <div className="hero-note">
            <span>✓</span> Awareness is your first line of defence.
          </div>
        </div>

        <div className="security-visual">
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>

          <div className="shield">
            <svg viewBox="0 0 100 110" role="img" aria-label="Security shield">
              <path
                d="M50 5 L88 20 V49 C88 75 72 94 50 105 C28 94 12 75 12 49 V20 Z"
                fill="#0c2434"
                stroke="#35e6d0"
                strokeWidth="2.5"
              />
              <path
                d="M33 54 L45 66 L69 40"
                fill="none"
                stroke="#35e6d0"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="visual-label">
            <span className="status-dot"></span>
            PROTECTION THROUGH KNOWLEDGE
          </div>

          <div className="floating-tag tag-top">
            ✳ Threat Awareness
          </div>
          <div className="floating-tag tag-bottom">
            ✓ Learn. Identify. Protect.
          </div>
        </div>
      </section>

      <section className="stats">
        <div>
          <strong>{threatCount}</strong>
          <span>Threat categories</span>
        </div>
        <div>
          <strong>24/7</strong>
          <span>Security awareness</span>
        </div>
        <div>
          <strong>100%</strong>
          <span>Learn to stay alert</span>
        </div>
      </section>

      <section className="tips-section">
        <span className="section-label">YOUR DIGITAL DEFENCE</span>
        <h2>Start protecting yourself today.</h2>
        <p>
          Learn how to recognise online threats and develop safer
          digital habits.
        </p>
        <Link className="primary-button" to="/tips">
          Explore Security Tips →
        </Link>
      </section>
    </>
  );
}

function ThreatsPage({
  threats,
  loading,
  refreshThreats,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingThreat, setEditingThreat] = useState(null);
  const [threatName, setThreatName] = useState("");
  const [threatDescription, setThreatDescription] = useState("");
  const [threatSeverity, setThreatSeverity] = useState("Medium");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function startAddThreat() {
    setEditingThreat(null);
    setThreatName("");
    setThreatDescription("");
    setThreatSeverity("Medium");
    setMessage("");
    setShowForm(true);
  }

  function startEditThreat(threat) {
    setEditingThreat(threat);
    setThreatName(threat.name);
    setThreatDescription(threat.description);
    setThreatSeverity(threat.severity);
    setMessage("");
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    const threatData = {
      name: threatName.trim(),
      description: threatDescription.trim(),
      severity: threatSeverity,
    };

    try {
      if (editingThreat) {
        await updateThreat(editingThreat._id, threatData);
        setMessage("Threat updated successfully!");
      } else {
        await createThreat(threatData);
        setMessage("Threat created successfully!");
      }

      setShowForm(false);
      setEditingThreat(null);
      setThreatName("");
      setThreatDescription("");
      setThreatSeverity("Medium");

      await refreshThreats();
    } catch (error) {
      setMessage(error.message || "Unable to save threat.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(threat) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${threat.name}"?`
    );

    if (!confirmed) return;

    setMessage("");

    try {
      await deleteThreat(threat._id);
      setMessage("Threat deleted successfully!");
      await refreshThreats();
    } catch (error) {
      setMessage(error.message || "Unable to delete threat.");
    }
  }

  return (
    <section className="threat-section" id="threats">
      <div className="section-heading">
        <div>
          <span className="section-label">KNOW YOUR ENEMY</span>
          <h2>Explore Cyber Threats</h2>
          <p>
            Recognise common attacks and learn how to protect yourself.
          </p>
        </div>

        <span className="live-label">
          <span className="status-dot"></span>
          DATABASE CONNECTED
        </span>
      </div>

      <div className="crud-toolbar">
        <p>Manage the cybersecurity threat database.</p>
        <button className="crud-add-button" onClick={startAddThreat}>
          + Add Threat
        </button>
      </div>

      {message && (
        <p className="crud-message" role="status">
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Dismiss message">
            ×
          </button>
        </p>
      )}

      {showForm && (
        <form className="crud-form" onSubmit={handleSubmit}>
          <h3>{editingThreat ? "Edit Threat" : "Add New Threat"}</h3>

          <label>
            Threat Name
            <input
              type="text"
              value={threatName}
              onChange={(event) => setThreatName(event.target.value)}
              placeholder="e.g. Phishing"
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={threatDescription}
              onChange={(event) =>
                setThreatDescription(event.target.value)
              }
              placeholder="Describe the cyber threat..."
              rows={3}
              required
            />
          </label>

          <label>
            Severity
            <select
              value={threatSeverity}
              onChange={(event) => setThreatSeverity(event.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </label>

          <div className="crud-form-actions">
            <button
              type="submit"
              className="crud-add-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingThreat
                  ? "Save Changes"
                  : "Create Threat"}
            </button>

            <button
              type="button"
              className="crud-cancel-button"
              onClick={() => {
                setShowForm(false);
                setEditingThreat(null);
                setMessage("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="message">Loading threat library...</p>
      ) : threats.length === 0 ? (
        <p className="message">
          No threats found. Add your first threat above.
        </p>
      ) : (
        <div className="threat-grid">
          {threats.map((threat) => (
            <article className="threat-card" key={threat._id}>
              <div className="card-top">
                <span className="card-symbol">⌘</span>
                <span
                  className={`severity ${threat.severity.toLowerCase()}`}
                >
                  {threat.severity}
                </span>
              </div>

              <h3>{threat.name}</h3>
              <p>{threat.description}</p>

              <Link to="/tips">
                Learn to stay safe <span>↗</span>
              </Link>

              <div className="crud-card-actions">
                <button onClick={() => startEditThreat(threat)}>
                  Edit
                </button>
                <button
                  className="crud-delete-button"
                  onClick={() => handleDelete(threat)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function TipsPage() {
  const tips = [
    {
      number: "01",
      title: "Use strong passwords",
      description:
        "Create unique passwords for each account. A password manager can help you store them safely.",
    },
    {
      number: "02",
      title: "Verify every link",
      description:
        "Check the sender and website address before opening links or downloading attachments.",
    },
    {
      number: "03",
      title: "Enable two-factor authentication",
      description:
        "Add another verification step to help protect your accounts if your password is stolen.",
    },
    {
      number: "04",
      title: "Keep software updated",
      description:
        "Install security updates for your operating system, browser, and applications.",
    },
    {
      number: "05",
      title: "Avoid suspicious downloads",
      description:
        "Download applications only from trusted sources and keep security protection enabled.",
    },
    {
      number: "06",
      title: "Protect personal information",
      description:
        "Avoid sharing passwords, OTPs, banking details, or sensitive information with strangers.",
    },
  ];

  return (
    <section className="tips-section" id="tips">
      <span className="section-label">YOUR DIGITAL DEFENCE</span>
      <h2>Security Tips</h2>
      <p>
        Simple practices can make a big difference in keeping your
        digital life secure.
      </p>

      <div className="tips-grid">
        {tips.map((tip) => (
          <article key={tip.number}>
            <span>{tip.number}</span>
            <h3>{tip.title}</h3>
            <p>{tip.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function App() {
  const location = useLocation();

  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [authMode, setAuthMode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cybershieldUser")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    refreshThreats();
  }, []);

  async function refreshThreats() {
    try {
      const data = await getThreats();
      setThreats(data);
    } catch (error) {
      console.error("Threat loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  function openAuth(mode) {
    setAuthMode(mode);
    setName("");
    setEmail("");
    setPassword("");
    setMessage("");
  }

  async function handleAuth(event) {
    event.preventDefault();
    setAuthLoading(true);
    setMessage("");

    try {
      const formData =
        authMode === "signup"
          ? { name, email, password }
          : { email, password };

      const data =
        authMode === "signup"
          ? await signupUser(formData)
          : await loginUser(formData);

      localStorage.setItem("cybershieldUser", JSON.stringify(data.user));
      localStorage.setItem("cybershieldToken", data.token);

      setCurrentUser(data.user);
      setAuthMode("");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("cybershieldUser");
    localStorage.removeItem("cybershieldToken");
    setCurrentUser(null);
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link className="brand" to="/">
          <span className="brand-icon">S</span>
          CyberShield
        </Link>

        <div className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/threats">
            Threat Library
          </NavLink>
          <NavLink to="/tips">
            Security Tips
          </NavLink>
        </div>

        <div className="auth-nav">
          {currentUser ? (
            <>
              <span className="welcome-user">
                Hi, {currentUser.name}
              </span>
              <button className="nav-button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="login-button"
                onClick={() => openAuth("login")}
              >
                Login
              </button>
              <button
                className="nav-button"
                onClick={() => openAuth("signup")}
              >
                Get Started ↗
              </button>
            </>
          )}
        </div>
      </nav>

      <main>
        <Routes>
          <Route
            path="/"
            element={<HomePage threatCount={threats.length} />}
          />

          <Route
            path="/threats"
            element={
              <ThreatsPage
                threats={threats}
                loading={loading}
                refreshThreats={refreshThreats}
              />
            }
          />

          <Route path="/tips" element={<TipsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer>
        <Link className="brand" to="/">
          CyberShield
        </Link>
        <p>Building safer digital habits, one user at a time.</p>
        <span>© 2026 CyberShield</span>
      </footer>

      {authMode && (
        <div
          className="auth-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setAuthMode("");
            }
          }}
        >
          <div className="auth-modal">
            <button
              className="auth-close"
              onClick={() => setAuthMode("")}
              aria-label="Close"
            >
              ×
            </button>

            <span className="section-label">CYBERSHIELD ACCOUNT</span>

            <h2>
              {authMode === "signup"
                ? "Create your account"
                : "Welcome back"}
            </h2>

            <p className="auth-description">
              {authMode === "signup"
                ? "Join CyberShield and build safer digital habits."
                : "Log in to your CyberShield account."}
            </p>

            <form onSubmit={handleAuth}>
              {authMode === "signup" && (
                <label>
                  Full name
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  placeholder={
                    authMode === "signup"
                      ? "At least 8 characters"
                      : "Enter your password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={authMode === "signup" ? 8 : undefined}
                  required
                />
              </label>

              {message && (
                <p className="auth-error" role="alert">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "signup"
                    ? "Create Account →"
                    : "Login →"}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === "signup"
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                onClick={() =>
                  openAuth(authMode === "signup" ? "login" : "signup")
                }
              >
                {authMode === "signup" ? "Login" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
