
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Moderator() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadReports() {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get("/api/reports");
      setReports(response.data);
    } catch (error) {
      setErrorMessage(
        error.response
          ? `Reports load nahi hui. HTTP ${error.response.status}`
          : `Backend connection error: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function updateReport(id, action) {
    const confirmed = window.confirm(
      `Kya aap report #${id} ko ${action} karna chahte hain?`
    );

    if (!confirmed) return;

    setUpdatingId(id);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await api.patch(
        `/api/reports/${id}/${action}`
      );

      setReports((previous) =>
        previous.map((report) =>
          report.id === id ? response.data : report
        )
      );

      setMessage(
        `Report #${id} ka status ${response.data.status} ho gaya.`
      );
    } catch (error) {
      setErrorMessage(
        error.response
          ? `Update failed. HTTP ${error.response.status}: ${
              error.response.data?.message || "Request failed"
            }`
          : `Backend connection error: ${error.message}`
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingReports = reports.filter(
    (report) =>
      report.status !== "VERIFIED" &&
      report.status !== "REJECTED"
  );

  const verifiedReports = reports.filter(
    (report) => report.status === "VERIFIED"
  );

  const rejectedReports = reports.filter(
    (report) => report.status === "REJECTED"
  );

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>SafeSignal Moderator</h1>
          <p>Safety Report Review Dashboard</p>
        </div>

        <Link to="/safety" style={linkStyle}>
          Safety Dashboard
        </Link>
      </header>

      <main style={mainStyle}>
        <div style={statsStyle}>
          <Stat title="Total Reports" value={reports.length} />
          <Stat title="Pending Review" value={pendingReports.length} />
          <Stat title="Verified" value={verifiedReports.length} />
          <Stat title="Rejected" value={rejectedReports.length} />
        </div>

        <div style={sectionHeaderStyle}>
          <h2>Pending / Unverified Reports</h2>

          <button
            onClick={loadReports}
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? "Loading..." : "Refresh Reports"}
          </button>
        </div>

        {message && (
          <p role="status" style={successStyle}>
            {message}
          </p>
        )}

        {errorMessage && (
          <p role="alert" style={errorStyle}>
            {errorMessage}
          </p>
        )}

        {loading ? (
          <p>Reports load ho rahi hain...</p>
        ) : pendingReports.length === 0 ? (
          <p>Koi pending report nahi hai.</p>
        ) : (
          <div style={listStyle}>
            {pendingReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                updatingId={updatingId}
                onUpdate={updateReport}
              />
            ))}
          </div>
        )}

        <section style={sectionStyle}>
          <h2>Verified Reports</h2>

          {loading ? (
            <p>Loading verified reports...</p>
          ) : verifiedReports.length === 0 ? (
            <p>Abhi koi verified report nahi hai.</p>
          ) : (
            <div style={listStyle}>
              {verifiedReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </section>

        <section style={sectionStyle}>
          <h2>Rejected Reports</h2>

          {loading ? (
            <p>Loading rejected reports...</p>
          ) : rejectedReports.length === 0 ? (
            <p>Abhi koi rejected report nahi hai.</p>
          ) : (
            <div style={listStyle}>
              {rejectedReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ReportCard({ report, updatingId, onUpdate }) {
  const statusColor =
    report.status === "VERIFIED"
      ? "#18794e"
      : report.status === "REJECTED"
        ? "#b42318"
        : "#9a6700";

  return (
    <article style={reportStyle}>
      <div style={sectionHeaderStyle}>
        <h3 style={{ margin: 0 }}>{report.category}</h3>
        <strong style={{ color: statusColor }}>
          {report.status || "PENDING_VERIFICATION"}
        </strong>
      </div>

      <p><strong>Report ID:</strong> {report.id}</p>
      <p><strong>Location:</strong> {report.location}</p>
      <p><strong>Details:</strong> {report.details}</p>

      {report.createdAt && (
        <p>
          <strong>Submitted:</strong>{" "}
          {new Date(report.createdAt).toLocaleString()}
        </p>
      )}

      {onUpdate &&
        report.status !== "VERIFIED" &&
        report.status !== "REJECTED" && (
          <div style={sectionHeaderStyle}>
            <button
              disabled={updatingId !== null}
              onClick={() => onUpdate(report.id, "verify")}
              style={{
                ...buttonStyle,
                background: "#18794e",
                color: "white",
              }}
            >
              {updatingId === report.id
                ? "Updating..."
                : "Verify Report"}
            </button>

            <button
              disabled={updatingId !== null}
              onClick={() => onUpdate(report.id, "reject")}
              style={{
                ...buttonStyle,
                background: "#b42318",
                color: "white",
              }}
            >
              {updatingId === report.id
                ? "Updating..."
                : "Reject Report"}
            </button>
          </div>
        )}
    </article>
  );
}

function Stat({ title, value }) {
  return (
    <div style={statStyle}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f7fb",
  color: "#172033",
  fontFamily: "Arial, sans-serif",
};

const headerStyle = {
  background: "#123c35",
  color: "white",
  padding: "20px 5%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const mainStyle = {
  maxWidth: 1100,
  margin: "auto",
  padding: 24,
};

const statsStyle = {
  display: "flex",
  gap: 16,
  flexWrap: "wrap",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const sectionStyle = {
  marginTop: 36,
};

const listStyle = {
  display: "grid",
  gap: 16,
};

const reportStyle = {
  background: "white",
  padding: 22,
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  overflowWrap: "anywhere",
};

const statStyle = {
  flex: "1 1 180px",
  background: "white",
  padding: 18,
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};

const buttonStyle = {
  padding: "11px 16px",
  border: "1px solid #ccd5df",
  borderRadius: 8,
  cursor: "pointer",
};

const linkStyle = {
  background: "white",
  color: "#123c35",
  padding: "10px 16px",
  borderRadius: 8,
  textDecoration: "none",
};

const successStyle = {
  background: "#d9f4e4",
  padding: 12,
  borderRadius: 8,
};

const errorStyle = {
  background: "#fde2e2",
  color: "#8a1717",
  padding: 12,
  borderRadius: 8,
};

export default Moderator;
