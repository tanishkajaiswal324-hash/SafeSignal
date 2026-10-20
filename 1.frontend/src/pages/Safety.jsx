
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import api from "../services/api";
import "../App.css";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
});

const startPointIcon = L.divIcon({
  className: "safesignal-map-pin-wrapper",
  html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#16a34a;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:#ffffff;font-size:16px;font-weight:800;">S</span></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -32],
});

const destinationPointIcon = L.divIcon({
  className: "safesignal-map-pin-wrapper",
  html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#dc2626;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:#ffffff;font-size:16px;font-weight:800;">D</span></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -32],
});

const DEFAULT_CENTER = [19.076, 72.8777];

function MapUpdater({ center, route }) {
  const map = useMap();

  useEffect(() => {
    if (route && route.length > 1) {
      map.fitBounds(L.latLngBounds(route), {
        padding: [40, 40],
        maxZoom: 14,
        animate: true,
      });
    } else if (center) {
      map.flyTo(center, 14, { duration: 0.8 });
    }
  }, [center, route, map]);

  return null;
}

function getSavedUser() {
  try {
    const saved =
      sessionStorage.getItem("safesignal-user") ||
      localStorage.getItem("safesignal-user");

    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function Safety() {
  const navigate = useNavigate();

  const [user, setUser] = useState(getSavedUser);

  const [reports, setReports] = useState([]);
  const [place, setPlace] = useState("");
  const [type, setType] = useState("Lighting");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");

  const [contact, setContact] = useState(() => {
    try {
      return localStorage.getItem("safesignal_trusted_contact") || "";
    } catch {
      return "";
    }
  });

  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [journey, setJourney] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  useEffect(() => {
    loadReports();
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("safesignal-user");
    localStorage.removeItem("safesignal-user");
    setUser(null);
    navigate("/", { replace: true });
  }

  function saveTrustedContact() {
    setMessage("");
    const normalized = contact.trim();

    if (!normalized) {
      setMessage("Please enter a trusted contact number first.");
      setContactSaved(false);
      return;
    }

    if (!/^[+0-9()\s-]{7,20}$/.test(normalized)) {
      setMessage("Please enter a valid contact number.");
      setContactSaved(false);
      return;
    }

    try {
      localStorage.setItem("safesignal_trusted_contact", normalized);
      setContact(normalized);
      setContactSaved(true);
      setMessage("Trusted contact saved in this browser on this device.");
    } catch {
      setContactSaved(false);
      setMessage("Could not save the contact in this browser.");
    }
  }

  async function shareJourney() {
    setMessage("");

    if (!journey) {
      setMessage("Please tick the journey-sharing consent checkbox first.");
      return;
    }

    let journeyText = "SafeSignal journey update\n";

    if (routeInfo) {
      journeyText +=
        `From: ${routeInfo.start.label}\n` +
        `To: ${routeInfo.destination.label}\n` +
        `Estimated distance: ${routeInfo.distanceKm} km\n` +
        `Estimated driving time: ${routeInfo.durationMin} minutes\n`;
    } else if (currentLocation) {
      journeyText +=
        `Current coordinates: ${currentLocation[0].toFixed(6)}, ` +
        `${currentLocation[1].toFixed(6)}\n`;
    } else {
      journeyText += "No route or current location is available yet.\n";
    }

    journeyText +=
      "This is a manually shared update, not live tracking.";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "SafeSignal Journey Update",
          text: journeyText,
        });
        setMessage("Journey update shared using your device's share options.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(journeyText);
        setMessage(
          "Journey update copied. You can paste it into a message."
        );
      } else {
        setMessage("Sharing is not supported by this browser.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setMessage("Could not share the journey update. Please try again.");
      }
    }
  }

  async function loadReports() {
    try {
      const response = await api.get("/api/reports");

      setReports(
        response.data.map((report) => ({
          id: report.id,
          type: report.category,
          place: report.location,
          details: report.details,
          time: report.createdAt
            ? new Date(report.createdAt).toLocaleString()
            : "Time unavailable",
          status: report.status || "PENDING_VERIFICATION",
        }))
      );
    } catch {
      setMessage("Could not load reports. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  }

  async function addReport(event) {
    event.preventDefault();
    setMessage("");

    if (!place.trim() || !details.trim()) {
      setMessage("Please enter the location and report details.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/api/reports", {
        category: type,
        location: place.trim(),
        details: details.trim(),
      });

      const saved = response.data;

      setReports((current) => [
        {
          id: saved.id,
          type: saved.category,
          place: saved.location,
          details: saved.details,
          time: saved.createdAt
            ? new Date(saved.createdAt).toLocaleString()
            : new Date().toLocaleString(),
          status: saved.status || "PENDING_VERIFICATION",
        },
        ...current,
      ]);

      setPlace("");
      setDetails("");
      setMessage("Report saved successfully in the database.");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Report could not be saved. Check the backend."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function useCurrentLocation() {
    setMessage("");

    if (!navigator.geolocation) {
      setMessage("Your browser does not support location access.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setCurrentLocation(coordinates);
        setMapCenter(coordinates);
        setStart(
          `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`
        );
        setLocationLoading(false);
        setMessage("Current location obtained from your browser.");
      },
      (error) => {
        setLocationLoading(false);

        if (error.code === 1) {
          setMessage(
            "Location permission was denied. Allow location access in your browser."
          );
        } else {
          setMessage(
            "Could not obtain your location. Check browser permission and try again."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  }

  async function geocodeAddress(address) {
    const value = address.trim();

    const coordinateMatch = value.match(
      /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/
    );

    if (coordinateMatch) {
      const lat = Number(coordinateMatch[1]);
      const lon = Number(coordinateMatch[2]);

      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        return {
          coordinates: [lat, lon],
          label: value,
        };
      }
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(value)}`
    );

    if (!response.ok) {
      throw new Error("Location search is temporarily unavailable.");
    }

    const results = await response.json();

    if (!results.length) {
      throw new Error(
        `Could not find "${value}". Try a more complete address or landmark.`
      );
    }

    return {
      coordinates: [
        Number(results[0].lat),
        Number(results[0].lon),
      ],
      label: results[0].display_name,
    };
  }

  async function compareRoutes(event) {
    event.preventDefault();
    setMessage("");
    setRoute([]);
    setRouteInfo(null);

    if (!start.trim() || !destination.trim()) {
      setMessage("Enter both the starting point and destination.");
      return;
    }

    setRouteLoading(true);

    try {
      const origin = await geocodeAddress(start);
      const target = await geocodeAddress(destination);

      const [startLat, startLon] = origin.coordinates;
      const [endLat, endLon] = target.coordinates;

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`
      );

      if (!response.ok) {
        throw new Error("The route service is temporarily unavailable.");
      }

      const data = await response.json();

      if (data.code !== "Ok" || !data.routes?.length) {
        throw new Error("No driving route was found for these locations.");
      }

      const selectedRoute = data.routes[0];

      const routeCoordinates = selectedRoute.geometry.coordinates.map(
        ([lon, lat]) => [lat, lon]
      );

      setRoute(routeCoordinates);
      setMapCenter(origin.coordinates);

      setRouteInfo({
        start: origin,
        destination: target,
        distanceKm: (selectedRoute.distance / 1000).toFixed(1),
        durationMin: Math.round(selectedRoute.duration / 60),
      });

      setMessage(
        "Route displayed successfully. This is a driving route, not a verified safety recommendation."
      );
    } catch (error) {
      setMessage(error.message || "Could not plan the route. Please try again.");
    } finally {
      setRouteLoading(false);
    }
  }

  return (
    <div className="safety-page">
      <nav className="navbar navbar-dark bg-dark px-3 px-md-5 py-3">
        <Link className="navbar-brand fw-bold" to="/">
          🛡️ SafeSignal
        </Link>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {user && (
            <div className="text-white small text-end">
              <div className="fw-semibold">{user.fullName || "User"}</div>
              <div>{user.email}</div>
            </div>
          )}

          <Link className="btn btn-outline-light btn-sm" to="/">
            Home
          </Link>

          {user ? (
            <button
              className="btn btn-danger btn-sm"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link className="btn btn-outline-light btn-sm" to="/login">
              Login
            </Link>
          )}
        </div>
      </nav>

      <main className="container py-5">
        <div
          className="p-4 p-md-5 rounded-4 text-white mb-4"
          style={{
            background: "linear-gradient(120deg, #10254b, #174ea6, #7138bd)",
          }}
        >
          <span className="badge bg-light text-primary mb-3">
            WOMEN'S SAFETY • SMART MOBILITY
          </span>
          <h1 className="display-5 fw-bold">Your Safety Dashboard</h1>
          <p className="lead mb-0">
            Explore locations, plan a route and submit reports about observed
            journey conditions.
          </p>
        </div>

        <div className="alert alert-warning">
          <strong>Important:</strong> This is a student project demo. Map routes
          are not verified safety routes. Reports are unverified until
          independently reviewed. No area is guaranteed safe, and this website
          does not automatically contact emergency services.
        </div>

        {message && (
          <div className="alert alert-info" role="status">
            {message}
          </div>
        )}

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body p-4">
                <h2 className="h5">📍 Current Location</h2>
                <p className="text-muted">
                  Request your device's current location after granting browser
                  permission.
                </p>
                <button
                  className="btn btn-outline-primary"
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? "Finding..." : "Find My Location"}
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body p-4">
                <h2 className="h5">💡 Safety Reports</h2>
                <p className="text-muted">
                  Submit an observation about lighting, accessibility or other
                  journey conditions.
                </p>
                <a href="#add-report" className="btn btn-outline-primary">
                  Add a Report
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body p-4">
                <h2 className="h5">🆘 Emergency Contacts</h2>
                <p className="text-muted">
                  Save a trusted contact and use your device's call or sharing
                  options.
                </p>
                <a href="#emergency" className="btn btn-outline-danger">
                  Set Contact
                </a>
              </div>
            </div>
          </div>
        </div>

        <section className="card shadow-sm border-0 mb-4" id="route">
          <div className="card-body p-4">
            <h2 className="h4">🧭 Journey Planner</h2>
            <p className="text-muted">
              Search for two places to display a driving route on the map. You
              can also use latitude and longitude coordinates.
            </p>

            <form onSubmit={compareRoutes}>
              <div className="row g-3">
                <div className="col-md-5">
                  <label className="form-label" htmlFor="start">
                    Starting point
                  </label>
                  <input
                    id="start"
                    className="form-control"
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                    placeholder="e.g. Bandra Railway Station, Mumbai"
                    required
                  />
                </div>

                <div className="col-md-5">
                  <label className="form-label" htmlFor="destination">
                    Destination
                  </label>
                  <input
                    id="destination"
                    className="form-control"
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder="e.g. Juhu Beach, Mumbai"
                    required
                  />
                </div>

                <div className="col-md-2 d-flex align-items-end">
                  <button
                    className="btn btn-primary w-100"
                    type="submit"
                    disabled={routeLoading}
                  >
                    {routeLoading ? "Searching..." : "Plan Route"}
                  </button>
                </div>
              </div>
            </form>

            {routeInfo && (
              <div className="alert alert-light border mt-3 mb-0">
                <strong>Route estimate</strong>
                <p className="mb-1 mt-2">
                  Distance: {routeInfo.distanceKm} km
                </p>
                <p className="mb-1">
                  Estimated driving time: {routeInfo.durationMin} minutes
                </p>
                <small className="text-muted">
                  Estimates may differ from actual travel conditions. This
                  route has not been assessed for safety.
                </small>
              </div>
            )}
          </div>
        </section>

        <section className="card shadow-sm border-0 mb-4">
          <div className="card-body p-3 p-md-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div>
                <h2 className="h4 mb-1">🗺️ Interactive Safety Map</h2>
                <p className="text-muted mb-0">
                  OpenStreetMap map with your requested route and current
                  location marker when available.
                </p>
              </div>
              <span className="badge bg-secondary">
                Map data may be incomplete
              </span>
            </div>

            <div
              style={{
                height: "420px",
                width: "100%",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={11}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater center={mapCenter} route={route} />

                {currentLocation && (
                  <Marker position={currentLocation}>
                    <Popup>Your current location</Popup>
                  </Marker>
                )}

                {routeInfo && (
                  <>
                    <Marker
                      position={routeInfo.start.coordinates}
                      icon={startPointIcon}
                    >
                      <Popup>
                        <strong>🟢 Starting Point</strong>
                        <br />
                        {routeInfo.start.label}
                      </Popup>
                    </Marker>

                    <Marker
                      position={routeInfo.destination.coordinates}
                      icon={destinationPointIcon}
                    >
                      <Popup>
                        <strong>🔴 Destination</strong>
                        <br />
                        {routeInfo.destination.label}
                      </Popup>
                    </Marker>
                  </>
                )}

                {route.length > 0 && (
                  <Polyline
                    positions={route}
                    pathOptions={{ color: "#2457d6", weight: 5 }}
                  />
                )}
              </MapContainer>
            </div>

            <div className="d-flex flex-wrap gap-3 mt-3">
              <span className="small">
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#16a34a",
                    marginRight: "6px",
                  }}
                />
                Starting point
              </span>

              <span className="small">
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#dc2626",
                    marginRight: "6px",
                  }}
                />
                Destination
              </span>

              <span className="small">
                <span
                  style={{
                    display: "inline-block",
                    width: "20px",
                    height: "4px",
                    background: "#2457d6",
                    marginRight: "6px",
                    verticalAlign: "middle",
                  }}
                />
                Driving route
              </span>
            </div>

            <p className="text-muted small mt-3 mb-0">
              Report locations are currently stored as text in the database.
              They are not placed on the map automatically, and no safety rating
              is inferred from missing reports.
            </p>
          </div>
        </section>

        <section className="card shadow-sm border-0 mb-4" id="add-report">
          <div className="card-body p-4">
            <h2 className="h4">📝 Submit a Safety Report</h2>
            <p className="text-muted">
              Reports are saved in the backend database and remain pending
              verification.
            </p>

            <form onSubmit={addReport}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label" htmlFor="type">
                    Report category
                  </label>
                  <select
                    id="type"
                    className="form-select"
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                  >
                    <option>Lighting</option>
                    <option>Help Point</option>
                    <option>Accessibility</option>
                    <option>Road Obstacle</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="col-md-8">
                  <label className="form-label" htmlFor="place">
                    Location
                  </label>
                  <input
                    id="place"
                    className="form-control"
                    value={place}
                    onChange={(event) => setPlace(event.target.value)}
                    placeholder="Enter a public location"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="details">
                    Report details
                  </label>
                  <textarea
                    id="details"
                    className="form-control"
                    rows="3"
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    placeholder="Describe the observed condition"
                    required
                  />
                </div>

                <div className="col-12">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Submit Report"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="card shadow-sm border-0 mb-4" id="reports">
          <div className="card-body p-4">
            <h2 className="h4">📋 Safety Reports & Help Points</h2>
            <p className="text-muted">
              Reports retrieved from the backend database. Entries are
              observations, not verified safety recommendations.
            </p>

            {loading ? (
              <p>Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="text-muted">
                No saved reports yet. Submit a report to get started.
              </p>
            ) : (
              <div className="row g-3">
                {reports.map((report) => (
                  <div className="col-md-6" key={report.id}>
                    <div className="border rounded-3 p-3 h-100">
                      <div className="d-flex justify-content-between gap-2 mb-2">
                        <strong>{report.type}</strong>
                        <span className="badge bg-warning text-dark">
                          {report.status === "VERIFIED"
                            ? "Verified"
                            : report.status === "REJECTED"
                              ? "Rejected"
                              : "Unverified"}
                        </span>
                      </div>

                      <h3 className="h6">{report.place}</h3>
                      <p className="mb-2">{report.details}</p>
                      <small className="text-muted">
                        {report.time} • {report.status}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="card shadow-sm border-0 mb-4" id="emergency">
          <div className="card-body p-4">
            <h2 className="h4">🆘 Emergency Contact & Journey Sharing</h2>
            <p className="text-muted">
              Save a trusted contact in this browser. Journey sharing requires
              your consent and is manual; this demo does not provide continuous
              live tracking or automatically send emergency alerts.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                saveTrustedContact();
              }}
            >
              <label className="form-label" htmlFor="contact">
                Trusted contact number
              </label>
              <input
                id="contact"
                type="tel"
                className="form-control mb-3"
                value={contact}
                onChange={(event) => {
                  setContact(event.target.value);
                  setContactSaved(false);
                }}
                placeholder="Enter a trusted contact number"
                autoComplete="tel"
                required
              />

              <div className="d-flex flex-wrap gap-2 mb-3">
                <button className="btn btn-primary" type="submit">
                  💾 Save Contact
                </button>

                <a
                  className={`btn btn-outline-success ${
                    contact.trim() ? "" : "disabled"
                  }`}
                  href={
                    contact.trim()
                      ? `tel:${contact.trim().replace(/[^\d+]/g, "")}`
                      : undefined
                  }
                  aria-disabled={!contact.trim()}
                  onClick={(event) => {
                    if (!contact.trim()) {
                      event.preventDefault();
                      setMessage("Please enter a contact number first.");
                    }
                  }}
                >
                  📞 Call Contact
                </a>
              </div>
            </form>

            {contactSaved && (
              <div className="alert alert-success">
                Contact saved in this browser. It is not saved to MySQL or
                synced to other devices.
              </div>
            )}

            <hr />

            <h3 className="h5">Journey Sharing</h3>
            <div className="form-check mb-3">
              <input
                id="journey"
                className="form-check-input"
                type="checkbox"
                checked={journey}
                onChange={(event) => setJourney(event.target.checked)}
              />
              <label className="form-check-label" htmlFor="journey">
                I consent to manually sharing my journey update.
              </label>
            </div>

            <button
              className="btn btn-outline-primary"
              type="button"
              onClick={shareJourney}
              disabled={!journey}
            >
              📩 Share Journey Update
            </button>
          </div>
        </section>
      </main>

      <footer className="text-center text-muted py-4">
        SafeSignal • Student project demonstration
      </footer>
    </div>
  );
}

export default Safety;
