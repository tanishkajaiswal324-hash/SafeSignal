
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (password.length < 8) {
      setIsError(true);
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/auth/register", {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      // Registration creates the account; it does not log the user in.
      navigate("/login", {
        replace: true,
        state: {
          message:
            response.data.message ||
            "Registration successful! Please log in.",
        },
      });
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.message ||
          "Registration failed. Please check the backend and database."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <nav className="navbar auth-navbar">
        <div className="container">
          <Link to="/" className="navbar-brand auth-logo">
            🛡️ SafeSignal
          </Link>
          <Link to="/login" className="btn btn-outline-light">
            Login
          </Link>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="card auth-card">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="auth-icon">🛡️</div>
                  <h2 className="auth-title">Create SafeSignal Account</h2>
                  <p className="text-muted">
                    Register to use SafeSignal features
                  </p>
                </div>

                <form onSubmit={handleRegister}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="form-control auth-input"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="form-control auth-input"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="form-control auth-input"
                      placeholder="Create a password (8+ characters)"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="confirmPassword"
                      className="form-label fw-semibold"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="form-control auth-input"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  {message && (
                    <div
                      className={`alert ${
                        isError ? "alert-danger" : "alert-success"
                      }`}
                      role="alert"
                    >
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn auth-button text-white w-100"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="mb-1">Already have an account?</p>
                  <Link to="/login" className="fw-semibold">
                    Login
                  </Link>
                </div>

                <div className="text-center mt-4">
                  <Link to="/" className="text-muted">
                    ← Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
