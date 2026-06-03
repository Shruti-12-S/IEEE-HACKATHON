import { useEffect, useMemo, useState } from "react";
import { Download, Edit3, LibraryBig, PackageCheck, PackageMinus, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { api } from "../api/client";
import StatCard from "../components/StatCard";
import { Empty, ErrorBox, Loading } from "../components/State";

const blank = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  topic: "",
  totalCopies: 1,
  availableCopies: 1,
  shelfLocation: "",
  coverUrl: "",
  tags: "",
  description: ""
};

const toPayload = (form) => ({
  ...form,
  totalCopies: Number(form.totalCopies),
  availableCopies: Number(form.availableCopies),
  tags: String(form.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
});

const AdminBooks = () => {
  const [books, setBooks] = useState(null);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ q: "", category: "", topic: "", availability: "all" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.topic) params.set("topic", filters.topic);
    if (filters.availability === "available") params.set("available", "true");
    if (filters.availability === "unavailable") params.set("available", "false");
    if (filters.availability === "low") params.set("lowStock", "true");
    return params.toString();
  }, [filters]);

  const load = () =>
    Promise.all([api(`/books?${query}`), api("/books/admin/stats")]).then(([bookData, statData]) => {
      setBooks(bookData);
      setStats(statData);
    });

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [query]);

  if (!books || !stats) return <Loading label="Loading book inventory" />;

  const resetForm = () => {
    setForm(blank);
    setEditing(null);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const payload = toPayload(form);
      if (payload.availableCopies > payload.totalCopies) throw new Error("Available copies cannot exceed total copies");
      if (editing) await api(`/books/${editing}`, { method: "PUT", body: payload });
      else await api("/books", { method: "POST", body: payload });
      setMessage(editing ? "Book updated successfully." : "Book added successfully.");
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (book) => {
    setEditing(book._id);
    setForm({ ...blank, ...book, tags: book.tags?.join(", ") || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (book) => {
    setError("");
    setMessage("");
    if (!window.confirm(`Delete "${book.title}" from the library inventory?`)) return;
    try {
      await api(`/books/${book._id}`, { method: "DELETE" });
      setMessage("Book deleted successfully.");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const adjust = async (book, totalDelta, availableDelta) => {
    setError("");
    setMessage("");
    try {
      await api(`/books/${book._id}/inventory`, { method: "PATCH", body: { totalDelta, availableDelta } });
      setMessage("Inventory updated.");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Title", "Author", "ISBN", "Category", "Topic", "Total Copies", "Available Copies", "Shelf", "Rating"],
      ...books.map((book) => [book.title, book.author, book.isbn || "", book.category, book.topic, book.totalCopies, book.availableCopies, book.shelfLocation || "", book.averageRating || 0])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "library-inventory.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const categories = [...new Set(books.map((book) => book.category).filter(Boolean))];
  const topics = [...new Set(books.map((book) => book.topic).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Admin Book Management</h2>
          <p className="text-sm text-slate-500">Add, edit, delete, search, export, and manage library inventory in one place.</p>
        </div>
        <button className="btn-secondary" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Titles" value={stats.totalTitles} icon={LibraryBig} />
        <StatCard label="Total Copies" value={stats.totalCopies} icon={PackageCheck} tone="teal" />
        <StatCard label="Available" value={stats.availableCopies} icon={PackageCheck} tone="blue" />
        <StatCard label="Issued" value={stats.issuedCopies} icon={PackageMinus} tone="amber" />
        <StatCard label="Low Stock" value={stats.lowStock} icon={PackageMinus} tone="rose" />
        <StatCard label="Unavailable" value={stats.unavailable} icon={PackageMinus} tone="rose" />
      </div>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
      {error && <ErrorBox message={error} />}

      <form className="card space-y-4" onSubmit={submit}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold">{editing ? "Edit book" : "Add new book"}</h3>
          {editing && <button type="button" className="btn-secondary" onClick={resetForm}><RotateCcw className="h-4 w-4" /> Cancel edit</button>}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input" placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
          <input className="input" placeholder="ISBN" value={form.isbn || ""} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
          <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input className="input" placeholder="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required />
          <input className="input" placeholder="Shelf location" value={form.shelfLocation} onChange={(e) => setForm({ ...form, shelfLocation: e.target.value })} />
          <input className="input" min="0" type="number" placeholder="Total copies" value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: e.target.value })} />
          <input className="input" min="0" type="number" placeholder="Available copies" value={form.availableCopies} onChange={(e) => setForm({ ...form, availableCopies: e.target.value })} />
          <input className="input" placeholder="Tags, comma separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <input className="input md:col-span-2" placeholder="Cover image URL" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} />
          <button className="btn-primary"><Plus className="h-4 w-4" /> {editing ? "Update book" : "Add book"}</button>
          <textarea className="input md:col-span-3" rows="3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </form>

      <section className="card grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className="input pl-9" placeholder="Search title, author, tag, ISBN" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        </div>
        <select className="input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <select className="input" value={filters.topic} onChange={(e) => setFilters({ ...filters, topic: e.target.value })}>
          <option value="">All topics</option>
          {topics.map((topic) => <option key={topic}>{topic}</option>)}
        </select>
        <select className="input" value={filters.availability} onChange={(e) => setFilters({ ...filters, availability: e.target.value })}>
          <option value="all">All stock</option>
          <option value="available">Available</option>
          <option value="low">Low stock</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <button className="btn-secondary" onClick={() => setFilters({ q: "", category: "", topic: "", availability: "all" })}>Clear</button>
      </section>

      {books.length ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">Book</th>
                <th>Category</th>
                <th>Inventory</th>
                <th>Shelf</th>
                <th>Popularity</th>
                <th className="p-3">Quick inventory</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr className="border-t border-slate-200 align-top" key={book._id}>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <img className="h-16 w-12 rounded object-cover" src={book.coverUrl || "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=300&q=80"} alt={book.title} />
                      <div>
                        <p className="font-semibold text-slate-900">{book.title}</p>
                        <p className="text-xs text-slate-500">{book.author}</p>
                        <p className="text-xs text-slate-400">{book.isbn || "No ISBN"}</p>
                      </div>
                    </div>
                  </td>
                  <td><p>{book.category}</p><p className="text-xs text-slate-500">{book.topic}</p></td>
                  <td>
                    <span className={book.availableCopies === 0 ? "font-semibold text-rose-600" : book.availableCopies <= 2 ? "font-semibold text-amber-600" : "font-semibold text-mint"}>
                      {book.availableCopies}/{book.totalCopies}
                    </span>
                    <p className="text-xs text-slate-500">{book.availableCopies === 0 ? "Unavailable" : book.availableCopies <= 2 ? "Low stock" : "Healthy"}</p>
                  </td>
                  <td>{book.shelfLocation || "Not assigned"}</td>
                  <td><p>{book.issueCount || 0} issues</p><p className="text-xs text-slate-500">{book.averageRating || 0}/5 rating</p></td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-secondary px-3" onClick={() => adjust(book, 1, 1)}>+ Copy</button>
                      <button className="btn-secondary px-3" onClick={() => adjust(book, 0, 1)}>+ Return</button>
                      <button className="btn-secondary px-3" onClick={() => adjust(book, -1, book.availableCopies === book.totalCopies ? -1 : 0)}>- Copy</button>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-secondary" onClick={() => edit(book)}><Edit3 className="h-4 w-4" /> Edit</button>
                      <button className="btn-secondary text-rose-600" onClick={() => remove(book)}><Trash2 className="h-4 w-4" /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty title="No books match" text="Try clearing filters or add a new book above." />}
    </div>
  );
};

export default AdminBooks;
