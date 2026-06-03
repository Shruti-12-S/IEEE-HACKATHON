import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import BookCard from "../components/BookCard";
import { Empty, Loading } from "../components/State";
import { Sparkles, BookOpen, User, Tags, Layers, CheckCircle2, XCircle, X, Award } from "lucide-react";

const Recommendations = () => {
  const [data, setData] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadRecommendations = () => api("/recommendations/books").then(setData);

  useEffect(() => {
    loadRecommendations();
  }, []);

  if (!data) return <Loading label="Analyzing your library profile & generating recommendations" />;

  const requestBook = async (book) => {
    setSuccessMessage("");
    setErrorMessage("");
    try {
      if (book.availableCopies > 0) {
        await api("/issues/request", { method: "POST", body: { bookId: book._id } });
        setSuccessMessage(`Success! A request for "${book.title}" has been submitted for approval.`);
      } else {
        await api("/reservations", { method: "POST", body: { bookId: book._id } });
        setSuccessMessage(`Success! You have reserved "${book.title}". You will be notified when it becomes available.`);
      }
      loadRecommendations();
    } catch (err) {
      setErrorMessage(err.message || "Failed to process request. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Personalized Recommendations</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tailored suggestions computed from your profile interests and reading behavior.
          </p>
        </div>
        <Link className="btn-secondary" to="/profile">
          Refine Interests
        </Link>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-500 hover:text-emerald-700">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <p className="text-sm font-semibold">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage("")} className="text-rose-500 hover:text-rose-700">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      {/* AI Advising / Insight Banner */}
      {data.aiInsight && (
        <div className="card overflow-hidden !p-0 border border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 shadow-sm">
          <div className="flex flex-col md:flex-row items-stretch">
            {/* Sidebar highlights */}
            <div className="bg-brand w-2 md:w-3 shrink-0" />
            <div className="p-5 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand">
                  AI Academic Advisor Insight ({data.aiProvider})
                </span>
              </div>
              <p className="text-sm italic text-slate-700 leading-relaxed font-medium">
                "{data.aiInsight}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reading Profile Analysis */}
      {data.readingPatterns && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Reading Profile Analysis</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card flex items-center gap-4 border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Books Read</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{data.readingPatterns.booksReadOrIssued}</p>
              </div>
            </div>

            <div className="card flex items-center gap-4 border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Tags className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Top Category</p>
                <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                  {data.readingPatterns.topCategories?.join(", ") || "Building Profile"}
                </p>
              </div>
            </div>

            <div className="card flex items-center gap-4 border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Layers className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Top Topics</p>
                <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                  {data.readingPatterns.topTopics?.join(", ") || "Building Profile"}
                </p>
              </div>
            </div>

            <div className="card flex items-center gap-4 border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <User className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Preferred Authors</p>
                <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                  {data.readingPatterns.topAuthors?.join(", ") || "Building Profile"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Books Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-800">Recommended for Your Courses & Studies</h3>
        </div>

        {data.recommendations?.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.recommendations.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                action={
                  <button
                    className="btn-primary flex-1"
                    onClick={() => requestBook(book)}
                  >
                    {book.availableCopies > 0 ? "Request Issue" : "Reserve"}
                  </button>
                }
              />
            ))}
          </div>
        ) : (
          <Empty
            title="No recommendations found"
            text="Add your interests in the profile section or borrow books from search to build recommendations."
          />
        )}
      </div>
    </div>
  );
};

export default Recommendations;
