import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ErrorBox } from "../components/State";

const join = (value) => (Array.isArray(value) ? value.join(", ") : "");
const split = (value) => String(value || "").split(",").map((item) => item.trim()).filter(Boolean);

const StudentProfile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    department: user?.department || "",
    interests: join(user?.interests),
    favoriteGenres: join(user?.favoriteGenres),
    favoriteAuthors: join(user?.favoriteAuthors)
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await updateProfile({
        name: form.name,
        department: form.department,
        interests: split(form.interests),
        favoriteGenres: split(form.favoriteGenres),
        favoriteAuthors: split(form.favoriteAuthors)
      });
      setMessage("Profile updated. Recommendations will use your latest interests.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="card">
        <h2 className="text-2xl font-bold">Student Profile</h2>
        <p className="mt-2 text-sm text-slate-500">Keep your interests accurate for better book recommendations and learning support.</p>
        <div className="mt-5 space-y-3 text-sm">
          <p><b>Student ID:</b> {user?.studentId || "Not assigned"}</p>
          <p><b>Email:</b> {user?.email}</p>
          <p><b>Role:</b> {user?.role}</p>
        </div>
      </section>
      <form className="card space-y-4" onSubmit={submit}>
        <h3 className="font-bold">Edit preferences</h3>
        {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <ErrorBox message={error} />}
        <label className="block text-sm font-medium">Name<input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="block text-sm font-medium">Department<input className="input mt-1" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></label>
        <label className="block text-sm font-medium">Interests<input className="input mt-1" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="AI Engineering, Python, Cloud" /></label>
        <label className="block text-sm font-medium">Favorite genres<input className="input mt-1" value={form.favoriteGenres} onChange={(e) => setForm({ ...form, favoriteGenres: e.target.value })} /></label>
        <label className="block text-sm font-medium">Favorite authors<input className="input mt-1" value={form.favoriteAuthors} onChange={(e) => setForm({ ...form, favoriteAuthors: e.target.value })} /></label>
        <button className="btn-primary">Save profile</button>
      </form>
    </div>
  );
};

export default StudentProfile;
