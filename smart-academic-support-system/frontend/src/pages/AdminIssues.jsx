import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Download, RefreshCw, RotateCcw, Search, Timer, Undo2, XCircle, Calendar, AlertCircle, BookOpen, User, Tag, FileText } from "lucide-react";
import { api } from "../api/client";
import { Empty, ErrorBox, Loading } from "../components/State";
import { fmtDate, overdue } from "../utils/format";

const statusTone = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200/60",
  approved: "bg-blue-50 text-blue-700 border border-blue-200/60",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200/60",
  return_requested: "bg-purple-50 text-purple-700 border border-purple-200/60",
  returned: "bg-green-50 text-green-700 border border-green-200/60"
};

const statusDot = {
  pending: "bg-amber-500",
  approved: "bg-blue-500",
  rejected: "bg-rose-500",
  return_requested: "bg-purple-500",
  returned: "bg-green-500"
};

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
  if (!name) return "bg-slate-100 text-slate-600";
  const colors = [
    "bg-blue-50 text-blue-700 border border-blue-200/45",
    "bg-indigo-50 text-indigo-700 border border-indigo-200/45",
    "bg-emerald-50 text-emerald-700 border border-emerald-200/45",
    "bg-pink-50 text-pink-700 border border-pink-200/45",
    "bg-amber-50 text-amber-700 border border-amber-200/45",
    "bg-purple-50 text-purple-700 border border-purple-200/45",
    "bg-cyan-50 text-cyan-700 border border-cyan-200/45"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const AdminIssues = () => {
  const [issues, setIssues] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ q: "", status: "all", overdue: false });
  const [loanDays, setLoanDays] = useState(14);
  const [extendDays, setExtendDays] = useState(7);
  const [notes, setNotes] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.overdue) params.set("overdue", "true");
    return params.toString();
  }, [filters]);

  const load = () => {
    setError("");
    Promise.all([api(`/issues/all?${query}`), api("/issues/stats")])
      .then(([issueData, statData]) => {
        setIssues(issueData);
        setStats(statData);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, [query]);

  const action = async (id, actionName, body = {}) => {
    setMessage("");
    setError("");
    try {
      await api(`/issues/${id}/${actionName}`, { method: "PATCH", body });
      setMessage(`Action '${actionName}' applied successfully.`);
      // Clear note for this specific issue
      setNotes(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const approve = (issue) => action(issue._id, "approve", { loanDays: Number(loanDays), notes: notes[issue._id] });
  const reject = (issue) => action(issue._id, "reject", { notes: notes[issue._id] || "Rejected by library admin" });
  const extend = (issue) => action(issue._id, "extend", { days: Number(extendDays), notes: notes[issue._id] });
  const markReturned = (issue) => action(issue._id, "return", { notes: notes[issue._id] });
  const cancel = (issue) => action(issue._id, "cancel", { notes: notes[issue._id] || "Cancelled by library admin" });

  const exportCsv = () => {
    const rows = [
      ["Student", "Email", "Department", "Book", "Status", "Requested", "Due Date", "Fine", "Notes"],
      ...issues.map((issue) => [
        issue.student?.name || "",
        issue.student?.email || "",
        issue.student?.department || "",
        issue.book?.title || "",
        issue.status,
        fmtDate(issue.createdAt),
        fmtDate(issue.dueDate),
        issue.estimatedFine || 0,
        issue.notes || ""
      ])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "issue-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!issues || !stats) return <Loading label="Loading issue requests" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Issue Request Management</h2>
          <p className="text-sm text-slate-500 mt-1">Approve, reject, cancel, extend due dates, record book returns, and monitor overdue fines.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button className="btn-secondary py-2 px-3.5 shadow-sm text-xs font-bold" onClick={exportCsv}>
            <Download className="h-4 w-4 text-slate-500" /> Export CSV
          </button>
          <button className="btn-secondary py-2 px-3.5 shadow-sm text-xs font-bold" onClick={load}>
            <RefreshCw className="h-4 w-4 text-slate-500" /> Refresh
          </button>
        </div>
      </div>

      {/* Modern Detailed Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {/* Total */}
        <div className="card flex items-center justify-between border-slate-200/80 bg-white p-4.5 hover:shadow-md transition duration-200">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Requests</p>
            <p className="mt-1.5 text-2xl font-extrabold text-slate-800">{stats.total}</p>
          </div>
          <div className="rounded-xl p-2.5 bg-slate-50 text-slate-600 border border-slate-200/50">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="card flex items-center justify-between border-amber-200/70 bg-amber-50/20 p-4.5 hover:shadow-md transition duration-200">
          <div>
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending</p>
            <p className="mt-1.5 text-2xl font-extrabold text-amber-700">{stats.pending}</p>
          </div>
          <div className="rounded-xl p-2.5 bg-amber-50 text-amber-600 border border-amber-200/50">
            <Timer className="h-5 w-5" />
          </div>
        </div>

        {/* Approved */}
        <div className="card flex items-center justify-between border-blue-200/70 bg-blue-50/20 p-4.5 hover:shadow-md transition duration-200">
          <div>
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Active / Out</p>
            <p className="mt-1.5 text-2xl font-extrabold text-blue-700">{stats.approved}</p>
          </div>
          <div className="rounded-xl p-2.5 bg-blue-50 text-blue-600 border border-blue-200/50">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Return Requests */}
        <div className="card flex items-center justify-between border-purple-200/70 bg-purple-50/20 p-4.5 hover:shadow-md transition duration-200">
          <div>
            <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Return Req.</p>
            <p className="mt-1.5 text-2xl font-extrabold text-purple-700">{stats.returnRequested}</p>
          </div>
          <div className="rounded-xl p-2.5 bg-purple-50 text-purple-600 border border-purple-200/50">
            <RotateCcw className="h-5 w-5" />
          </div>
        </div>

        {/* Overdue */}
        <div className="card flex items-center justify-between border-rose-200/70 bg-rose-50/20 p-4.5 hover:shadow-md transition duration-200">
          <div>
            <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Overdue</p>
            <p className={`mt-1.5 text-2xl font-extrabold text-rose-700 ${stats.overdue > 0 ? "animate-pulse text-red-600" : ""}`}>{stats.overdue}</p>
          </div>
          <div className="rounded-xl p-2.5 bg-rose-50 text-rose-600 border border-rose-200/50">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Due Soon */}
        <div className="card flex items-center justify-between border-amber-200/70 bg-amber-50/20 p-4.5 hover:shadow-md transition duration-200">
          <div>
            <p className="text-[11px] font-bold text-amber-600 tracking-wider uppercase">Due Soon</p>
            <p className="mt-1.5 text-2xl font-extrabold text-amber-800">{stats.dueSoon}</p>
          </div>
          <div className="rounded-xl p-2.5 bg-amber-50 text-amber-600 border border-amber-200/50">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Rejected */}
        <div className="card flex items-center justify-between border-slate-200 bg-white p-4.5 hover:shadow-md transition duration-200">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
            <p className="mt-1.5 text-2xl font-extrabold text-slate-700">{stats.rejected}</p>
          </div>
          <div className="rounded-xl p-2.5 bg-slate-50 text-slate-500 border border-slate-200/50">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {message && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700 shadow-sm">{message}</div>}
      {error && <ErrorBox message={error} />}

      {/* Split Control & Lending Policy configurations */}
      <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
        {/* Filter Panel */}
        <div className="card space-y-4 shadow-sm border border-slate-200/80">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Filter Requests</h3>
          <div className="grid gap-3 sm:grid-cols-[1.5fr_1.1fr_1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input className="input pl-9" placeholder="Search student, email, book, department" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
            </div>
            
            <select className="input font-medium" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, overdue: false })}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved / Active Loan</option>
              <option value="return_requested">Return Requested</option>
              <option value="rejected">Rejected / Cancelled</option>
              <option value="returned">Returned Successfully</option>
            </select>

            <label className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm select-none cursor-pointer hover:bg-slate-50 transition">
              <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-100" checked={filters.overdue} onChange={(e) => setFilters({ ...filters, overdue: e.target.checked, status: e.target.checked ? "approved" : filters.status })} />
              <span className="font-bold text-slate-700">Overdue Only</span>
            </label>

            <button className="btn-secondary font-bold text-xs" onClick={() => setFilters({ q: "", status: "all", overdue: false })}>Reset</button>
          </div>
        </div>

        {/* Global Policy Config */}
        <div className="card space-y-4 shadow-sm border border-slate-200/80 bg-white">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Lending Duration Policies</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Issue</label>
              <div className="relative mt-1 flex items-center">
                <input className="input pr-12 font-bold text-slate-700" min="1" type="number" value={loanDays} onChange={(e) => setLoanDays(e.target.value)} />
                <span className="absolute right-3 text-[11px] font-bold text-slate-400">days</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Extension</label>
              <div className="relative mt-1 flex items-center">
                <input className="input pr-12 font-bold text-slate-700" min="1" type="number" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} />
                <span className="absolute right-3 text-[11px] font-bold text-slate-400">days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Issue Request Table Grid */}
      {issues.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-soft">
          <table className="w-full min-w-[1100px] text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 w-[280px]">Student / Account</th>
                <th className="py-4 w-[260px]">Requested Book</th>
                <th className="py-4 w-[150px]">Current Status</th>
                <th className="py-4 w-[130px]">Requested On</th>
                <th className="py-4 w-[170px]">Due Date & Fines</th>
                <th className="p-4 w-[300px] text-right">Actions & Admin Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issues.map((issue) => (
                <tr className="align-middle hover:bg-slate-50/40 transition duration-150" key={issue._id}>
                  {/* Student */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${getAvatarColor(issue.student?.name)}`}>
                        {getInitials(issue.student?.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">{issue.student?.name || "Unknown Student"}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{issue.student?.email || "No email provided"}</p>
                        {issue.student?.department && (
                          <span className="inline-flex mt-1 items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200/40 uppercase">
                            <Tag className="h-2.5 w-2.5 text-slate-500" /> {issue.student.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Book */}
                  <td className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight line-clamp-2 max-w-[210px]">{issue.book?.title || "Unknown Book"}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{issue.book?.author || "Unknown Author"}</p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold leading-5 capitalize ${statusTone[issue.status] || "bg-slate-50 text-slate-500"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[issue.status] || "bg-slate-400"}`} />
                        {issue.status.replace("_", " ")}
                      </span>
                      {overdue(issue.dueDate) && issue.status === "approved" && (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 mt-1 border border-rose-200/30">
                          <AlertCircle className="h-3 w-3" /> Overdue
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Requested On */}
                  <td className="py-4 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{fmtDate(issue.createdAt)}</span>
                    </div>
                  </td>

                  {/* Due Date & Fines */}
                  <td className="py-4 text-xs">
                    {issue.status === "pending" || issue.status === "rejected" ? (
                      <span className="text-slate-400 font-medium italic">Pending Approval</span>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-slate-400 animate-pulse" />
                          <span>{fmtDate(issue.dueDate)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className={`font-semibold inline-flex w-fit rounded px-1.5 py-0.5 ${issue.estimatedFine ? "bg-rose-50 text-rose-600 border border-rose-200/30" : "bg-slate-100 text-slate-500"}`}>
                            Fine: Rs. {issue.estimatedFine || 0}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            Renewals: {issue.renewalCount || 0}/2
                          </p>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Actions & Notes Combined */}
                  <td className="p-4">
                    <div className="flex flex-col items-end gap-2">
                      {/* Compact Notes Input */}
                      <div className="relative w-full max-w-[280px]">
                        <FileText className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          className="input pl-8 py-1.5 text-xs placeholder:text-slate-400"
                          placeholder="Admin notes (for this action)..."
                          value={notes[issue._id] || ""}
                          onChange={(e) => setNotes({ ...notes, [issue._id]: e.target.value })}
                        />
                      </div>

                      {/* Action buttons list */}
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {issue.status === "pending" && (
                          <>
                            <button
                              onClick={() => approve(issue)}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => reject(issue)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </button>
                            <button
                              onClick={() => cancel(issue)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                            >
                              <Undo2 className="h-3.5 w-3.5" /> Cancel
                            </button>
                          </>
                        )}
                        
                        {["approved", "return_requested"].includes(issue.status) && (
                          <>
                            {issue.status === "approved" && (
                              <button
                                onClick={() => extend(issue)}
                                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                              >
                                Extend {extendDays}d
                              </button>
                            )}
                            <button
                              onClick={() => markReturned(issue)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                            >
                              Mark Returned
                            </button>
                          </>
                        )}

                        {["returned", "rejected"].includes(issue.status) && (
                          <span className="text-xs text-slate-400 font-medium italic select-none">
                            {issue.notes ? `"${issue.notes}"` : "Completed / No active actions"}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No issue requests match" text="Try clearing search keywords, filters, or wait for student requests to arrive." />
      )}
    </div>
  );
};

export default AdminIssues;
