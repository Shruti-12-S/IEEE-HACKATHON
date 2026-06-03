import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBox } from "../components/State";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialCredentials = () => {
    const prefill = location.state?.prefill;
    if (prefill === "student") {
      return { email: "student@sass.edu", password: "student123" };
    }
    if (prefill === "admin") {
      return { email: "admin@sass.edu", password: "admin123" };
    }
    return { email: "", password: "" };
  };

  const [form, setForm] = useState(getInitialCredentials);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(location.state?.message || "");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin" : "/student");
    } catch (err) {
      setError(err.message);
    }
  };

  const isAdmin = location.state?.prefill === "admin" || form.email.toLowerCase().includes("admin");

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mt-1 text-sm text-slate-500">Use demo credentials or your registered account.</p>
        {successMsg && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {successMsg}
          </div>
        )}
        {error && <div className="mt-4"><ErrorBox message={error} /></div>}
        <label className="mt-5 block text-sm font-medium">Email<input className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="mt-4 block text-sm font-medium">
          <div className="flex justify-between items-center">
            <span>Password</span>
            {!isAdmin && (
              <Link className="text-xs font-semibold text-brand hover:underline" to="/forgot-password">Forgot Password?</Link>
            )}
          </div>
          <input className="input mt-1" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button className="btn-primary mt-6 w-full">Login</button>
        {!isAdmin && (
          <p className="mt-5 text-center text-sm text-slate-500">No account? <Link className="font-semibold text-brand" to="/register">Register</Link></p>
        )}
      </form>
    </div>
  );
};

export default Login;
