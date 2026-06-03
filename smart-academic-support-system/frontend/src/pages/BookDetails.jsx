import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { Empty, Loading } from "../components/State";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [availability, setAvailability] = useState(null);

  useEffect(() => {
    api(`/books/${id}`).then(setBook);
    api(`/books/${id}/availability`).then(setAvailability);
  }, [id]);
  if (!book) return <Loading label="Loading book details" />;

  const rate = async () => {
    await api(`/books/${id}/rate`, { method: "POST", body: { rating, comment } });
    const refreshed = await api(`/books/${id}`);
    setBook(refreshed);
    setComment("");
  };
  const request = async () => {
    try {
      if (book.availableCopies > 0) await api("/issues/request", { method: "POST", body: { bookId: book._id } });
      else await api("/reservations", { method: "POST", body: { bookId: book._id } });
      setMessage(book.availableCopies > 0 ? "Issue request submitted." : "Reservation created.");
      const refreshed = await api(`/books/${id}/availability`);
      setAvailability(refreshed);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <img className="h-96 w-full rounded-lg object-cover" src={book.coverUrl} alt={book.title} />
      <div className="space-y-5">
        <div className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-3xl font-bold">{book.title}</h2><p className="mt-1 text-slate-500">{book.author}</p></div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-brand">{availability?.availableCopies ?? book.availableCopies}/{availability?.totalCopies ?? book.totalCopies} available</span>
          </div>
          {availability && <p className="mt-3 rounded-md bg-slate-100 p-3 text-sm text-slate-600">Availability check: {availability.available ? "Available for issue" : "Currently unavailable, reservation recommended"} - Shelf {availability.shelfLocation || "not assigned"}</p>}
          {message && <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{message}</div>}
          <p className="mt-4 text-slate-700">{book.description}</p>
          <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
            <span><b>Category:</b> {book.category}</span><span><b>Topic:</b> {book.topic}</span><span><b>Shelf:</b> {book.shelfLocation}</span>
          </div>
          <button className="btn-primary mt-5" onClick={request}>{book.availableCopies > 0 ? "Request issue" : "Reserve book"}</button>
        </div>
        <div className="card">
          <h3 className="font-bold">Rate this book</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-[120px_1fr_auto]">
            <select className="input" value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}</select>
            <input className="input" placeholder="Short review" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn-primary" onClick={rate}>Submit</button>
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold">Reviews</h3>
          <div className="mt-3 space-y-3">
            {book.reviews?.length ? book.reviews.map((r) => <div className="rounded-md border border-slate-200 p-3" key={r._id}><p className="font-semibold">{r.rating}/5 by {r.student?.name}</p><p className="text-sm text-slate-600">{r.comment}</p></div>) : <Empty title="No reviews yet" text="Be the first to rate it." />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
