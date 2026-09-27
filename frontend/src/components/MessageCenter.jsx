import { useEffect, useState } from "react";
import { Ellipsis, MessageCircle, Reply, Send, Trash2, UserRoundPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const time = (value) => new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
const riskTier = (forecast) => {
  const tier = String(forecast?.riskLevel || "").toLowerCase();
  return ["low", "medium", "high"].includes(tier) ? tier : null;
};

export default function MessageCenter({ initialSelectedUser }) {
  const { apiFetch, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(initialSelectedUser || null);

  const load = async (background = false) => {
    if (!background) setLoading(true);
    if (!background) setError("");
    try {
      const jobs = [apiFetch("/api/messages")];
      jobs.push(apiFetch(user.role === "professor" ? "/api/professor/students" : "/api/connections"));
      const responses = await Promise.all(jobs);
      const inbox = await responses[0].json().catch(() => ({}));
      if (!responses[0].ok) throw new Error(inbox.message || "Could not load messages.");
      setConversations(inbox.conversations || []);
      if (responses[1]?.ok) {
        const data = await responses[1].json();
        setStudents(user.role === "professor" ? (data.students || []) : (data.connections || []).filter((connection) => connection.status === "accepted").map((connection) => ({ student: connection.professor, forecast: null })));
      }
    } catch (err) { setError(err.message || "Could not load messages."); }
    finally { if (!background) setLoading(false); }
  };

  useEffect(() => {
    load();
    const refresh = window.setInterval(() => load(true), 8000);
    return () => window.clearInterval(refresh);
  }, []);

  const open = async (conversation) => {
    setError(""); setSelected(conversation); setMessages([]);
    try {
      const response = await apiFetch(`/api/messages/${conversation.id}/messages`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not open this conversation.");
      setSelected(data.conversation); setMessages(data.messages || []);
      setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, unreadCount: 0 } : item));
    } catch (err) { setError(err.message || "Could not open this conversation."); }
  };

  useEffect(() => {
  if (initialSelectedUser) {
    setSelectedUser(initialSelectedUser);
  }
  }, [initialSelectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const targetId = String(selectedUser.id || selectedUser._id || selectedUser.student?.id);

    // 1. Try to find an existing active conversation thread with this user
    const existingConv = conversations.find(
      (conv) => String(conv.peer?.id || conv.peer?._id) === targetId
    );

    if (existingConv) {
      open(existingConv);
    } else if (students.length > 0) {
      // 2. If no conversation exists yet, automatically create/open one using begin()
      const matchingStudent = students.find(
        (item) => String(item.student?.id || item.student?._id) === targetId
      );
      if (matchingStudent) {
        begin(matchingStudent.student.id);
      }
    }
  }, [selectedUser, conversations, students]);

  useEffect(() => {
    if (!selected?.id) return undefined;
    const refreshThread = async () => {
      try {
        const response = await apiFetch(`/api/messages/${selected.id}/messages`);
        const data = await response.json().catch(() => ({}));
        if (response.ok) setMessages(data.messages || []);
      } catch {
        // A temporary network issue should not interrupt the conversation UI.
      }
    };
    const refresh = window.setInterval(refreshThread, 8000);
    return () => window.clearInterval(refresh);
  }, [apiFetch, selected?.id]);

  const begin = async (studentId) => {
    setError("");
    try {
      const response = await apiFetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: studentId }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not start the conversation.");
      setConversations((current) => [data.conversation, ...current.filter((item) => item.id !== data.conversation.id)]);
      open(data.conversation);
    } catch (err) { setError(err.message || "Could not start the conversation."); }
  };

  const send = async (event) => {
    event.preventDefault(); if (!selected || !draft.trim()) return;
    setSending(true); setError("");
    try {
      const response = await apiFetch(`/api/messages/${selected.id}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: draft, replyToId: replyTo?.id }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not send the message.");
      setMessages((current) => [...current, { ...data.message, replyTo: replyTo ? { id: replyTo.id, body: replyTo.body, senderName: replyTo.sender.fullName } : null }]); setDraft(""); setReplyTo(null);
      setConversations((current) => current.map((item) => item.id === selected.id ? { ...item, lastMessageAt: data.message.createdAt } : item));
    } catch (err) { setError(err.message || "Could not send the message."); }
    finally { setSending(false); }
  };

  const sendOnEnter = (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (!sending && draft.trim()) event.currentTarget.form?.requestSubmit();
  };

  const deleteMessage = async (messageId) => {
    if (!selected || !window.confirm("Delete this message?")) return;
    setError("");
    try {
      const response = await apiFetch(`/api/messages/${selected.id}/messages/${messageId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not delete this message.");
      setMessages((current) => current.filter((message) => message.id !== messageId)); setOpenMenu(null);
    } catch (err) { setError(err.message || "Could not delete this message."); }
  };

  const useCheckInTemplate = () => {
    const name = selected?.peer?.fullName?.split(" ")[0] || "there";
    setDraft(`Hi ${name}, I’d like to check in and see how this term is going. If coursework, attendance, timing, or something else is making study harder, we can look at practical support options together. Would you like to reply here or choose a time to meet? There is no penalty for declining or letting me know you do not need support right now.`);
  };

  const studentById = new Map(students.map((item) => [String(item.student.id), item]));
  const availableStudents = students.filter(({ student }) => !conversations.some((conversation) => String(conversation.peer.id) === String(student.id)));
  const riskBadge = (studentId) => {
    const tier = riskTier(studentById.get(String(studentId))?.forecast);
    return tier ? <span className={`message-risk message-risk--${tier}`}>{tier} risk</span> : <span className="message-risk message-risk--pending">No forecast</span>;
  };
  const peerRole = user.role === "professor" ? "Student" : "Professor";
  return <section className="message-center" aria-labelledby="messages-title">
    <header><div><p className="dashboard-eyebrow">Academic support</p><h2 id="messages-title">Support messages</h2><p>Private conversations are available only while the student–professor connection is active.</p>{user.role === "professor" && <small className="message-risk-note"></small>}</div></header>
    {error && <p className="connection-message connection-message--error" role="alert">{error}</p>}
    <div className="message-center__layout">
      <aside aria-label="Conversations">
        {availableStudents.length > 0 && <div className="message-center__start"><strong>{user.role === "professor" ? "Start supportive outreach" : "Start a conversation"}</strong>{availableStudents.map(({ student }) => <button type="button" onClick={() => begin(student.id)} key={student.id}><UserRoundPlus size={15} /><span>{student.fullName}{user.role === "professor" && riskBadge(student.id)}</span></button>)}</div>}
        {loading ? <p>Loading conversations…</p> : conversations.length ? conversations.map((conversation) => <button className={selected?.id === conversation.id ? "is-selected" : ""} type="button" onClick={() => open(conversation)} key={conversation.id}><span className="connection-avatar">{conversation.peer.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span><strong>{conversation.peer.fullName}</strong><small><span className="chat-role">{peerRole}</span> {time(conversation.lastMessageAt)}</small>{user.role === "professor" && riskBadge(conversation.peer.id)}</span>{conversation.unreadCount > 0 && <i className="message-unread-count" aria-label={`${conversation.unreadCount} new messages`}>{conversation.unreadCount} new</i>}</button>) : <p className="message-center__empty">No messages yet.{user.role === "professor" ? " Start a supportive outreach with a connected student." : " Your professors can invite you to a support conversation."}</p>}
      </aside>
      <div className="message-center__thread">{selected ? <><div className="message-center__thread-header"><MessageCircle size={18} /><div><strong>{selected.peer.fullName} <span className="chat-role">{peerRole}</span></strong><small>Connected academic support conversation</small>{user.role === "professor" && riskBadge(selected.peer.id)}</div></div><div className="message-list" aria-live="polite">{messages.length ? messages.map((message) => { const isMine = String(message.sender.id) === String(user._id || user.id); return <article className={isMine ? "mine" : "theirs"} key={message.id}>{message.replyTo && <div className="message-reply-preview"><strong>{message.replyTo.senderName}</strong><span>{message.replyTo.body}</span></div>}<p>{message.body}</p><small>{time(message.createdAt)}{isMine && <span className={`message-read-state ${message.readAt ? "is-read" : ""}`}>{message.readAt ? "Read" : "Sent"}</span>}</small><button type="button" className="message-menu-toggle" onClick={() => setOpenMenu(openMenu === message.id ? null : message.id)} aria-label="Message actions"><Ellipsis size={16} /></button>{openMenu === message.id && <div className="message-menu"><button type="button" onClick={() => { setReplyTo(message); setOpenMenu(null); }}><Reply size={13} /> Reply</button>{isMine && <button type="button" className="message-menu__delete" onClick={() => deleteMessage(message.id)}><Trash2 size={13} /> Delete</button>}</div>}</article>; }) : <p className="message-center__empty">Start with a supportive, practical invitation to talk.</p>}</div><form onSubmit={send}>{replyTo && <div className="replying-to"><span>Replying to: {replyTo.body}</span><button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply">×</button></div>}{user.role === "professor" && <button className="message-template" type="button" onClick={useCheckInTemplate}>Use supportive check-in template</button>}<label className="sr-only" htmlFor="message-body">Message</label><textarea id="message-body" maxLength="2000" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={sendOnEnter} placeholder="Write a supportive message…" /><div><small>Enter to send · Shift+Enter for a new line · {draft.length}/2000</small><button className="dashboard-action" disabled={sending || !draft.trim()}><Send size={16} /> {sending ? "Sending…" : "Send message"}</button></div></form></> : <div className="message-center__placeholder"><MessageCircle size={30} /><h3>Select a conversation</h3><p>Messages are human-led and meant to offer practical academic support.</p></div>}</div>
    </div>
  </section>;
}
