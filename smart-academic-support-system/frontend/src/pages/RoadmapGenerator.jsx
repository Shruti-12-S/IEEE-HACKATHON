import { useEffect, useState } from "react";
import { Bot, Sparkles, BookOpen, Trophy, CheckCircle2, ExternalLink, Youtube } from "lucide-react";
import { api } from "../api/client";
import { Empty, ErrorBox, Loading } from "../components/State";

const RoadmapGenerator = () => {
  const [skill, setSkill] = useState("MERN Stack");
  const [roadmaps, setRoadmaps] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const load = () => api("/roadmaps/my").then(setRoadmaps);
  
  useEffect(() => {
    load();
    api("/ai/status").then(setAiStatus).catch(() => setAiStatus({ provider: "fallback" }));
  }, []);

  const generate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/roadmaps/generate", { method: "POST", body: { skill } });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!roadmaps) return <Loading label="Loading roadmaps" />;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">AI Skill Roadmap Generator</h2>
            <p className="text-sm text-slate-500">Provider: {aiStatus?.provider || "checking"} {aiStatus?.provider === "fallback" ? "(built-in fallback active)" : "(live AI active)"}</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-brand"><Bot className="mr-1 inline h-4 w-4" /> AI enabled</span>
        </div>
        {error && <div className="mt-4"><ErrorBox message={error} /></div>}
        <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={generate}>
          <input className="input" value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Python, Data Science, Cloud Computing..." />
          <button className="btn-primary" disabled={loading}><Sparkles className="h-4 w-4" /> {loading ? "Generating..." : "Generate"}</button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Python", "MERN Stack", "Machine Learning", "Cloud Computing", "Communication Skills"].map((item) => <button className="btn-secondary px-3 py-1.5" key={item} onClick={() => setSkill(item)}>{item}</button>)}
        </div>
      </div>

      <div className="space-y-4">
        {roadmaps.length ? roadmaps.map((roadmap) => (
          <section className="card" key={roadmap._id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{roadmap.skill}</h3>
                <p className="text-sm text-slate-500">{roadmap.summary}</p>
                <p className="mt-1 text-xs text-slate-400">Provider: {roadmap.aiProvider || "fallback"}</p>
              </div>
              <span className="font-semibold text-mint">{roadmap.progress}% complete</span>
            </div>
            
            <div className="mt-5 grid gap-6 lg:grid-cols-3">
              {roadmap.stages.map((stage) => (
                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-5 shadow-sm hover:shadow-md transition-all duration-200" key={stage.name}>
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-lg font-bold text-slate-800">{stage.name} Stage</h4>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-brand">
                        {stage.name === "Beginner" ? "Weeks 1-4" : stage.name === "Intermediate" ? "Weeks 5-8" : "Weeks 9-12"}
                      </span>
                    </div>

                    {/* Goals */}
                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Goals</p>
                      <ul className="mt-2 space-y-2">
                        {stage.goals.map((g, i) => (
                          <li className="flex items-start gap-2 text-sm text-slate-600" key={i}>
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Resources */}
                    <div className="mt-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Recommended Resources</p>
                      <div className="mt-2 space-y-2">
                        {stage.resources.map((r, i) => {
                          const isYoutube = r.type?.toLowerCase().includes("youtube") || r.url?.includes("youtube.com") || r.url?.includes("youtu.be");
                          const isDoc = r.type?.toLowerCase().includes("doc") || r.url?.includes("docs.") || r.url?.includes("developer.mozilla.org");
                          return (
                            <a 
                              className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5 text-sm transition hover:border-blue-200 hover:bg-blue-50/20" 
                              href={r.url} 
                              key={`${stage.name}-res-${i}`} 
                              target="_blank" 
                              rel="noreferrer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {isYoutube ? (
                                  <Youtube className="h-4.5 w-4.5 shrink-0 text-red-600" />
                                ) : isDoc ? (
                                  <BookOpen className="h-4.5 w-4.5 shrink-0 text-blue-600" />
                                ) : (
                                  <Sparkles className="h-4.5 w-4.5 shrink-0 text-amber-500" />
                                )}
                                <span className="font-medium text-slate-700 truncate">{r.title}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 text-[11px] font-semibold text-slate-400">
                                <span>{r.type || "Link"}</span>
                                <ExternalLink className="h-3 w-3" />
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Project Ideas */}
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" /> Resume-Boosting Projects
                    </p>
                    <div className="space-y-2.5">
                      {stage.projectIdeas.map((p, i) => (
                        <div className="rounded-lg bg-white border border-slate-100 p-3 text-xs text-slate-600 shadow-sm" key={i}>
                          <p className="font-semibold text-slate-800 mb-1">Project #{i + 1}</p>
                          <p className="leading-relaxed">{p}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )) : <Empty title="No roadmaps yet" text="Generate one to start tracking a skill." />}
      </div>
    </div>
  );
};

export default RoadmapGenerator;
