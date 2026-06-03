import { useEffect, useState } from "react";
import { BookOpen, Clock, Sparkles, Target, Timer, Bell, ArrowRight, Calendar, Award, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import { Empty, Loading } from "../components/State";
import { fmtDate } from "../utils/format";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ issues: [], roadmaps: [], notifications: [], reservations: [], recommendations: [] });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api("/issues/my"), api("/roadmaps/my"), api("/notifications"), api("/reservations/my"), api("/recommendations/books")])
      .then(([issues, roadmaps, notifications, reservations, recommendations]) => setData({ issues, roadmaps, notifications, reservations, recommendations: recommendations.recommendations || [] }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loading label="Loading your dashboard" />;
  const active = data.issues.filter((i) => i.status === "approved");

  const getDueStatus = (dueDateStr) => {
    const due = new Date(dueDateStr);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: "Overdue", style: "bg-rose-50 border-rose-100 text-rose-800" };
    if (diffDays <= 3) return { label: `Due in ${diffDays}d`, style: "bg-amber-50 border-amber-200 text-amber-800" };
    return { label: `Due in ${diffDays}d`, style: "bg-slate-50 border-slate-200 text-slate-600" };
  };

  return (
    <div className="space-y-6">
      {/* Welcome Greeting Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative space-y-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            Student Dashboard
          </span>
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            {user?.loginCount === 1 ? `Welcome, ${user?.name || "Student"}!` : `Welcome back, ${user?.name || "Student"}!`} 🎓
          </h2>
          <p className="max-w-xl text-sm text-blue-100 leading-relaxed">
            Manage your library borrow logs, check your custom AI-generated roadmaps, and review recommendations for your courses.
          </p>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Academic Activity</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time status of your books, roadmaps, and alerts.</p>
        </div>
        <button className="btn-secondary" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Active Books" value={active.length} icon={BookOpen} tone="blue" />
        <StatCard label="Pending Requests" value={data.issues.filter((i) => i.status === "pending").length} icon={Clock} tone="amber" />
        <StatCard label="Reservations" value={data.reservations.filter((r) => r.status === "active").length} icon={Timer} tone="teal" />
        <StatCard label="Roadmaps" value={data.roadmaps.length} icon={Target} tone="blue" />
        <StatCard label="Unread Alerts" value={data.notifications.filter((n) => !n.read).length} icon={Sparkles} tone="rose" />
      </div>

      {/* 3-Column Actions Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Issued Books */}
        <section className="card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <BookOpen className="h-4.5 w-4.5 text-blue-500" /> Current Issued Books
              </h2>
              <Link className="text-xs font-bold text-brand hover:underline" to="/issued">View All</Link>
            </div>
            <div className="mt-4 space-y-3">
              {active.length ? active.map((issue) => {
                const dueStatus = getDueStatus(issue.dueDate);
                return (
                  <div className={`rounded-xl border p-3 flex justify-between items-start gap-2.5 transition hover:shadow-sm ${dueStatus.style}`} key={issue._id}>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-850 truncate text-sm">{issue.book?.title}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Due {fmtDate(issue.dueDate)}
                      </p>
                    </div>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase shrink-0 bg-white shadow-sm border border-slate-100">
                      {dueStatus.label}
                    </span>
                  </div>
                );
              }) : <Empty title="No active books" text="Browse the catalog and borrow books to start reading." />}
            </div>
          </div>
        </section>

        {/* Roadmap Progress */}
        <section className="card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Target className="h-4.5 w-4.5 text-indigo-500" /> Latest Roadmaps
              </h2>
              <Link className="text-xs font-bold text-brand hover:underline" to="/progress">Track</Link>
            </div>
            <div className="mt-4 space-y-4">
              {data.roadmaps.slice(0, 3).map((roadmap) => (
                <div key={roadmap._id} className="space-y-1.5 p-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="truncate pr-2">{roadmap.skill}</span>
                    <span className="text-mint shrink-0">{roadmap.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-2 rounded-full bg-mint transition-all duration-300" style={{ width: `${roadmap.progress}%` }} />
                  </div>
                </div>
              ))}
              {!data.roadmaps.length && <Empty title="No roadmaps yet" text="Generate roadmaps in the Roadmap section." />}
            </div>
          </div>
        </section>

        {/* Unread Alerts */}
        <section className="card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Bell className="h-4.5 w-4.5 text-rose-500" /> Unread Alerts
              </h2>
              <Link className="text-xs font-bold text-brand hover:underline" to="/notifications">Open</Link>
            </div>
            <div className="mt-4 space-y-3">
              {data.notifications.filter((n) => !n.read).slice(0, 3).map((n) => (
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 relative overflow-hidden transition hover:bg-blue-50/60 animate-pulse" key={n._id}>
                  <p className="font-bold text-xs text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                </div>
              ))}
              {!data.notifications.filter((n) => !n.read).length && <Empty title="No unread alerts" text="You've read all alerts." />}
            </div>
          </div>
        </section>
      </div>

      {/* 2-Column Actions Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reservations Waitlist */}
        <section className="card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Clock className="h-4.5 w-4.5 text-teal-500" /> Reservations Waitlist
            </h2>
            <Link className="text-xs font-bold text-brand hover:underline" to="/my-reservations">Manage</Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.reservations.filter((r) => r.status === "active").slice(0, 3).map((r) => (
              <div className="rounded-xl border border-slate-200 p-3 flex justify-between items-center gap-2 hover:bg-slate-50 transition" key={r._id}>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 truncate text-sm">{r.book?.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Author: {r.book?.author}</p>
                </div>
                <span className="rounded-lg bg-teal-55 border border-teal-150 px-2.5 py-1 text-xs font-bold text-teal-700 shrink-0">
                  Queue #{r.queuePosition}
                </span>
              </div>
            ))}
            {!data.reservations.filter((r) => r.status === "active").length && <Empty title="No active reservations" text="Reserve books that are currently checked out." />}
          </div>
        </section>

        {/* Recommended Books */}
        <section className="card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Award className="h-4.5 w-4.5 text-amber-500" /> Recommended Books
            </h2>
            <Link className="text-xs font-bold text-brand hover:underline" to="/recommendations">Explore</Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recommendations.slice(0, 3).map((book) => (
              <div className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition flex justify-between items-start gap-3" key={book._id}>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{book.title}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">"{book.reason}"</p>
                </div>
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-brand shrink-0">
                  {book.category}
                </span>
              </div>
            ))}
            {!data.recommendations.length && <Empty title="No recommendations yet" text="Refine your interests in profile to start." />}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
