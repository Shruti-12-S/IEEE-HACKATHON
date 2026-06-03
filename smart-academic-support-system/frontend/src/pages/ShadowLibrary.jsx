import { useEffect, useState } from "react";
import { Library, Plus, Trash2, ArrowRight, CheckCircle2, XCircle, Clock, Search, BookOpen, RefreshCw, Send, Tag, MessageSquare, Inbox, BookMarked } from "lucide-react";
import { api } from "../api/client";
import { Empty, ErrorBox, Loading } from "../components/State";
import { useAuth } from "../context/AuthContext";

const statusTone = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
  requested: "bg-amber-50 text-amber-700 border-amber-200/50",
  borrowed: "bg-blue-50 text-blue-700 border-blue-200/50"
};

const requestStatusTone = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200/60",
  approved: "bg-blue-50 text-blue-700 border border-blue-200/60",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200/60",
  returned: "bg-green-50 text-green-700 border border-green-200/60"
};

const ShadowLibrary = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("marketplace"); // marketplace | bookshelf | incoming | outgoing
  
  // States
  const [marketplaceBooks, setMarketplaceBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Search keyword
  const [searchQuery, setSearchQuery] = useState("");

  // Request borrow modal state
  const [requestBook, setRequestBook] = useState(null);
  const [borrowMessage, setBorrowMessage] = useState("");

  // Add book form state
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState("Computer Science");
  const [newDesc, setNewDesc] = useState("");

  // Action notes
  const [actionNotes, setActionNotes] = useState({});

  const loadData = () => {
    setLoading(true);
    setError("");
    Promise.all([
      api("/p2p/books"),
      api("/p2p/my-books"),
      api("/p2p/requests/incoming"),
      api("/p2p/requests/outgoing")
    ])
      .then(([marketData, shelfData, incomingData, outgoingData]) => {
        setMarketplaceBooks(marketData);
        setMyBooks(shelfData);
        setIncomingRequests(incomingData);
        setOutgoingRequests(outgoingData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleListBook = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    try {
      const book = await api("/p2p/books", {
        method: "POST",
        body: { title: newTitle, author: newAuthor, category: newCategory, description: newDesc }
      });
      setMyBooks([book, ...myBooks]);
      setMessage(`"${newTitle}" added to your shared bookshelf successfully.`);
      setNewTitle("");
      setNewAuthor("");
      setNewDesc("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from your bookshelf?`)) return;

    try {
      await api(`/p2p/books/${bookId}`, { method: "DELETE" });
      setMyBooks(myBooks.filter(b => b._id !== bookId));
      setMessage(`"${title}" removed from your bookshelf.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendBorrowRequest = async (e) => {
    e.preventDefault();
    if (!requestBook) return;

    try {
      await api("/p2p/requests", {
        method: "POST",
        body: { bookId: requestBook._id, message: borrowMessage }
      });
      setMessage(`Borrow request for "${requestBook.title}" submitted to peer owner.`);
      setRequestBook(null);
      setBorrowMessage("");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProcessRequest = async (requestId, action) => {
    try {
      const note = actionNotes[requestId] || "";
      await api(`/p2p/requests/${requestId}/${action}`, {
        method: "PATCH",
        body: { notes: note }
      });
      setMessage(`Request action '${action}' completed successfully.`);
      setActionNotes(prev => {
        const copy = { ...prev };
        delete copy[requestId];
        return copy;
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtered books based on search keyword
  const filteredBooks = marketplaceBooks.filter(book =>
    [book.title, book.author, book.category, book.description, book.owner?.name]
      .filter(Boolean)
      .some(val => val.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <Loading label="Entering Shadow Library marketplace..." />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shadow Library</h2>
          <p className="text-sm text-slate-500 mt-1">Peer-to-Peer book lending network. Share your books and borrow course reference materials directly from peers.</p>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center">
          <button className="btn-secondary py-2 px-3.5 shadow-sm text-xs font-bold" onClick={loadData}>
            <RefreshCw className="h-4 w-4 text-slate-500" /> Refresh Data
          </button>
          
          <div className="flex rounded-xl bg-slate-200/60 p-1 border border-slate-200">
            {["marketplace", "bookshelf", "incoming", "outgoing"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold capitalize transition duration-150 ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                {tab === "bookshelf" ? "My Bookshelf" : tab === "incoming" ? `Incoming Requests (${incomingRequests.filter(r => r.status === 'pending').length})` : tab === "outgoing" ? "Outgoing Loans" : "Marketplace"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700 shadow-sm">
          {message}
        </div>
      )}
      {error && <ErrorBox message={error} />}

      {/* Tabs Content */}
      {activeTab === "marketplace" && (
        <div className="space-y-5">
          {/* Search bar */}
          <div className="card max-w-xl relative p-0 border border-slate-200/80 shadow-sm">
            <Search className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <input
              className="w-full bg-transparent pl-10 pr-4 py-3 text-sm outline-none placeholder:text-slate-400 font-medium"
              placeholder="Search marketplace books by title, author, category, or owner name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Grid list of books */}
          {filteredBooks.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBooks.map((book) => (
                <div key={book._id} className="card bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-lg transition duration-200 flex flex-col justify-between h-[250px]">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-extrabold capitalize ${statusTone[book.status] || "bg-slate-50 text-slate-500"}`}>
                        {book.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{book.category}</span>
                    </div>

                    <div className="mt-3.5 flex gap-3 items-start">
                      <div className="h-10 w-10 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2" title={book.title}>{book.title}</h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{book.author}</p>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 line-clamp-3 mt-3">{book.description || "No description provided."}</p>
                  </div>

                  <div className="border-t border-slate-50 pt-3 flex justify-between items-center mt-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Owner</p>
                      <p className="text-xs text-slate-600 font-semibold truncate max-w-[120px]">{book.owner?.name}</p>
                    </div>
                    {book.status === "available" ? (
                      <button
                        onClick={() => setRequestBook(book)}
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-xs font-bold transition"
                      >
                        Request <ArrowRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic">Unavailable</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="No books listed" text="Be the first to list personally owned books for peer borrowing!" />
          )}
        </div>
      )}

      {activeTab === "bookshelf" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Left panel: List a Book Form */}
          <div className="card space-y-4 shadow-sm border border-slate-200/80 bg-white">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">List a book to share</h3>
            <form onSubmit={handleListBook} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Book Title</label>
                <input
                  className="input mt-1.5 text-xs"
                  placeholder="e.g. Introduction to Algorithms"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Author Name</label>
                <input
                  className="input mt-1.5 text-xs"
                  placeholder="e.g. Thomas H. Cormen"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category / Genre</label>
                <select
                  className="input mt-1.5 text-xs font-bold text-slate-700"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Physics">Physics</option>
                  <option value="Self-Help">Self-Help</option>
                  <option value="Other Science">Other Science</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Condition / Description</label>
                <textarea
                  className="input mt-1.5 text-xs min-h-20 resize-none"
                  placeholder="Describe book condition, return terms, or details..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-2.5 text-xs font-bold">
                <Plus className="h-4 w-4" /> Share Book
              </button>
            </form>
          </div>

          {/* Right panel: Student owned Books list */}
          <div className="card space-y-4 shadow-soft border border-slate-200/80 bg-white">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">My Shared Books</h3>
            {myBooks.length ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/60">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th className="p-4">Book Details</th>
                      <th className="py-4">Category</th>
                      <th className="py-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myBooks.map((book) => (
                      <tr key={book._id} className="align-middle hover:bg-slate-50/20 transition">
                        <td className="p-4 flex gap-3 items-center">
                          <div className="h-9 w-9 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 leading-tight truncate max-w-[200px]">{book.title}</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">{book.author}</p>
                          </div>
                        </td>
                        <td className="py-4 text-xs font-bold text-slate-500">{book.category}</td>
                        <td className="py-4">
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-extrabold capitalize ${statusTone[book.status] || "bg-slate-50 text-slate-505"}`}>
                            {book.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteBook(book._id, book.title)}
                            disabled={book.status === "borrowed"}
                            className="text-rose-600 hover:text-rose-800 disabled:opacity-40 p-2 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty title="Your bookshelf is empty" text="List a textbook above to start building your sharing score!" />
            )}
          </div>
        </div>
      )}

      {activeTab === "incoming" && (
        <div className="card space-y-4 shadow-soft border border-slate-200/80 bg-white">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Inbox className="h-4.5 w-4.5 text-blue-600" /> Incoming Borrow Requests
          </h3>
          {incomingRequests.length ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/60">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Borrower</th>
                    <th className="py-4">Book Requested</th>
                    <th className="py-4">Request Note</th>
                    <th className="py-4">Status</th>
                    <th className="p-4 text-right">Actions & Admin Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomingRequests.map((req) => (
                    <tr key={req._id} className="align-middle hover:bg-slate-50/20 transition">
                      <td className="p-4">
                        <p className="font-semibold text-slate-800 leading-tight">{req.borrower?.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">{req.borrower?.email}</p>
                      </td>
                      <td className="py-4 font-semibold text-slate-800">{req.book?.title}</td>
                      <td className="py-4 text-xs text-slate-500 italic max-w-[200px] truncate" title={req.message}>
                        "{req.message || "No notes written."}"
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold capitalize ${requestStatusTone[req.status] || "bg-slate-100"}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-end gap-2">
                          {req.status === "pending" && (
                            <div className="w-full max-w-[240px]">
                              <input
                                type="text"
                                className="input py-1 px-2.5 text-xs placeholder:text-slate-400 w-full"
                                placeholder="Response note (optional)..."
                                value={actionNotes[req._id] || ""}
                                onChange={(e) => setActionNotes({ ...actionNotes, [req._id]: e.target.value })}
                              />
                            </div>
                          )}

                          <div className="flex gap-1.5 justify-end">
                            {req.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleProcessRequest(req._id, "approve")}
                                  className="inline-flex items-center gap-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold transition"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => handleProcessRequest(req._id, "reject")}
                                  className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 text-xs font-bold transition"
                                >
                                  <XCircle className="h-3.5 w-3.5" /> Reject
                                </button>
                              </>
                            )}

                            {req.status === "approved" && (
                              <button
                                onClick={() => handleProcessRequest(req._id, "return")}
                                className="inline-flex items-center gap-1 rounded bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 text-xs font-bold transition"
                              >
                                Fulfill Return
                              </button>
                            )}

                            {["returned", "rejected"].includes(req.status) && (
                              <span className="text-xs text-slate-400 font-medium italic">
                                {req.notes ? `"${req.notes}"` : "Completed"}
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
            <Empty title="No incoming requests" text="Requests from other students to borrow your books will appear here." />
          )}
        </div>
      )}

      {activeTab === "outgoing" && (
        <div className="card space-y-4 shadow-soft border border-slate-200/80 bg-white">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <BookMarked className="h-4.5 w-4.5 text-blue-600" /> Outgoing Borrow Logs
          </h3>
          {outgoingRequests.length ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/60">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Owner</th>
                    <th className="py-4">Book Title</th>
                    <th className="py-4">Requested On</th>
                    <th className="py-4">Status</th>
                    <th className="p-4 text-right">Actions / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outgoingRequests.map((req) => (
                    <tr key={req._id} className="align-middle hover:bg-slate-50/20 transition">
                      <td className="p-4">
                        <p className="font-semibold text-slate-800 leading-tight">{req.owner?.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">{req.owner?.email}</p>
                      </td>
                      <td className="py-4 font-semibold text-slate-800">{req.book?.title}</td>
                      <td className="py-4 text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold capitalize ${requestStatusTone[req.status] || "bg-slate-100"}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {req.status === "approved" ? (
                          <button
                            onClick={() => handleProcessRequest(req._id, "return")}
                            className="inline-flex items-center gap-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold transition"
                          >
                            Mark as Returned
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">
                            {req.notes ? `"${req.notes}"` : "Waiting for peer action"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="No outgoing requests" text="Textbooks you request from other peers will track here." />
          )}
        </div>
      )}

      {/* Borrow Request Confirmation Dialog */}
      {requestBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSendBorrowRequest} className="card max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Borrow Book Request</h3>
              <button type="button" onClick={() => setRequestBook(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Close</button>
            </div>
            
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Target Book</p>
              <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">{requestBook.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{requestBook.author}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message to owner</label>
              <textarea
                className="input mt-1.5 text-xs min-h-24 resize-none"
                placeholder="Hi, I need this book for my exams next week. I promise to return it within 7 days!"
                value={borrowMessage}
                onChange={(e) => setBorrowMessage(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setRequestBook(null)}
                className="btn-secondary text-xs font-bold px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-xs font-bold px-4 py-2"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ShadowLibrary;
