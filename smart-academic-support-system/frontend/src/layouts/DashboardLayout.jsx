import { BarChart3, Bell, BookMarked, BookOpen, Bot, ClipboardList, Home, LibraryBig, LogOut, Menu, Search, Sparkles, Target, Timer, UserRound, Users, X, Send, Share2 } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const studentNav = [
  ["/student", Home, "Dashboard"],
  ["/books", Search, "Search Books"],
  ["/issued", BookMarked, "My Books"],
  ["/my-reservations", Timer, "Reservations"],
  ["/recommendations", Sparkles, "Recommendations"],
  ["/roadmaps", Target, "Roadmaps"],
  ["/progress", ClipboardList, "Progress"],
  ["/p2p-study", Users, "P2P Study Hub"],
  ["/p2p-books", Share2, "Shadow Library"],
  ["/notifications", Bell, "Notifications"],
  ["/profile", UserRound, "Profile"]
];

const adminNav = [
  ["/admin", Home, "Dashboard"],
  ["/admin/books", LibraryBig, "Books"],
  ["/admin/issues", Users, "Issue Requests"],
  ["/admin/reservations", BookMarked, "Reservations"],
  ["/admin/overdue", Timer, "Overdue"],
  ["/admin/reports", BarChart3, "Reports"]
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const nav = user?.role === "admin" ? adminNav : studentNav;

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Ask me for a roadmap, next skill, book suggestion, project idea, or free resource list." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput("");
    setChatError("");
    const nextMessages = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(nextMessages);
    setChatLoading(true);
    try {
      const data = await api("/ai/chat", {
        method: "POST",
        body: { message: msg, history: chatMessages.slice(-6) }
      });
      setChatMessages([...nextMessages, { role: "assistant", content: data.reply, provider: data.provider }]);
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendSuggested = async (suggestedMsg) => {
    setChatError("");
    const nextMessages = [...chatMessages, { role: "user", content: suggestedMsg }];
    setChatMessages(nextMessages);
    setChatLoading(true);
    try {
      const data = await api("/ai/chat", {
        method: "POST",
        body: { message: suggestedMsg, history: chatMessages.slice(-6) }
      });
      setChatMessages([...nextMessages, { role: "assistant", content: data.reply, provider: data.provider }]);
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "student") return;

    const fetchUnread = () => {
      api("/notifications")
        .then((items) => setUnread(items.filter((item) => !item.read).length))
        .catch(() => setUnread(0));
    };

    fetchUnread();

    const interval = setInterval(fetchUnread, 4000);
    window.addEventListener("notificationsUpdated", fetchUnread);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notificationsUpdated", fetchUnread);
    };
  }, [user?.role]);

  const doLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className={`${open ? "block" : "hidden"} fixed inset-y-0 left-0 z-20 w-72 border-r border-slate-200 bg-white p-5 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:block`}>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-brand p-2 text-white"><BookOpen className="h-5 w-5" /></div>
          <div>
            <p className="font-bold">Smart Academic</p>
            <p className="text-xs text-slate-500">{user?.role === "admin" ? "Admin Console" : "Student Portal"}</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {nav.map(([to, Icon, label]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-blue-50 text-brand" : "text-slate-600 hover:bg-slate-100"}`} onClick={() => setOpen(false)}>
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        {user?.role === "student" && (
          <Link to="/roadmaps" className="mt-8 block rounded-lg bg-slate-900 p-4 text-white transition hover:bg-slate-800" onClick={() => setOpen(false)}>
            <Bot className="h-5 w-5" />
            <p className="mt-2 text-sm font-semibold">AI Study Assistant</p>
            <p className="mt-1 text-xs text-slate-300">Open chat, roadmap generation, and project ideas.</p>
          </Link>
        )}
      </aside>
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <button className="btn-secondary px-3 lg:hidden" onClick={() => setOpen(!open)}><Menu className="h-4 w-4" /></button>
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === "student" ? (
              <Link to="/notifications" className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100" title="Notifications">
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white">{unread}</span>}
              </Link>
            ) : <Bell className="h-5 w-5 text-slate-500" />}
            <button className="btn-secondary" onClick={doLogout}><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </header>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Floating AI Chat Assistant */}
      {user?.role === "student" && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {chatOpen && (
            <div className="mb-4 flex h-[480px] w-96 flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300">
              {/* Header */}
              <div className="flex items-center justify-between rounded-t-2xl bg-slate-900 p-4 text-white">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-bold text-sm">AI Study Assistant</p>
                    <p className="text-xs text-slate-300">Online | Ask me anything</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-white" onClick={() => setChatOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {chatMessages.map((item, index) => (
                  <div key={index} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${item.role === 'user'
                        ? 'bg-brand text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                      }`}>
                      <p className="whitespace-pre-wrap">{item.content}</p>
                      {item.provider && (
                        <span className="mt-1 block text-[9px] opacity-60 text-right">
                          via {item.provider}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-slate-500 border border-slate-100 rounded-2xl rounded-bl-none px-4 py-2.5 text-sm shadow-sm">
                      AI is thinking...
                    </div>
                  </div>
                )}
                {chatError && (
                  <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg text-center">
                    {chatError}
                  </div>
                )}
              </div>

              {/* Quick Suggestions */}
              <div className="border-t border-slate-100 bg-white p-2 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                {["Suggest books for AI engineering", "Project ideas for MERN", "Learn Python"].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSendSuggested(item)}
                    className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-slate-100 bg-white rounded-b-2xl flex gap-2">
                <input
                  className="input flex-1 py-1.5"
                  placeholder="Type your question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={chatLoading}
                />
                <button
                  className="btn-primary px-3 py-1.5"
                  onClick={handleSend}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Floating Bubble Button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-slate-800"
            title="AI Chat Assistant"
          >
            {chatOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
