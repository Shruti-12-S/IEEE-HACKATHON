import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { ErrorBox } from "../components/State";
import { Mail, KeyRound, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", studentId: "", newPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api("/auth/forgot-password", {
        method: "POST",
        body: {
          email: form.email.trim(),
          studentId: form.studentId.trim(),
          newPassword: form.newPassword
        }
      });
      setSuccess(res.message || "Password reset successful!");
      setForm({ email: "", studentId: "", newPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <div className="card w-full max-w-md shadow-xl border border-slate-100 bg-white rounded-2xl p-8">
        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Password Reset</h1>
            <p className="mt-3 text-sm text-slate-600">{success}</p>
            <button
              onClick={() => navigate("/login")}
              className="btn-primary mt-8 w-full flex items-center justify-center gap-2 py-2.5"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
                <p className="text-xs text-slate-500 mt-0.5">Verify your details to set a new password</p>
              </div>
            </div>

            {error && <div className="mt-5"><ErrorBox message={error} /></div>}

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    className="input pl-10"
                    placeholder="student@sass.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Student ID</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <ShieldAlert className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="e.g., STU1001"
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">New Password</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    className="input pl-10"
                    placeholder="At least 6 characters"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-6 w-full py-2.5 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Update Password"}
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              Remembered your password?{" "}
              <Link className="font-semibold text-brand hover:underline" to="/login">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
