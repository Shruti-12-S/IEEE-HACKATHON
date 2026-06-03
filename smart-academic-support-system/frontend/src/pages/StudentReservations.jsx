import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Empty, ErrorBox, Loading } from "../components/State";
import { fmtDate } from "../utils/format";

const StudentReservations = () => {
  const [reservations, setReservations] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = () => api("/reservations/my").then(setReservations).catch((err) => setError(err.message));

  useEffect(() => { load(); }, []);
  if (!reservations) return <Loading label="Loading reservations" />;

  const cancel = async (id) => {
    setMessage("");
    setError("");
    try {
      await api(`/reservations/${id}/cancel`, { method: "PATCH", body: { notes: "Cancelled by student" } });
      setMessage("Reservation cancelled.");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">My Reservations</h2>
        <p className="text-sm text-slate-500">Track unavailable books you reserved and your queue position.</p>
      </div>
      {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
      {error && <ErrorBox message={error} />}
      {reservations.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reservations.map((reservation) => (
            <div className="card" key={reservation._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{reservation.book?.title}</h3>
                  <p className="text-sm text-slate-500">{reservation.book?.author}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-brand">{reservation.status}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">Queue position: #{reservation.queuePosition}</p>
              <p className="text-sm text-slate-600">Available copies: {reservation.book?.availableCopies}/{reservation.book?.totalCopies}</p>
              <p className="text-sm text-slate-500">Reserved on {fmtDate(reservation.createdAt)}</p>
              {reservation.status === "active" && <button className="btn-secondary mt-4 text-rose-600" onClick={() => cancel(reservation._id)}>Cancel reservation</button>}
            </div>
          ))}
        </div>
      ) : <Empty title="No reservations" text="Reserve unavailable books from the book search page." />}
    </div>
  );
};

export default StudentReservations;
