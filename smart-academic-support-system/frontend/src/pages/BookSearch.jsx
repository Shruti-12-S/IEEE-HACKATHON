import { useEffect, useState } from "react";
import { BookmarkPlus, Check } from "lucide-react";
import { api } from "../api/client";
import BookCard from "../components/BookCard";
import { Empty, ErrorBox, Loading } from "../components/State";

const BookSearch = () => {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({ q: "", title: "", author: "", category: "", topic: "", available: false });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [requestedBookIds, setRequestedBookIds] = useState(new Set());
  const [options, setOptions] = useState({ titles: [], authors: [], categories: [], topics: [] });

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    api(`/books?${params}`).then(setBooks).finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    api("/books")
      .then((allBooks) => {
        const titles = [...new Set(allBooks.map((b) => b.title).filter(Boolean))].sort();
        const authors = [...new Set(allBooks.map((b) => b.author).filter(Boolean))].sort();
        const categories = [...new Set(allBooks.map((b) => b.category).filter(Boolean))].sort();
        const topics = [...new Set(allBooks.map((b) => b.topic).filter(Boolean))].sort();
        setOptions({ titles, authors, categories, topics });
        setBooks(allBooks);
      })
      .catch((err) => {
        setMessage(err.message);
        setIsError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const request = async (book) => {
    try {
      if (book.availableCopies > 0) {
        await api("/issues/request", { method: "POST", body: { bookId: book._id } });
      } else {
        await api("/reservations", { method: "POST", body: { bookId: book._id } });
      }
      setMessage(book.availableCopies > 0 ? "Issue request submitted successfully." : "Reservation created successfully.");
      setIsError(false);
      setRequestedBookIds((prev) => new Set([...prev, book._id]));
    } catch (err) {
      setMessage(err.message);
      setIsError(true);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Book Search</h2>
        <p className="text-sm text-slate-500">Find books by title, author, category, topic, and availability.</p>
      </div>
      
      <div className="card grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_auto_auto]">
        <input className="input" placeholder="Search title, author, tag" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        
        <select className="input" value={filters.title} onChange={(e) => setFilters({ ...filters, title: e.target.value })}>
          <option value="">All Titles</option>
          {options.titles.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        
        <select className="input" value={filters.author} onChange={(e) => setFilters({ ...filters, author: e.target.value })}>
          <option value="">All Authors</option>
          {options.authors.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        
        <select className="input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {options.categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <select className="input" value={filters.topic} onChange={(e) => setFilters({ ...filters, topic: e.target.value })}>
          <option value="">All Topics</option>
          {options.topics.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
        </select>
        
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filters.available} onChange={(e) => setFilters({ ...filters, available: e.target.checked })} /> 
          Available
        </label>
        
        <button className="btn-primary" onClick={load}>Search</button>
      </div>

      {message && (
        isError ? (
          <ErrorBox message={message} />
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-850 animate-fade-in flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            {message}
          </div>
        )
      )}

      {loading ? (
        <Loading />
      ) : books.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => {
            const isRequested = requestedBookIds.has(book._id);
            const buttonText = isRequested 
              ? (book.availableCopies > 0 ? "Requested" : "Reserved") 
              : (book.availableCopies > 0 ? "Request" : "Reserve");
            
            return (
              <BookCard 
                key={book._id} 
                book={book} 
                action={
                  <button 
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-200 disabled:opacity-100 disabled:cursor-not-allowed" 
                    onClick={() => !isRequested && request(book)}
                    disabled={isRequested}
                  >
                    {isRequested ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                    {buttonText}
                  </button>
                } 
              />
            );
          })}
        </div>
      ) : (
        <Empty title="No books found" text="Try a broader keyword or clear filters." />
      )}
    </div>
  );
};

export default BookSearch;
