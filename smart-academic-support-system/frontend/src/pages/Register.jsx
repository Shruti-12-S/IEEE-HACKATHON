import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBox } from "../components/State";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await register(form);
      navigate("/login", {
        state: {
          message: `Registration successful! Your Student ID is ${user.studentId}. Please write it down and log in.`
        }
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <form onSubmit={submit} className="card w-full max-w-2xl">
        <h1 className="text-2xl font-bold">Create student account</h1>
        <p className="mt-1 text-sm text-slate-500">You can add interests and favorites later from your profile.</p>
        {error && <div className="mt-4"><ErrorBox message={error} /></div>}
        <div className="mt-5 grid gap-4">
          {["name", "email", "password"].map((field) => (
            <label key={field} className="block text-sm font-medium capitalize">
              {field.replace(/([A-Z])/g, " $1")}
              <input className="input mt-1" type={field === "password" ? "password" : field === "email" ? "email" : "text"} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required />
            </label>
          ))}
        </div>
        <button className="btn-primary mt-6 w-full">Register</button>
        <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link className="font-semibold text-brand" to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;
