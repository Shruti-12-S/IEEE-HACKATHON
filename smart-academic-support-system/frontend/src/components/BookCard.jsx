import { BookOpen, Star } from "lucide-react";
import { Link } from "react-router-dom";

const BookCard = ({ book, action }) => (
  <div className="card flex h-full flex-col overflow-hidden p-0">
    <img src={book.coverUrl || "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80"} alt={book.title} className="h-40 w-full object-cover" />
    <div className="flex flex-1 flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={`/books/${book._id}`} className="font-semibold text-slate-900 hover:text-brand">{book.title}</Link>
          <p className="text-sm text-slate-500">{book.author}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-brand">{book.category}</span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{book.description}</p>
      {book.reason && <p className="mt-3 rounded-md bg-blue-50 p-2 text-xs text-blue-700">{book.reason}</p>}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className={book.availableCopies > 0 ? "text-mint" : "text-rose-600"}>
          {book.availableCopies > 0 ? `${book.availableCopies} available` : "Reserve only"}
        </span>
        <span className="flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current" /> {book.averageRating?.toFixed?.(1) || "0.0"}</span>
      </div>
      {typeof book.score === "number" && <p className="mt-2 text-xs font-semibold text-slate-500">Recommendation score: {book.score}</p>}
      <div className="mt-4 flex gap-2">
        <Link to={`/books/${book._id}`} className="btn-secondary flex-1"><BookOpen className="h-4 w-4" /> Details</Link>
        {action}
      </div>
    </div>
  </div>
);

export default BookCard;
