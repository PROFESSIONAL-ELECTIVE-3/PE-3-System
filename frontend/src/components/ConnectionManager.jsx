import { useEffect, useState } from "react";
import { Check, Clock3, Link2, Search, Trash2, UserPlus, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const statusLabel = {
  pending: "Awaiting response",
  accepted: "Connected",
  declined: "Not accepted",
};

export default function ConnectionManager() {
  const { user, apiFetch } = useAuth();
  const [connections, setConnections] = useState([]);
  const [query, setQuery] = useState("");
  const [professors, setProfessors] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isStudent = user.role === "student";

  const loadConnections = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiFetch("/api/connections");
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not load connections.");
      setConnections(data.connections || []);
    } catch (requestError) {
      setError(requestError.message || "Could not load connections.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, [apiFetch]);

  useEffect(() => {
    if (!isStudent || query.trim().length < 2) {
      setProfessors([]);
      return undefined;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await apiFetch(`/api/connections/professors?query=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Could not search professors.");
        setProfessors(data.professors || []);
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message || "Could not search professors.");
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [apiFetch, isStudent, query]);

  const sendRequest = async (professorId) => {
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await apiFetch("/api/connections/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professorId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not send the request.");
      setConnections((current) => [data.connection, ...current.filter((item) => item.id !== data.connection.id)]);
      setMessage("Your connection request has been sent.");
    } catch (requestError) {
      setError(requestError.message || "Could not send the request.");
    } finally {
      setIsSaving(false);
    }
  };

  const respond = async (id, action) => {
    setIsSaving(true);
    setError("");
    try {
      const response = await apiFetch(`/api/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not update the request.");
      setConnections((current) => current.map((item) => item.id === id ? data.connection : item));
      setMessage(action === "accept" ? "Student connection approved." : "Request declined.");
    } catch (requestError) {
      setError(requestError.message || "Could not update the request.");
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (id) => {
    setIsSaving(true);
    setError("");
    try {
      const response = await apiFetch(`/api/connections/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not remove the connection.");
      setConnections((current) => current.filter((item) => item.id !== id));
      setMessage("Connection removed.");
    } catch (requestError) {
      setError(requestError.message || "Could not remove the connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const pendingCount = connections.filter((connection) => connection.status === "pending").length;

  return (
    <section className="connection-manager" aria-labelledby="connection-title">
      <div className="connection-manager__heading">
        <div className="connection-manager__icon" aria-hidden="true"><Link2 size={19} /></div>
        <div>
          <p className="dashboard-eyebrow">Professor connection</p>
          <h3 id="connection-title">{isStudent ? "Connect with your professor" : "Student connection requests"}</h3>
        </div>
        {!isStudent && pendingCount > 0 && <span className="connection-count">{pendingCount} pending</span>}
      </div>
      <p className="connection-manager__description">
        {isStudent
          ? "Search the in-app directory for a professor at your institution. They must approve your request before the connection is active."
          : "Review requests from students at your institution. Accept only students you recognize and support."}
      </p>

      {isStudent && (
        <div className="connection-directory">
          <label htmlFor="professor-search">Find a professor at {user.institution}</label>
          <div>
            <Search size={16} aria-hidden="true" />
            <input id="professor-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by professor name" />
          </div>
          {query.trim().length > 0 && query.trim().length < 2 && <p className="connection-search-note">Enter at least two characters to search.</p>}
          {isSearching && <p className="connection-search-note">Searching professors…</p>}
          {query.trim().length >= 2 && !isSearching && professors.length === 0 && <p className="connection-search-note">No professors found with that name.</p>}
          {professors.length > 0 && <ul className="professor-search-results">{professors.map((professor) => <li key={professor.id}><span className="connection-avatar" aria-hidden="true">{professor.fullName.split(" ").map((name) => name[0]).slice(0, 2).join("")}</span><div><strong>{professor.fullName}</strong><small>{professor.institution}</small></div><button type="button" className="connection-button connection-button--accept" onClick={() => sendRequest(professor.id)} disabled={isSaving}><UserPlus size={15} />Connect</button></li>)}</ul>}
        </div>
      )}

      {error && <p className="connection-message connection-message--error" role="alert">{error}</p>}
      {message && <p className="connection-message connection-message--success" role="status">{message}</p>}

      {isLoading ? <p className="connection-empty">Loading connections…</p> : connections.length === 0 ? (
        <p className="connection-empty">{isStudent ? "No professor connections yet." : "No student requests yet."}</p>
      ) : (
        <ul className="connection-list">
          {connections.map((connection) => {
            const person = isStudent ? connection.professor : connection.student;
            return <li key={connection.id}>
              <span className="connection-avatar" aria-hidden="true">{person.fullName.split(" ").map((name) => name[0]).slice(0, 2).join("")}</span>
              <div className="connection-person"><strong>{person.fullName}</strong><small>{person.email}</small></div>
              <span className={`connection-status connection-status--${connection.status}`}><Clock3 size={13} />{statusLabel[connection.status]}</span>
              <div className="connection-actions">
                {!isStudent && connection.status === "pending" && <><button type="button" className="connection-button connection-button--accept" onClick={() => respond(connection.id, "accept")} disabled={isSaving}><Check size={15} />Accept</button><button type="button" className="connection-button connection-button--decline" onClick={() => respond(connection.id, "decline")} disabled={isSaving}><X size={15} />Decline</button></>}
                {(isStudent || connection.status === "accepted") && <button type="button" className="connection-remove" onClick={() => remove(connection.id)} disabled={isSaving} aria-label={`Remove connection with ${person.fullName}`}><Trash2 size={16} /></button>}
              </div>
            </li>;
          })}
        </ul>
      )}
    </section>
  );
}
