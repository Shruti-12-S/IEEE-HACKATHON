import { useState } from "react";
import { ArrowRight, BookOpen, Sparkles, Bot, LibraryBig, ShieldCheck, Target, BarChart3, Star, Compass, Terminal, Code, Cpu, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBox } from "../components/State";

const Landing = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-50/30 text-slate-800 selection:bg-blue-600 selection:text-white overflow-hidden relative">
      {/* Decorative radial gradients for glow effects */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[25%] right-[-10%] h-[700px] w-[700px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[15%] h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 font-extrabold text-lg text-slate-900">
            <div className="rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 text-white shadow-lg shadow-blue-500/25">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
              Smart Academic Support
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors" to="/login">
              Sign In
            </Link>
            <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition duration-200" to="/register">
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-50/50 px-4 py-1.5 text-xs font-bold text-blue-700 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-500" /> Built for University Innovation
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Unified Academic <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600">
                Support & Library Hub
              </span>
            </h1>

            <p className="max-w-xl text-base text-slate-650 leading-relaxed font-medium">
              An all-in-one platform fusing smart library workflows, AI-assisted skill roadmaps with curated resources, personalized book recommendations, and progress analytics.
            </p>

            {error && <div className="max-w-md"><ErrorBox message={error} /></div>}

            {/* Access Portals */}
            <div className="max-w-xl rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-soft space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Access Portals</h3>
                <p className="text-xs text-slate-500 mt-1">Select your portal to log in and access your workspace.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => navigate("/login", { state: { prefill: "student" } })}
                  className="group relative flex items-center justify-between rounded-xl border border-blue-500/10 bg-blue-50/40 p-4 text-left transition-all hover:border-blue-500/30 hover:bg-blue-50/70 hover:shadow-md hover:shadow-blue-500/5 active:scale-95 duration-200"
                >
                  <div>
                    <span className="text-xs font-bold text-blue-600">Student Login</span>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">Access roadmaps & co-learning</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                <button
                  onClick={() => navigate("/login", { state: { prefill: "admin" } })}
                  className="group relative flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-50/40 p-4 text-left transition-all hover:border-emerald-500/30 hover:bg-emerald-50/70 hover:shadow-md hover:shadow-emerald-500/5 active:scale-95 duration-200"
                >
                  <div>
                    <span className="text-xs font-bold text-emerald-600">Admin Login</span>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">Manage library & view reports</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Screen Preview Container (Live CSS Mockup) */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-400 opacity-15 blur-2xl" />
            <div className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xl backdrop-blur-sm">
              {/* Window header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-[10px] text-slate-400 font-mono w-48 justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  sass-portal.edu/student
                </div>
                <div className="w-12" />
              </div>

              {/* Mock Dashboard Layout */}
              <div className="grid grid-cols-[85px_1fr] gap-4 min-h-[300px]">
                {/* Mock Sidebar */}
                <div className="border-r border-slate-100 pr-3 space-y-4">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-blue-600/10" />
                    <div className="h-3 w-[85%] rounded bg-slate-100" />
                    <div className="h-3 w-[90%] rounded bg-slate-100" />
                    <div className="h-3 w-[70%] rounded bg-slate-100" />
                  </div>
                  <div className="pt-8 space-y-2">
                    <div className="h-2 w-full rounded bg-slate-100" />
                    <div className="h-2 w-[60%] rounded bg-slate-100" />
                  </div>
                </div>

                {/* Mock Main Panel */}
                <div className="space-y-4">
                  {/* Welcome Banner */}
                  <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3.5 text-white shadow-md">
                    <div className="text-[9px] font-bold tracking-wider uppercase opacity-95">STUDENT INSIGHTS</div>
                    <div className="text-sm font-bold mt-0.5">Welcome back, Shruti! 👋</div>
                    <div className="text-[10px] opacity-85 mt-1">Your next AI roadmap milestone is due in 2 days.</div>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 hover:shadow-sm transition duration-200">
                      <div className="text-[9px] text-slate-400 font-bold uppercase">Active Roadmap</div>
                      <div className="text-[11px] font-bold text-slate-800 mt-0.5">MERN Full Stack</div>
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full w-[65%] rounded-full bg-blue-600" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-500">65%</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 hover:shadow-sm transition duration-200">
                      <div className="text-[9px] text-slate-400 font-bold uppercase">Library Status</div>
                      <div className="text-[11px] font-bold text-slate-800 mt-0.5">2 Books Issued</div>
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
                          <span className="h-1 w-1 rounded-full bg-amber-500" /> Overdue in 3d
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Assistant Chat Preview */}
                  <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm space-y-2 hover:shadow-md transition duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="rounded-md bg-blue-50 p-1 text-blue-600">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">AI Coach Assistant</span>
                      </div>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-relaxed italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "I recommend watching the YouTube tutorial on React Hooks to complete your resume project."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="border-t border-slate-200/80 bg-white/50 py-20 relative">
        <div className="mx-auto max-w-6xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <Award className="h-3.5 w-3.5" /> System Capabilities
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Designed for Academic Excellence
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              Engineered with modern APIs, robust authorization layers, and automated fallback logic.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Library management */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-blue-500/35 hover:shadow-lg hover:shadow-blue-500/5 transition duration-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition duration-300">
                <LibraryBig className="h-5.5 w-5.5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 text-base">Smart Library</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed font-medium">
                Full catalog search by tags. Request issue approvals, renew books, manage reservations with waitlists, and receive overdue alerts.
              </p>
            </div>

            {/* AI Roadmaps */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-indigo-500/35 hover:shadow-lg hover:shadow-indigo-500/5 transition duration-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 group-hover:scale-110 transition duration-300">
                <Target className="h-5.5 w-5.5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 text-base">AI Roadmaps</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed font-medium">
                Generates 12-week study schedules with official docs, real YouTube playlists, and resume-boosting project suggestions.
              </p>
            </div>

            {/* AI Chat assistant */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-pink-500/35 hover:shadow-lg hover:shadow-pink-500/5 transition duration-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600 group-hover:scale-110 transition duration-300">
                <Bot className="h-5.5 w-5.5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 text-base">AI Coach Assistant</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed font-medium">
                Always-on chatbot widget for academic advice. Breaks down complex queries and suggests real library resources.
              </p>
            </div>

            {/* Personalized Recommendations */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-emerald-500/35 hover:shadow-lg hover:shadow-emerald-500/5 transition duration-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition duration-300">
                <Compass className="h-5.5 w-5.5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 text-base">Profile Matching</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed font-medium">
                Analyzes student reading patterns, favorite categories, and authors to serve custom recommendations with AI explanatory insight.
              </p>
            </div>

            {/* Admin control panel */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-amber-500/35 hover:shadow-lg hover:shadow-amber-500/5 transition duration-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 group-hover:scale-110 transition duration-300">
                <ShieldCheck className="h-5.5 w-5.5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 text-base">Admin Dashboard</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed font-medium">
                Complete inventory management, issue approvals/rejections, book returns, and system health status.
              </p>
            </div>

            {/* Analytics reports */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-violet-500/35 hover:shadow-lg hover:shadow-violet-500/5 transition duration-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 group-hover:scale-110 transition duration-300">
                <BarChart3 className="h-5.5 w-5.5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 text-base">Recharts Analytics</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed font-medium">
                Renders interactive administrative graphs showing popular book demands, active student registrations, and overdue statistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Details */}
      <section className="bg-slate-100/50 py-16 border-t border-slate-200/60">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl bg-white p-8 border border-slate-200/80 shadow-soft">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Modern Technology Stack</h3>
              <p className="text-xs text-slate-500 font-medium max-w-md">
                Engineered with React, Node.js, Express, MongoDB Atlas, TailwindCSS, Lucide Icons, and Gemini Pro API.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
                <Code className="h-3.5 w-3.5 text-blue-600" /> React 18
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
                <Terminal className="h-3.5 w-3.5 text-emerald-600" /> Node/Express
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
                <Cpu className="h-3.5 w-3.5 text-indigo-600" /> Gemini Pro AI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 py-10 border-t border-slate-200/60 text-center text-xs text-slate-400 font-bold">
        <p>© 2026 Smart Academic Support System. Engineered for Innovation.</p>
      </footer>
    </div>
  );
};

export default Landing;
