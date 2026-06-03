import { useEffect, useState } from "react";
import { CheckCircle2, Clock, RefreshCw, Calendar, AlertCircle, BookOpen, User, DollarSign } from "lucide-react";
import { api } from "../api/client";
import { Empty, Loading } from "../components/State";
import { fmtDate } from "../utils/format";

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
  if (!name) return "bg-slate-100 text-slate-600";
  const colors = [
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
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const AdminOverdue = () => {
  const [issues, setIssues] = useState(null);
  const [message, setMessage] = useState("");
  
  const load = () => api("/issues/overdue").then(setIssues);

  useEffect(() => { load(); }, []);

  const markReturned = async (id) => {
    await api(`/issues/${id}/return`, { method: "PATCH" });
    setMessage("Return status updated and inventory restored.");
    load();
  };

  if (!issues) return <Loading label="Loading overdue books" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overdue Book Tracker</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor expired loans, calculate outstanding penalties, and process quick returns.</p>
        </div>
        <button className="btn-secondary py-2 px-3.5 shadow-sm text-xs font-bold" onClick={load}>
          <RefreshCw className="h-4 w-4 text-slate-500" /> Refresh List
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700 shadow-sm">
          {message}
        </div>
      )}

      {issues.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-soft">
          <table className="w-full min-w-[900px] text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="p-4">Student</th>
                <th className="py-4">Overdue Book</th>
                <th className="py-4">Due Date</th>
                <th className="py-4">Days Overdue</th>
                <th className="py-4">Estimated Penalty</th>
                <th className="p-4 text-right">Actions</th>
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
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{issue.student?.email || "No email"}</p>
                      </div>
                    </div>
                  </td>

                  {/* Book */}
                  <td className="py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-800 max-w-[260px] truncate">{issue.book?.title || "Unknown Book"}</span>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="py-4 text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{fmtDate(issue.dueDate)}</span>
                    </div>
                  </td>

                  {/* Days Overdue */}
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-extrabold text-rose-700 border border-rose-100/50 animate-pulse">
                      <Clock className="h-3 w-3" /> {issue.daysOverdue} days
                    </span>
                  </td>

                  {/* Estimated Penalty */}
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 rounded bg-rose-100/70 border border-rose-200/40 px-2 py-0.5 text-xs font-extrabold text-rose-800">
                      Rs. {issue.estimatedFine}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => markReturned(issue._id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm hover:shadow transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Returned
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No overdue books" text="All issued books are within their active loan periods." />
      )}
    </div>
  );
};

export default AdminOverdue;
