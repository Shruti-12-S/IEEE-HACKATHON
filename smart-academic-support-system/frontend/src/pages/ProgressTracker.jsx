import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Empty, Loading } from "../components/State";
import { Check, Trophy, Target, TrendingUp, Award, ListTodo, ChevronDown, ChevronRight, BookOpen } from "lucide-react";

const ProgressTracker = () => {
  const [roadmaps, setRoadmaps] = useState(null);
  const [expandedRoadmap, setExpandedRoadmap] = useState(null);

  const load = () => api("/roadmaps/my").then((data) => {
    setRoadmaps(data);
    if (data && data.length > 0 && !expandedRoadmap) {
      setExpandedRoadmap(data[0]._id); // Expand the first roadmap by default
    }
  });

  useEffect(() => { load(); }, []);

  if (!roadmaps) return <Loading label="Loading progress" />;

  const toggleItem = async (roadmap, item) => {
    const completed = !roadmap.completedItems?.includes(item);
    const totalItems = roadmap.stages.flatMap((stage) => [...stage.goals, ...stage.projectIdeas]).length || 1;
    const current = new Set(roadmap.completedItems || []);
    if (completed) current.add(item);
    else current.delete(item);
    await api(`/roadmaps/${roadmap._id}/progress`, { 
      method: "PATCH", 
      body: { 
        item, 
        completed, 
        progress: Math.round((current.size / totalItems) * 100) 
      } 
    });
    load();
  };

  // Calculate Stat Summaries
  const totalRoadmaps = roadmaps.length;
  const completedRoadmaps = roadmaps.filter((r) => r.progress === 100).length;
  const avgProgress = totalRoadmaps 
    ? Math.round(roadmaps.reduce((acc, curr) => acc + curr.progress, 0) / totalRoadmaps) 
    : 0;

  const totalTasks = roadmaps.reduce((acc, curr) => {
    const roadmapTasks = curr.stages.flatMap((s) => [...s.goals, ...s.projectIdeas]).length;
    return acc + roadmapTasks;
  }, 0);

  const completedTasks = roadmaps.reduce((acc, curr) => {
    return acc + (curr.completedItems?.length || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Progress Tracker</h2>
        <p className="text-sm text-slate-500 font-medium">Track goals, check off resume-boosting projects, and review your skill milestones.</p>
      </div>

      {/* Stats Summary Dashboard */}
      {roadmaps.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Skills</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalRoadmaps}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Average Progress</p>
              <h3 className="text-2xl font-bold text-slate-900">{avgProgress}%</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Skills Mastered</p>
              <h3 className="text-2xl font-bold text-slate-900">{completedRoadmaps}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ListTodo className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Milestones Met</p>
              <h3 className="text-2xl font-bold text-slate-900">{completedTasks} / {totalTasks}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4">
        {roadmaps.length ? roadmaps.map((roadmap) => {
          const isExpanded = expandedRoadmap === roadmap._id;
          return (
            <div className="card overflow-hidden border border-slate-200 !p-0 transition-all duration-200" key={roadmap._id}>
              {/* Header section (collapsible trigger) */}
              <div 
                className={`flex flex-wrap sm:flex-nowrap cursor-pointer items-center justify-between p-5 gap-4 transition-colors ${
                  isExpanded ? 'bg-slate-50/50 border-b border-slate-100' : 'hover:bg-slate-50/30'
                }`}
                onClick={() => setExpandedRoadmap(isExpanded ? null : roadmap._id)}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800 truncate">{roadmap.skill}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 font-semibold">
                      via {roadmap.aiProvider}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 truncate mt-0.5">{roadmap.summary}</p>
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">{roadmap.progress}%</span>
                    <div className="mt-1 h-2 w-28 rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className="h-2 rounded-full bg-mint transition-all duration-500" 
                        style={{ width: `${roadmap.progress}%` }} 
                      />
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Collapsible details body */}
              {isExpanded && (
                <div className="p-6 bg-white space-y-6">
                  {/* Checklist stages */}
                  <div className="space-y-6">
                    {roadmap.stages.map((stage) => {
                      const stageGoalsCompleted = stage.goals.filter(g => roadmap.completedItems?.includes(g)).length;
                      const stageProjectsCompleted = stage.projectIdeas.filter(p => roadmap.completedItems?.includes(p)).length;
                      const stageTotal = stage.goals.length + stage.projectIdeas.length;
                      const stageCompleted = stageGoalsCompleted + stageProjectsCompleted;
                      const stagePercent = stageTotal ? Math.round((stageCompleted / stageTotal) * 100) : 0;

                      return (
                        <div key={stage.name} className="border border-slate-200 rounded-xl p-4 space-y-4">
                          {/* Stage Title */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <Target className="h-4.5 w-4.5 text-brand" />
                              <h4 className="font-bold text-slate-800">{stage.name} Stage</h4>
                            </div>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              {stagePercent}% complete ({stageCompleted}/{stageTotal})
                            </span>
                          </div>

                          {/* Goals Checklist */}
                          <div className="space-y-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Learning Goals</p>
                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                              {stage.goals.map((goal) => {
                                const isCompleted = roadmap.completedItems?.includes(goal);
                                return (
                                  <div 
                                    key={goal}
                                    className={`flex items-start gap-2.5 w-full p-2.5 rounded-lg border text-left transition-all duration-200 ${
                                      isCompleted 
                                        ? 'bg-emerald-50/40 border-emerald-100 text-slate-750' 
                                        : 'bg-white border-slate-200 text-slate-750'
                                    }`}
                                  >
                                    <button 
                                      onClick={() => toggleItem(roadmap, goal)}
                                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 ${
                                        isCompleted 
                                          ? 'border-emerald-500 bg-emerald-500 text-white' 
                                          : 'border-slate-300 bg-white text-transparent hover:border-slate-400'
                                      }`}
                                    >
                                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                                    </button>
                                    <span className={`text-xs break-words flex-1 min-w-0 ${isCompleted ? 'line-through text-slate-400' : 'text-slate-600 font-semibold'}`}>
                                      {goal}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Project Checklist */}
                          {stage.projectIdeas && stage.projectIdeas.length > 0 && (
                            <div className="space-y-2 pt-2">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Trophy className="h-3 w-3 text-amber-500" /> Resume projects
                              </p>
                              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                {stage.projectIdeas.map((project) => {
                                  const isCompleted = roadmap.completedItems?.includes(project);
                                  return (
                                    <div 
                                      key={project}
                                      className={`flex items-start gap-2.5 w-full p-2.5 rounded-lg border text-left transition-all duration-200 ${
                                        isCompleted 
                                          ? 'bg-emerald-50/40 border-emerald-100 text-slate-750' 
                                          : 'bg-white border-slate-200 text-slate-750'
                                      }`}
                                    >
                                      <button 
                                        onClick={() => toggleItem(roadmap, project)}
                                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 ${
                                          isCompleted 
                                            ? 'border-emerald-500 bg-emerald-500 text-white' 
                                            : 'border-slate-300 bg-white text-transparent hover:border-slate-400'
                                        }`}
                                      >
                                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                                      </button>
                                      <span className={`text-xs break-words flex-1 min-w-0 ${isCompleted ? 'line-through text-slate-400' : 'text-slate-600 font-semibold'}`}>
                                        {project}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        }) : <Empty title="No progress to track" text="Create a roadmap first." />}
      </div>
    </div>
  );
};

export default ProgressTracker;
