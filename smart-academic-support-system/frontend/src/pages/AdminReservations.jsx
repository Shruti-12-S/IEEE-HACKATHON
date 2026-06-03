import { useEffect, useState } from "react";
import { CheckCircle2, Clock, RefreshCw, BookOpen, User, XCircle, Tag } from "lucide-react";
import { api } from "../api/client";
import { Empty, Loading } from "../components/State";

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

const statusTone = {
  active: "bg-amber-50 text-amber-700 border border-amber-200/60",
  fulfilled: "bg-green-50 text-green-700 border border-green-200/60",
  cancelled: "bg-slate-50 text-slate-500 border border-slate-200/60"
};

const statusDot = {
  active: "bg-amber-500",
  fulfilled: "bg-green-500",
  cancelled: "bg-slate-400"
};

const AdminReservations = () => {
  const [reservations, setReservations] = useState(null);
  const [message, setMessage] = useState("");
  const load = () => api("/reservations/all").then(setReservations);

  useEffect(() => { load(); }, []);

  const update = async (id, action) => {
    setMessage("");
    try {
      await api(`/reservations/${id}/${action}`, { method: "PATCH" });
      setMessage(action === "fulfill" ? "Reservation fulfilled and student notified." : "Reservation cancelled and student notified.");
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!reservations) return <Loading label="Loading reservations" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reservation Queue Builder</h2>
          <p className="text-sm text-slate-500 mt-1">Fulfill reservations as copy instances restore, or cancel stale requests in the queue.</p>
        </div>
        <button className="btn-secondary py-2 px-3.5 shadow-sm text-xs font-bold" onClick={load}>
          <RefreshCw className="h-4 w-4 text-slate-500" /> Refresh Queue
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700 shadow-sm">
          {message}
        </div>
      )}

      {reservations.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-soft">
          <table className="w-full min-w-[900px] text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 w-[280px]">Student / Requester</th>
                <th className="py-4">Reserved Book</th>
                <th className="py-4">Copy Availability</th>
                <th className="py-4">Queue Spot</th>
                <th className="py-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.map((reservation) => (
                <tr className="align-middle hover:bg-slate-50/40 transition duration-150" key={reservation._id}>
                  {/* Student */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${getAvatarColor(reservation.student?.name)}`}>
                        {getInitials(reservation.student?.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">{reservation.student?.name || "Unknown Student"}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{reservation.student?.email || "No email"}</p>
                      </div>
                    </div>
                  </td>

                  {/* Book */}
                  <td className="py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-800 max-w-[260px] truncate">{reservation.book?.title || "Unknown Book"}</span>
                    </div>
                  </td>

                  {/* Availability */}
                  <td className="py-4">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${
                      reservation.book?.availableCopies > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}>
                      {reservation.book?.availableCopies ?? 0} / {reservation.book?.totalCopies ?? 0} available
                    </span>
                  </td>

                  {/* Queue Position */}
                  <td className="py-4 text-xs font-bold text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 border border-slate-200 text-slate-700">
                      Position #{reservation.queuePosition}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold leading-5 capitalize ${statusTone[reservation.status] || "bg-slate-50 text-slate-500"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[reservation.status] || "bg-slate-400"}`} />
                      {reservation.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      {reservation.status === "active" && (
                        <>
                          <button
                            onClick={() => update(reservation._id, "fulfill")}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Fulfill
                          </button>
                          <button
                            onClick={() => update(reservation._id, "cancel")}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </>
                      )}
                      {reservation.status !== "active" && (
                        <span className="text-xs text-slate-400 font-medium italic select-none capitalize">
                          {reservation.status}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No active reservations" text="Reservations will populate as students join book waitlists." />
      )}
    </div>
  );
};

export default AdminReservations;
