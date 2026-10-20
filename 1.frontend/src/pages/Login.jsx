
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      setLoading(true);

      const response = await api.post("/api/auth/login", {
        email: email.trim(),
        password,
      });

      const user = {
        fullName: response.data.fullName,
        email: response.data.email,
        role: response.data.role,
      };

      localStorage.removeItem("safesignal-user");
      sessionStorage.removeItem("safesignal-user");

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("safesignal-user", JSON.stringify(user));

      if (user.role === "MODERATOR") {
        navigate("/moderator", { replace: true });
      } else {
        navigate("/safety", { replace: true });
      }
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.message ||
          "Login failed. Please check your email, password and backend."
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
          <Link to="/register" className="btn btn-outline-light">
            Create Account
          </Link>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card auth-card">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="auth-icon">🛡️</div>
                  <h2 className="auth-title">Welcome Back</h2>
                  <p className="text-muted">
                    Login to your SafeSignal account
                  </p>
                </div>

                {location.state?.message && (
                  <div className="alert alert-success" role="alert">
                    {location.state.message}
                  </div>
                )}

                <form onSubmit={handleLogin}>
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
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <div className="form-check mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Remember me
                    </label>
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
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="mb-1">Don't have a SafeSignal account?</p>
                  <Link to="/register" className="fw-semibold">
                    Create an account
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

export default Login;
