import { Link } from "react-router-dom";
import "../App.css";

function Home() {
  return (
    <div className="safesignal-page">

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg safesignal-navbar">
        <div className="container">

          <Link to="/" className="navbar-brand safesignal-logo">
            <span className="logo-icon">🛡️</span>
            SafeSignal
          </Link>

          <div className="navbar-nav ms-auto d-flex flex-row align-items-center gap-2">

            <a href="#home" className="nav-link">
              Home
            </a>

            <a href="#features" className="nav-link">
              Features
            </a>

            <a href="#how-it-works" className="nav-link">
              How It Works
            </a>

            <a href="#privacy" className="nav-link">
              Privacy
            </a>

            <Link to="/login" className="btn login-btn">
              Login
            </Link>

            <Link to="/register" className="btn get-started-btn">
              Get Started
            </Link>

          </div>

        </div>
      </nav>


      {/* HERO */}
      <section id="home" className="hero-section">

        <div className="hero-image"></div>

        <div className="hero-overlay"></div>

        <div className="container hero-content">

          <div className="row align-items-center">

            {/* LEFT */}
            <div className="col-lg-7">

              <div className="hero-badge">
                ✦ WOMEN'S SAFETY • SMART MOBILITY
              </div>

              <h1 className="hero-title">
                Your Journey.
                <br />
                <span>Your Information.</span>
                <br />
                <strong>Your Choice.</strong>
              </h1>

              <p className="hero-description">
                SafeSignal helps women make more informed journey
                decisions using location-based information,
                verified reports and available help points.
              </p>

              <div className="hero-buttons">

                <Link
                  to="/safety"
                  className="btn hero-primary-btn"
                >
                  Explore SafeSignal →
                </Link>

                <Link
                  to="/login"
                  className="btn hero-secondary-btn"
                >
                  Login to Continue
                </Link>

              </div>

              <div className="trust-points">

                <div>
                  <span>✓</span>
                  Verified information
                </div>

                <div>
                  <span>✓</span>
                  Timestamped data
                </div>

                <div>
                  <span>✓</span>
                  User-controlled sharing
                </div>

              </div>

            </div>


            {/* RIGHT CARD */}
            <div className="col-lg-5">

              <div className="journey-card">

                <div className="live-label">
                  <span></span>
                  LIVE JOURNEY CONTEXT
                </div>

                <h3>
                  Context-Aware Journey
                </h3>

                <p>
                  Understand available information around
                  your journey before making a decision.
                </p>

                <div className="journey-items">

                  <div className="journey-item">

                    <div className="item-icon">
                      📍
                    </div>

                    <div>
                      <strong>Help Points</strong>
                      <small>Available locations</small>
                    </div>

                  </div>


                  <div className="journey-item">

                    <div className="item-icon">
                      💡
                    </div>

                    <div>
                      <strong>Lighting Information</strong>
                      <small>Documented local conditions</small>
                    </div>

                  </div>


                  <div className="journey-item">

                    <div className="item-icon">
                      ✓
                    </div>

                    <div>
                      <strong>Verified Reports</strong>
                      <small>Source & timestamp included</small>
                    </div>

                  </div>

                </div>

                <div className="context-note">

                  <strong>Important</strong>

                  <br />

                  No reported incident does not automatically
                  mean an area is safe.

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* FEATURES */}
      <section id="features" className="features-section">

        <div className="container">

          <div className="section-heading">

            <span>
              WHAT SAFESIGNAL PROVIDES
            </span>

            <h2>
              Information that adds context
            </h2>

            <p>
              Designed to help users understand available
              information without promising guaranteed safety.
            </p>

          </div>


          <div className="row g-4">

            <div className="col-md-4">

              <div className="feature-card">

                <div className="feature-icon blue">
                  🗺️
                </div>

                <h4>
                  Route Comparison
                </h4>

                <p>
                  Compare documented information about
                  different routes and local conditions.
                </p>

              </div>

            </div>


            <div className="col-md-4">

              <div className="feature-card">

                <div className="feature-icon purple">
                  📍
                </div>

                <h4>
                  Verified Help Points
                </h4>

                <p>
                  Discover participating support locations
                  with verification and update information.
                </p>

              </div>

            </div>


            <div className="col-md-4">

              <div className="feature-card">

                <div className="feature-icon pink">
                  🔐
                </div>

                <h4>
                  Consent-Based Sharing
                </h4>

                <p>
                  Journey sharing remains controlled by the
                  user and can be shared with selected contacts.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section id="how-it-works" className="how-section">

        <div className="container">

          <div className="section-heading">

            <span>
              HOW IT WORKS
            </span>

            <h2>
              From information to informed decisions
            </h2>

          </div>


          <div className="row g-4">

            <div className="col-md-4">

              <div className="step-card">

                <div className="step-number">
                  01
                </div>

                <h4>
                  Choose your journey
                </h4>

                <p>
                  Enter your journey details and explore
                  available location-based information.
                </p>

              </div>

            </div>


            <div className="col-md-4">

              <div className="step-card">

                <div className="step-number">
                  02
                </div>

                <h4>
                  Understand the context
                </h4>

                <p>
                  Review reports, help points and other
                  documented information.
                </p>

              </div>

            </div>


            <div className="col-md-4">

              <div className="step-card">

                <div className="step-number">
                  03
                </div>

                <h4>
                  Make your choice
                </h4>

                <p>
                  Use the available information to make
                  your own journey decision.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* PRIVACY */}
      <section id="privacy" className="privacy-section">

        <div className="container">

          <div className="privacy-card">

            <div className="privacy-icon">
              🔒
            </div>

            <div>

              <span>
                PRIVACY FIRST
              </span>

              <h2>
                Your location. Your control.
              </h2>

              <p>
                Journey sharing is designed to be consent-based.
                Users decide whether and with whom their journey
                information is shared.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="safesignal-footer">

        <div className="container text-center">

          <div className="footer-logo">
            🛡️ SafeSignal
          </div>

          <p>
            A Safety Network That Understands Context
          </p>

          <small>
            © 2026 SafeSignal • Women’s Safety •
            Geospatial Technology
          </small>

        </div>

      </footer>

    </div>
  );
}

export default Home;