import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, BarChart3, BookMarked, BookOpen, CheckCircle2, Clock, LibraryBig, RefreshCw, Users, XCircle, X } from "lucide-react";
import { api } from "../api/client";
import StatCard from "../components/StatCard";
import { Empty, ErrorBox, Loading } from "../components/State";
import { fmtDate } from "../utils/format";

const colors = ["#2563eb", "#0f766e", "#f59e0b", "#e11d48", "#7c3aed", "#0891b2", "#475569", "#16a34a"];

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
  if (!name) return "bg-slate-100 text-slate-600";
  const avatarColors = [
    "bg-blue-50 text-blue-700 border border-blue-200/40",
    "bg-indigo-50 text-indigo-700 border border-indigo-200/40",
    "bg-emerald-50 text-emerald-700 border border-emerald-200/40",
    "bg-pink-50 text-pink-700 border border-pink-200/40",
    "bg-amber-50 text-amber-700 border border-amber-200/40",
    "bg-purple-50 text-purple-700 border border-purple-200/40",
    "bg-cyan-50 text-cyan-700 border border-cyan-200/40"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

const MiniList = ({ title, children, to, actionLabel }) => (
  <section className="card flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="font-bold text-slate-800 text-sm">{title}</h2>
        {to && <Link className="text-xs font-bold text-brand hover:underline" to={to}>{actionLabel || "View all"}</Link>}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  </section>
);

const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => {
    setError("");
    api("/reports/admin").then(setReport).catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, []);
  if (!report && !error) return <Loading label="Loading admin dashboard" />;

  const issueAction = async (id, action) => {
    setMessage("");
    setError("");
    try {
      await api(`/issues/${id}/${action}`, { method: "PATCH" });
      setMessage(action === "approve" ? "Issue request approved successfully." : "Issue request rejected.");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const markReturned = async (id) => {
    setMessage("");
    setError("");
    try {
      await api(`/issues/${id}/return`, { method: "PATCH" });
      setMessage("Book marked as returned successfully.");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const fulfillReservation = async (id) => {
    setMessage("");
    setError("");
    try {
      await api(`/reservations/${id}/fulfill`, { method: "PATCH" });
      setMessage("Reservation fulfilled successfully.");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !report) return <ErrorBox message={error} />;

  const inventoryChart = [
    { label: "Available", value: report.availableCopies },
    { label: "Issued", value: report.issuedCopies }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative space-y-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            Admin Console
          </span>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Hello, Administrator! 🛡️</h2>
          <p className="max-w-xl text-sm text-slate-300 leading-relaxed">
            Monitor live operations, manage books requests, approve student checkouts, track overdue fines, and analyze utilization reports.
          </p>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Operations Control Center</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time status updates and action items.</p>
        </div>
        <button className="btn-secondary" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      {/* Success Alert Banner */}
      {message && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm font-semibold">{message}</p>
          </div>
          <button onClick={() => setMessage("")} className="text-emerald-500 hover:text-emerald-700">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      {/* Error Alert Banner */}
      {error && (
        <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
          <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-700">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      {/* Grid of Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard label="Book Titles" value={report.totalBooks} icon={BookOpen} tone="blue" />
        <StatCard label="Total Copies" value={report.totalCopies} icon={LibraryBig} tone="teal" />
        <StatCard label="Issued Books" value={report.issuedBooks} icon={BarChart3} tone="teal" />
        <StatCard label="Overdue" value={report.overdueBooks} icon={Clock} tone="rose" />
        <StatCard label="Active Students" value={report.activeStudents} icon={Users} tone="amber" />
        <StatCard label="Reservations" value={report.activeReservations} icon={BookMarked} tone="blue" />
      </div>

      {/* Action alerts cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex flex-col justify-between border-l-4 border-l-blue-500">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Approvals</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">{report.pendingRequests}</p>
          </div>
          <Link className="mt-3 text-xs font-bold text-brand hover:underline" to="/admin/issues">Review requests →</Link>
        </div>
        <div className="card flex flex-col justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Low-stock titles</p>
            <p className="mt-1 text-3xl font-extrabold text-amber-600">{report.lowStockCount}</p>
          </div>
          <Link className="mt-3 text-xs font-bold text-brand hover:underline" to="/admin/books">Manage inventory →</Link>
        </div>
        <div className="card flex flex-col justify-between border-l-4 border-l-rose-500">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Unavailable titles</p>
            <p className="mt-1 text-3xl font-extrabold text-rose-600">{report.unavailableCount}</p>
          </div>
          <Link className="mt-3 text-xs font-bold text-brand hover:underline" to="/admin/reservations">Check reservations →</Link>
        </div>
        <div className="card flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">New students this week</p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-700">{report.newStudentsThisWeek}</p>
          </div>
          <p className="mt-3 text-xs text-slate-500 font-semibold">Avg rating: {report.averageRating?.toFixed(1) || "0.0"}/5.0</p>
        </div>
      </div>

      {/* Main Analytics charts */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="card h-80">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm">Library Borrow Overview</h2>
            <Link className="text-xs font-bold text-brand hover:underline" to="/admin/reports">Full reports</Link>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={report.chart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="card h-80">
          <h2 className="mb-4 font-bold text-slate-800 text-sm">Inventory Distribution</h2>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={inventoryChart} dataKey="value" nameKey="label" outerRadius={85} label>
                {inventoryChart.map((entry, index) => <Cell key={entry.label} fill={colors[index]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Category and request trends */}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card h-80">
          <h2 className="mb-4 font-bold text-slate-800 text-sm">Books by Course Category</h2>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={report.categoryDistribution}>
              <defs>
                <linearGradient id="colorCategory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area dataKey="value" stroke="#0f766e" fill="url(#colorCategory)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="card h-80">
          <h2 className="mb-4 font-bold text-slate-800 text-sm">Request Status Distribution</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={report.requestStatusDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Operations action columns */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Pending approvals */}
        <MiniList title="Pending Issue Requests" to="/admin/issues" actionLabel="Reviews panel">
          {report.pendingIssueRequests.length ? report.pendingIssueRequests.map((issue) => (
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 hover:shadow-sm transition duration-200 flex flex-col justify-between gap-3" key={issue._id}>
              <div className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${getAvatarColor(issue.student?.name)}`}>
                  {getInitials(issue.student?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 text-xs truncate" title={issue.book?.title}>{issue.book?.title || "Unknown Book"}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{issue.student?.name || "Unknown Student"} • {issue.student?.department || "General"}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end border-t border-slate-50 pt-2.5">
                <button 
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition" 
                  onClick={() => issueAction(issue._id, "approve")}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
                <button 
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition" 
                  onClick={() => issueAction(issue._id, "reject")}
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          )) : <Empty title="All requests cleared" text="No new pending approvals." />}
        </MiniList>

        {/* Overdue watch list */}
        <MiniList title="Overdue Alert List" to="/admin/overdue" actionLabel="Overdue monitor">
          {report.overdueIssueList.length ? report.overdueIssueList.map((issue) => (
            <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3 hover:bg-rose-50/60 transition flex flex-col justify-between" key={issue._id}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 animate-pulse" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{issue.book?.title}</p>
                  <p className="text-xs text-rose-700 mt-0.5 font-semibold">
                    {issue.student?.name} • {issue.daysOverdue} days overdue
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Due {fmtDate(issue.dueDate)}</p>
                </div>
              </div>
              <button 
                className="btn-primary mt-3 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-xs gap-1 font-bold" 
                onClick={() => markReturned(issue._id)}
              >
                Mark Returned
              </button>
            </div>
          )) : <Empty title="Overdues are clear" text="All borrows are on schedule." />}
        </MiniList>

        {/* Reservations queue */}
        <MiniList title="Reservation Queue Tracker" to="/admin/reservations" actionLabel="Queue builder">
          {report.activeReservationList.length ? report.activeReservationList.map((reservation) => (
            <div className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50/50 transition flex flex-col justify-between" key={reservation._id}>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{reservation.book?.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{reservation.student?.name} • Queue Position #{reservation.queuePosition}</p>
                <p className="text-[10px] text-slate-400 mt-1">Available inventory: {reservation.book?.availableCopies} / {reservation.book?.totalCopies} copies</p>
              </div>
              <button 
                className="btn-secondary mt-3 py-1.5 px-3 border-teal-200 text-teal-700 hover:bg-teal-50 text-xs gap-1 font-bold" 
                onClick={() => fulfillReservation(reservation._id)}
              >
                Fulfill Reservation
              </button>
            </div>
          )) : <Empty title="Reservation queue is empty" text="No students waiting for books." />}
        </MiniList>
      </div>

      {/* Inventory Health & Recent Logs */}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <MiniList title="Inventory Health Tracker" to="/admin/books" actionLabel="Open inventory">
          {report.lowStockBooks.length ? report.lowStockBooks.map((book) => (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50/50 transition gap-2" key={book._id}>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{book.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{book.category} • Shelf: {book.shelfLocation || "None"}</p>
              </div>
              <span className={`shrink-0 rounded px-2.5 py-1 text-xs font-bold ${
                book.availableCopies === 0 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
              }`}>
                {book.availableCopies} / {book.totalCopies}
              </span>
            </div>
          )) : <Empty title="Inventory healthy" text="No titles are currently running low." />}
        </MiniList>

        <MiniList title="Recent Library Logs">
          {report.recentIssueRequests.length ? report.recentIssueRequests.map((issue) => (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50/50 transition gap-2" key={issue._id}>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{issue.book?.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{issue.student?.name} • Checked: {fmtDate(issue.createdAt)}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                issue.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                issue.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                'bg-slate-50 text-slate-600 border border-slate-100'
              }`}>
                {issue.status}
              </span>
            </div>
          )) : <Empty title="No recent activity logged" text="Activity stats will populate as actions occur." />}
        </MiniList>
      </div>

      {/* Popular library assets */}
      <section className="card">
        <h2 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Most Popular Books & Demand Analysis</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {report.popularBooks.map((book) => (
            <div className="rounded-xl border border-slate-200 p-3 hover:shadow-sm transition" key={book._id}>
              <p className="font-bold text-slate-800 text-sm truncate">{book.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{book.author}</p>
              <div className="mt-2 flex justify-between items-center text-xs text-slate-400">
                <span>{book.issueCount} borrow requests</span>
                <span className="font-bold text-slate-600">{book.averageRating?.toFixed(1) || "0.0"} / 5.0 ⭐</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
