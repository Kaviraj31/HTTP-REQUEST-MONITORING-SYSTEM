
import { useState, useEffect } from "react";
import { getRequests, addRequest as saveRequest } from "./api";

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation
} from "react-router-dom";

import {
  ShieldCheck,
  LayoutDashboard,
  Send,
  History,
  AlertTriangle,
  Workflow,
  Bell,
  Activity,
  CheckCircle2,
  XCircle,
  Server,
  Menu,
  Radio,
  Search,
  Download,
  FileText
} from "lucide-react";

import "./App.css";

// Convert backend request data into frontend format
function mapRequest(item) {
  return {
    id: item._id,
    method: item.method,
    endpoint: item.endpoint,
    code: item.responseCode,
    status: item.status,
    session: item.sessionId,
    anomalyReason: item.anomalyReason || "",
    timestamp: item.timestamp || item.createdAt || null
  };
}

// Sidebar
function Sidebar({ open, setOpen }) {
  const links = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/simulator", label: "Request Simulator", icon: Send },
    { path: "/live", label: "Live Monitoring", icon: Radio },
    { path: "/history", label: "Request History", icon: History },
    { path: "/anomalies", label: "Anomalies", icon: AlertTriangle },
    { path: "/dfa", label: "DFA Visualizer", icon: Workflow }
  ];

  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="brand-icon">
          <ShieldCheck size={25} />
        </div>

        <div>
          <h2>HTTP Guard</h2>
          <span>Sequence Monitor</span>
        </div>
      </div>

      <p className="nav-heading">MAIN MENU</p>

      <nav>
        {links.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            onClick={() => setOpen(false)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="server-status">
          <span className="online-dot"></span>

          <div>
            <strong>Monitoring Active</strong>
            <small>System is running</small>
          </div>
        </div>

        <p>HTTP Guard v1.0</p>
      </div>
    </aside>
  );
}

// Header
function Header({ title, setOpen }) {
  return (
    <header className="topbar">
      <button
        className="menu-button"
        onClick={() => setOpen(true)}
      >
        <Menu size={22} />
      </button>

      <div>
        <h2>{title}</h2>
        <p>Monitor and analyze HTTP request sequences</p>
      </div>

      <div className="header-right">
        <span className="live-badge">
          <span className="online-dot"></span>
          Live Monitoring
        </span>

        <button className="icon-button" title="Notifications">
          <Bell size={19} />
        </button>
      </div>
    </header>
  );
}

// Dashboard
function Dashboard({ requests }) {
  const valid = requests.filter(
    r => r.status === "Valid"
  ).length;

  const invalid = requests.filter(
    r => r.status === "Invalid"
  ).length;

  const stats = [
    {
      title: "Total Requests",
      value: requests.length,
      icon: Activity,
      color: "blue"
    },
    {
      title: "Valid Requests",
      value: valid,
      icon: CheckCircle2,
      color: "green"
    },
    {
      title: "Invalid Requests",
      value: invalid,
      icon: XCircle,
      color: "red"
    },
    {
      title: "Anomalies",
      value: invalid,
      icon: AlertTriangle,
      color: "orange"
    }
  ];

  return (
    <>
      <div className="welcome">
        <div>
          <h1>Monitoring Dashboard</h1>
          <p>Welcome! Here is your HTTP traffic overview.</p>
        </div>

        <span className="date-label">System Overview</span>
      </div>

      <div className="stats-grid">
        {stats.map(item => {
          const Icon = item.icon;

          return (
            <div className="stat-card" key={item.title}>
              <div className={`stat-icon ${item.color}`}>
                <Icon size={23} />
              </div>

              <p>{item.title}</p>
              <h2>{item.value}</h2>
              <small>Recorded requests</small>
            </div>
          );
        })}
      </div>

      <div className="content-grid">
        <section className="panel request-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent HTTP Requests</h3>
              <p>Latest monitored network activity</p>
            </div>

            <span className="small-tag">Recent</span>
          </div>

          <RequestTable
            requests={[...requests].slice(-5).reverse()}
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>System Status</h3>
              <p>Monitoring components</p>
            </div>
          </div>

          <div className="system-item">
            <Server size={20} />

            <div>
              <strong>API Server</strong>
              <small>Connected when API responds</small>
            </div>

            <span className="status-wait">API</span>
          </div>

          <div className="system-item">
            <Activity size={20} />

            <div>
              <strong>Sequence Analyzer</strong>
              <small>HTTP sequence validation</small>
            </div>

            <span className="status-wait">DFA</span>
          </div>

          <div className="system-item">
            <ShieldCheck size={20} />

            <div>
              <strong>Database</strong>
              <small>Request records from backend</small>
            </div>

            <span className="status-wait">DB</span>
          </div>
        </section>
      </div>
    </>
  );
}

// Reusable request table
function RequestTable({ requests }) {
  if (!requests.length) {
    return (
      <p className="empty-state">
        No requests recorded yet.
      </p>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>METHOD</th>
            <th>ENDPOINT</th>
            <th>SESSION</th>
            <th>RESPONSE</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td>
                <span className={`method ${r.method}`}>
                  {r.method}
                </span>
              </td>

              <td>{r.endpoint}</td>
              <td>{r.session}</td>
              <td>{r.code}</td>

              <td>
                <span
                  className={`result ${
                    (r.status || "Invalid").toLowerCase()
                  }`}
                >
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Request Simulator
function RequestSimulator({ addRequest }) {
  const [method, setMethod] = useState("GET");
  const [endpoint, setEndpoint] = useState("/login");
  const [session, setSession] = useState("S102");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const normalized = endpoint.trim();

    if (!normalized.startsWith("/")) {
      setMessage("Endpoint must start with /");
      return;
    }

    try {
      const result = await addRequest({
        method,
        endpoint: normalized,
        session: session.trim() || "S102"
      });

      setMessage(
        result.message || "Request saved successfully!"
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to connect to backend. Check server."
      );
    }
  }

  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <div>
          <h3>HTTP Request Simulator</h3>
          <p>Generate sample HTTP requests for monitoring</p>
        </div>

        <Send size={22} />
      </div>

      <form onSubmit={handleSubmit} className="request-form">
        <label>HTTP Method</label>

        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>

        <label>Endpoint</label>

        <input
          value={endpoint}
          onChange={e => setEndpoint(e.target.value)}
          placeholder="/login"
          required
        />

        <label>Session ID</label>

        <input
          value={session}
          onChange={e => setSession(e.target.value)}
          placeholder="S102"
          required
        />

        <button className="primary-button" type="submit">
          <Send size={17} />
          Simulate Request
        </button>

        {message && (
          <p className="form-message">{message}</p>
        )}
      </form>
    </section>
  );
}

// Feature 1: Live Monitoring
function LiveMonitoringPage({ requests }) {
  const valid = requests.filter(
    r => r.status === "Valid"
  ).length;

  const invalid = requests.filter(
    r => r.status === "Invalid"
  ).length;

  const latest = [...requests].reverse().slice(0, 20);

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Live HTTP Monitoring</h3>
            <p>
              Automatically refreshed request records
            </p>
          </div>

          <Radio size={24} />
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Activity size={23} />
            </div>
            <p>Total Requests</p>
            <h2>{requests.length}</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircle2 size={23} />
            </div>
            <p>Valid Requests</p>
            <h2>{valid}</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <XCircle size={23} />
            </div>
            <p>Invalid Requests</p>
            <h2>{invalid}</h2>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Live Request Feed</h3>
            <p>Latest 20 stored requests</p>
          </div>

          <span className="live-badge">
            <span className="online-dot"></span>
            Auto Refresh
          </span>
        </div>

        <RequestTable requests={latest} />
      </section>
    </div>
  );
}

// Feature 4: Request History Search & Filter
// Feature 5: CSV and printable PDF report generation
function HistoryPage({ requests }) {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredRequests = [...requests].reverse().filter(request => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      (request.endpoint || "").toLowerCase().includes(searchText) ||
      (request.session || "").toLowerCase().includes(searchText);

    const matchesMethod =
      methodFilter === "ALL" || request.method === methodFilter;

    const matchesStatus =
      statusFilter === "ALL" || request.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  function downloadCSV() {
    if (filteredRequests.length === 0) {
      window.alert("No requests available to export.");
      return;
    }

    const columns = [
      "Method",
      "Endpoint",
      "Session ID",
      "Response Code",
      "Status",
      "Anomaly Reason",
      "Timestamp"
    ];

    const escapeCSV = value =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredRequests.map(request => [
      request.method,
      request.endpoint,
      request.session,
      request.code,
      request.status,
      request.anomalyReason,
      request.timestamp
        ? new Date(request.timestamp).toLocaleString()
        : ""
    ]);

    const csvContent = [columns, ...rows]
      .map(row => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "http-guard-request-report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function downloadPDF() {
    if (filteredRequests.length === 0) {
      window.alert("No requests available to export.");
      return;
    }

    const printableRows = filteredRequests.map(request => `
      <tr>
        <td>${escapeHTML(request.method)}</td>
        <td>${escapeHTML(request.endpoint)}</td>
        <td>${escapeHTML(request.session)}</td>
        <td>${escapeHTML(request.code)}</td>
        <td>${escapeHTML(request.status)}</td>
        <td>${escapeHTML(request.anomalyReason || "-")}</td>
        <td>${escapeHTML(
          request.timestamp
            ? new Date(request.timestamp).toLocaleString()
            : "-"
        )}</td>
      </tr>
    `).join("");

    const printWindow = window.open("", "_blank", "width=1100,height=750");

    if (!printWindow) {
      window.alert("Please allow pop-ups to generate the PDF report.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HTTP Guard Request Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin-bottom: 6px; }
            p { color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 11px; overflow-wrap: anywhere; }
            th { background: #f3f4f6; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>HTTP Guard - Request Report</h1>
          <p>Generated: ${escapeHTML(new Date().toLocaleString())}</p>
          <p>Total records: ${filteredRequests.length} | Valid: ${
            filteredRequests.filter(item => item.status === "Valid").length
          } | Invalid: ${
            filteredRequests.filter(item => item.status === "Invalid").length
          }</p>
          <table>
            <thead>
              <tr>
                <th>Method</th><th>Endpoint</th><th>Session</th>
                <th>Response</th><th>Status</th><th>Anomaly Reason</th><th>Timestamp</th>
              </tr>
            </thead>
            <tbody>${printableRows}</tbody>
          </table>
          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Request History</h3>
            <p>Search, filter and export monitored HTTP requests</p>
          </div>
          <History size={22} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            margin: "20px 0"
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b"
              }}
            />
            <input
              type="text"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search endpoint or session..."
              aria-label="Search endpoint or session"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 12px 12px 38px",
                border: "1px solid #d1d5db",
                borderRadius: "8px"
              }}
            />
          </div>

          <select
            value={methodFilter}
            onChange={event => setMethodFilter(event.target.value)}
            aria-label="Filter by HTTP method"
            style={{
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px"
            }}
          >
            <option value="ALL">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
            aria-label="Filter by request status"
            style={{
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px"
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Valid">Valid</option>
            <option value="Invalid">Invalid</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "16px"
          }}
        >
          <p style={{ margin: 0 }}>
            Showing <strong>{filteredRequests.length}</strong> of{" "}
            <strong>{requests.length}</strong> requests
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button
              type="button"
              onClick={downloadCSV}
              className="primary-button"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <Download size={17} />
              Export CSV
            </button>
            <button
              type="button"
              onClick={downloadPDF}
              className="primary-button"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <FileText size={17} />
              Export PDF
            </button>
          </div>
        </div>

        {filteredRequests.length > 0 ? (
          <RequestTable requests={filteredRequests} />
        ) : (
          <p className="empty-state">
            No matching requests found. Try changing the search or filters.
          </p>
        )}
      </section>
    </div>
  );
}

// Anomalies
function AnomaliesPage({ requests }) {
  const anomalies = requests.filter(
    r => r.status === "Invalid"
  );

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h3>Anomaly Detection</h3>
          <p>Invalid requests and suspicious activity</p>
        </div>

        <AlertTriangle color="#f59e0b" size={23} />
      </div>

      {anomalies.length === 0 ? (
        <p className="empty-state">
          No anomalies detected in the current data.
        </p>
      ) : (
        anomalies.map(r => (
          <div className="alert-item" key={r.id}>
            <AlertTriangle color="#ef4444" />

            <div>
              <strong>
                Invalid request: {r.endpoint}
              </strong>

              <p>
                Session {r.session} – HTTP {r.code}
              </p>

              {r.anomalyReason && (
                <p>{r.anomalyReason}</p>
              )}
            </div>

            <span className="result invalid">
              Detected
            </span>
          </div>
        ))
      )}
    </section>
  );
}

// Feature 2: Advanced DFA Visualizer
function DFAVisualizer() {
  const [method, setMethod] = useState("GET");
  const [endpoint, setEndpoint] = useState("/login");
  const [currentState, setCurrentState] = useState("START");
  const [history, setHistory] = useState([]);

  const states = [
    "START",
    "LOGGED_IN",
    "DASHBOARD",
    "PROFILE",
    "LOGGED_OUT",
    "INVALID"
  ];

  function runRequest(e) {
    e.preventDefault();

    const normalizedEndpoint = endpoint.trim();

    if (!normalizedEndpoint.startsWith("/")) {
      alert("Endpoint must start with /");
      return;
    }

    const duplicate = history.some(
      item =>
        item.method === method &&
        item.endpoint === normalizedEndpoint
    );

    let nextState = "INVALID";
    let accepted = false;
    let reason = "Invalid DFA transition";

    if (
      currentState === "INVALID" ||
      currentState === "LOGGED_OUT"
    ) {
      reason = "Session has already ended or failed";
    } else if (duplicate) {
      reason = "Repeated identical request detected";
    } else {
      if (
        currentState === "START" &&
        method === "GET" &&
        normalizedEndpoint === "/login"
      ) {
        nextState = "LOGGED_IN";
        accepted = true;
      } else if (
        currentState === "LOGGED_IN" &&
        method === "GET" &&
        normalizedEndpoint === "/dashboard"
      ) {
        nextState = "DASHBOARD";
        accepted = true;
      } else if (
        currentState === "DASHBOARD" &&
        method === "GET" &&
        normalizedEndpoint === "/profile"
      ) {
        nextState = "PROFILE";
        accepted = true;
      } else if (
        (
          currentState === "PROFILE" ||
          currentState === "DASHBOARD"
        ) &&
        method === "POST" &&
        normalizedEndpoint === "/logout"
      ) {
        nextState = "LOGGED_OUT";
        accepted = true;
      }

      reason = accepted
        ? "Valid state transition"
        : "Request is not allowed in the current state";
    }

    setHistory(prev => [
      ...prev,
      {
        method,
        endpoint: normalizedEndpoint,
        from: currentState,
        to: nextState,
        accepted,
        reason,
        time: new Date().toLocaleTimeString()
      }
    ]);

    setCurrentState(nextState);
  }

  function resetDFA() {
    setCurrentState("START");
    setHistory([]);
    setMethod("GET");
    setEndpoint("/login");
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Advanced DFA Visualizer</h3>
            <p>
              Interactive HTTP request sequence validation
            </p>
          </div>

          <Workflow size={24} />
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            margin: "20px 0"
          }}
        >
          {states.map(state => (
            <div
              key={state}
              style={{
                padding: "12px",
                minWidth: "105px",
                textAlign: "center",
                borderRadius: "10px",
                border:
                  currentState === state
                    ? "2px solid #2563eb"
                    : "1px solid #d1d5db",
                background:
                  currentState === state
                    ? "#dbeafe"
                    : state === "INVALID"
                      ? "#fee2e2"
                      : "#f8fafc"
              }}
            >
              <strong style={{ fontSize: "12px" }}>
                {state}
              </strong>

              {currentState === state && (
                <p style={{ margin: "5px 0 0", fontSize: "11px" }}>
                  Current State
                </p>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            padding: "14px",
            borderRadius: "8px",
            background:
              currentState === "INVALID"
                ? "#fee2e2"
                : "#dcfce7",
            marginBottom: "18px"
          }}
        >
          <strong>
            Current DFA State: {currentState}
          </strong>

          <p style={{ margin: "5px 0 0" }}>
            {currentState === "INVALID"
              ? "Request sequence rejected. Reset to start again."
              : currentState === "LOGGED_OUT"
                ? "Session completed successfully."
                : "DFA is ready to validate the next HTTP request."}
          </p>
        </div>

        <form
          onSubmit={runRequest}
          style={{
            display: "grid",
            gap: "12px",
            maxWidth: "500px"
          }}
        >
          <label>HTTP Method</label>

          <select
            value={method}
            onChange={e => setMethod(e.target.value)}
            style={{ padding: "11px", borderRadius: "6px" }}
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>

          <label>HTTP Endpoint</label>

          <input
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
            placeholder="/login"
            required
            style={{ padding: "11px", borderRadius: "6px" }}
          />

          <button
            type="submit"
            className="primary-button"
            disabled={
              currentState === "INVALID" ||
              currentState === "LOGGED_OUT"
            }
          >
            Run DFA Transition
          </button>

          <button
            type="button"
            onClick={resetDFA}
            style={{
              padding: "11px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer"
            }}
          >
            Reset DFA
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Transition History</h3>
            <p>Step-by-step DFA execution results</p>
          </div>

          <Activity size={22} />
        </div>

        {history.length === 0 ? (
          <p className="empty-state">
            No transitions yet. Submit an HTTP request to begin.
          </p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>REQUEST</th>
                  <th>FROM STATE</th>
                  <th>TO STATE</th>
                  <th>RESULT</th>
                  <th>REASON</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {item.method} {item.endpoint}
                    </td>

                    <td>{item.from}</td>
                    <td>{item.to}</td>

                    <td>
                      <span
                        className={`result ${
                          item.accepted ? "valid" : "invalid"
                        }`}
                      >
                        {item.accepted ? "Accepted" : "Rejected"}
                      </span>
                    </td>

                    <td>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>DFA Transition Rules</h3>
            <p>Rules used by this visualizer</p>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>CURRENT STATE</th>
                <th>HTTP REQUEST</th>
                <th>NEXT STATE</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>START</td>
                <td>GET /login</td>
                <td>LOGGED_IN</td>
              </tr>

              <tr>
                <td>LOGGED_IN</td>
                <td>GET /dashboard</td>
                <td>DASHBOARD</td>
              </tr>

              <tr>
                <td>DASHBOARD</td>
                <td>GET /profile</td>
                <td>PROFILE</td>
              </tr>

              <tr>
                <td>DASHBOARD / PROFILE</td>
                <td>POST /logout</td>
                <td>LOGGED_OUT</td>
              </tr>

              <tr>
                <td>Invalid transition / repeated request</td>
                <td>Invalid sequence</td>
                <td>INVALID</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// Main application layout
function AppLayout() {
  const [requests, setRequests] = useState([]);
  const [apiError, setApiError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  // Feature 1: Refresh request records every 3 seconds
  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      try {
        const data = await getRequests();

        const savedRequests = (data.requests || [])
          .map(mapRequest)
          .reverse();

        if (isMounted) {
          setRequests(savedRequests);
          setApiError("");
        }
      } catch (error) {
        console.error("API Error:", error);

        if (isMounted) {
          setApiError(
            error.response?.data?.message ||
            "Cannot connect to backend server"
          );
        }
      }
    }

    loadRequests();

    const interval = setInterval(loadRequests, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const titles = {
    "/": "Dashboard",
    "/simulator": "Request Simulator",
    "/live": "Live Monitoring",
    "/history": "Request History",
    "/anomalies": "Anomaly Detection",
    "/dfa": "DFA Visualizer"
  };

  async function addRequest(request) {
    const result = await saveRequest({
      sessionId: request.session,
      method: request.method,
      endpoint: request.endpoint
    });

    const savedRequest = mapRequest(result.request);

    setRequests(prev => {
      const alreadyExists = prev.some(
        item => item.id === savedRequest.id
      );

      if (alreadyExists) {
        return prev;
      }

      return [...prev, savedRequest];
    });

    return result;
  }

  return (
    <div className="app-layout">
      <Sidebar
        open={menuOpen}
        setOpen={setMenuOpen}
      />

      {menuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main-area">
        <Header
          title={titles[location.pathname] || "HTTP Guard"}
          setOpen={setMenuOpen}
        />

        <div className="page-content">
          {apiError && (
            <p className="form-message">
              Backend Error: {apiError}
            </p>
          )}

          <Routes>
            <Route
              path="/"
              element={<Dashboard requests={requests} />}
            />

            <Route
              path="/simulator"
              element={
                <RequestSimulator addRequest={addRequest} />
              }
            />

            <Route
              path="/live"
              element={
                <LiveMonitoringPage requests={requests} />
              }
            />

            <Route
              path="/history"
              element={<HistoryPage requests={requests} />}
            />

            <Route
              path="/anomalies"
              element={<AnomaliesPage requests={requests} />}
            />

            <Route
              path="/dfa"
              element={<DFAVisualizer />}
            />
          </Routes>
        </div>

        <footer>
          HTTP Guard © 2026 | HTTP Request Sequence Monitoring System
        </footer>
      </main>
    </div>
  );
}

// Root component
export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
