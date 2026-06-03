import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Empty, Loading } from "../components/State";
import { fmtDate, overdue } from "../utils/format";

const MyIssuedBooks = () => {
  const [issues, setIssues] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = () => api("/issues/my").then(setIssues);
  useEffect(() => { load(); }, []);
  if (!issues) return <Loading label="Loading issued books" />;

  const run = async (id, action) => {
    setMessage("");
    setError("");
    try {
      await api(`/issues/${id}/${action}`, { method: "PATCH", body: { notes: `Student requested ${action}` } });
      setMessage(action === "cancel" ? "Request cancelled." : action === "renew" ? "Book renewed." : "Return recorded.");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">My Issued Books</h2>
      {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {issues.length ? <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100"><tr><th className="p-3">Book</th><th>Status</th><th>Due date</th><th>Due tracking</th><th>Fine</th><th className="p-3">Actions</th></tr></thead>
          <tbody>{issues.map((issue) => (
            <tr className="border-t border-slate-200" key={issue._id}>
              <td className="p-3 font-medium">{issue.book?.title}</td>
              <td><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-brand">{issue.status}</span></td>
              <td>{fmtDate(issue.dueDate)}</td>
              <td>
                {issue.status === "return_requested" ? <span className="text-amber-600">Return waiting for admin</span> : overdue(issue.dueDate) && issue.status === "approved" ? <span className="text-rose-600">{Math.abs(issue.daysRemaining || 0)} days overdue</span> : issue.daysRemaining != null ? `${issue.daysRemaining} days left` : "Not issued yet"}
              </td>
              <td>{issue.estimatedFine ? <span className="font-semibold text-rose-600">Rs. {issue.estimatedFine}</span> : "Rs. 0"}</td>
              <td className="flex flex-wrap gap-2 p-3">
                {issue.status === "pending" && <button className="btn-secondary text-rose-600" onClick={() => run(issue._id, "cancel")}>Cancel</button>}
                {issue.status === "approved" && <><button className="btn-secondary" onClick={() => run(issue._id, "renew")}>Renew</button><button className="btn-primary" onClick={() => run(issue._id, "return")}>Request return</button></>}
                {issue.status === "return_requested" && <span className="text-sm text-slate-500">Admin confirmation pending</span>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div> : <Empty title="No issue history" text="Requested and issued books appear here." />}
    </div>
  );
};

export default MyIssuedBooks;
