import { useEffect, useState, useRef } from "react";
import { Users, Send, Plus, ArrowRight, MessageSquare, ThumbsUp, ThumbsDown, Link2, ExternalLink, RefreshCw, BookOpen, Star, Sparkles, Award, GraduationCap, Flame, ArrowUpRight } from "lucide-react";
import { api } from "../api/client";
import { Empty, ErrorBox, Loading } from "../components/State";
import { useAuth } from "../context/AuthContext";

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
  if (!name) return "bg-slate-100 text-slate-600";
  const colors = [
    "bg-blue-50 text-blue-700 border border-blue-200/40",
    "bg-indigo-50 text-indigo-700 border border-indigo-200/40",
    "bg-emerald-50 text-emerald-700 border border-emerald-200/40",
    "bg-pink-50 text-pink-700 border border-pink-200/40",
    "bg-amber-50 text-amber-700 border border-amber-200/40",
    "bg-purple-50 text-purple-700 border border-purple-200/40",
    "bg-cyan-50 text-cyan-700 border border-cyan-200/40"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const P2PStudyHub = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("circles"); // circles | resources
  const [roadmaps, setRoadmaps] = useState([]);
  const [peers, setPeers] = useState([]);
  const [circles, setCircles] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create circle form state
  const [newCircleName, setNewCircleName] = useState("");
  const [newCircleDesc, setNewCircleDesc] = useState("");
  const [newCircleSkill, setNewCircleSkill] = useState("");

  // Resource sharing state
  const [selectedSkill, setSelectedSkill] = useState("");
  const [resources, setResources] = useState([]);
  const [shareTitle, setShareTitle] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [shareType, setShareType] = useState("video");

  const chatEndRef = useRef(null);

  // Load baseline data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api("/roadmaps/my"),
      api("/study-circles/peers"),
      api("/study-circles")
    ])
      .then(([roadmapData, peerData, circleData]) => {
        setRoadmaps(roadmapData);
        setPeers(peerData);
        setCircles(circleData);
        if (roadmapData.length > 0) {
          setNewCircleSkill(roadmapData[0].skill);
          setSelectedSkill(roadmapData[0].skill);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Poll chat messages for active study circle
  useEffect(() => {
    if (!selectedCircle) return;

    const fetchMessages = () => {
      api(`/study-circles/${selectedCircle._id}/messages`)
        .then(setChatMessages)
        .catch(console.error);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3500);
    return () => clearInterval(interval);
  }, [selectedCircle]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Fetch resources when selected skill changes
  useEffect(() => {
    if (!selectedSkill) return;
    api(`/study-circles/resources/${encodeURIComponent(selectedSkill)}`)
      .then(setResources)
      .catch(console.error);
  }, [selectedSkill]);

  const handleCreateCircle = async (e) => {
    e.preventDefault();
    if (!newCircleName.trim() || !newCircleSkill) return;

    try {
      const circle = await api("/study-circles", {
        method: "POST",
        body: { name: newCircleName, description: newCircleDesc, skill: newCircleSkill }
      });
      setCircles([circle, ...circles]);
      setSelectedCircle(circle);
      setNewCircleName("");
      setNewCircleDesc("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinCircle = async (circleId) => {
    try {
      const circle = await api(`/study-circles/${circleId}/join`, { method: "POST" });
      setCircles(circles.map(c => c._id === circleId ? circle : c));
      setSelectedCircle(circle);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedCircle) return;

    try {
      const text = chatInput;
      setChatInput("");
      const updatedMessages = await api(`/study-circles/${selectedCircle._id}/messages`, {
        method: "POST",
        body: { text }
      });
      setChatMessages(updatedMessages);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShareResource = async (e) => {
    e.preventDefault();
    if (!shareTitle.trim() || !shareUrl.trim() || !selectedSkill) return;

    try {
      const resource = await api("/study-circles/resources", {
        method: "POST",
        body: { title: shareTitle, url: shareUrl, type: shareType, skill: selectedSkill }
      });
      setResources([resource, ...resources]);
      setShareTitle("");
      setShareUrl("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVote = async (resourceId, type) => {
    try {
      const data = await api(`/study-circles/resources/${resourceId}/vote`, {
        method: "POST",
        body: { vote: type }
      });
      setResources(resources.map(r => r._id === resourceId ? { ...r, score: data.score, userVote: data.userVote } : r));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loading label="Connecting to study hub..." />;

  return (
    <div className="space-y-6">
      {/* Premium Dashboard Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-650 to-indigo-700 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] h-48 w-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-5%] h-36 w-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              Co-Learning Space
            </span>
            <h2 className="text-2xl font-extrabold sm:text-3xl">P2P Study Hub & Resource Wall</h2>
            <p className="max-w-xl text-sm text-blue-100 leading-relaxed">
              Connect with classmates pursuing matching milestones, collaborate on circles message boards, and share crowdsourced learning material.
            </p>
          </div>

          <div className="flex shrink-0 rounded-xl bg-black/15 p-1 border border-white/10 self-start md:self-auto backdrop-blur-md">
            <button
              onClick={() => setActiveTab("circles")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition duration-200 ${activeTab === "circles" ? "bg-white text-blue-600 shadow" : "text-blue-100 hover:text-white"}`}
            >
              Study Circles & Peers
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition duration-200 ${activeTab === "resources" ? "bg-white text-blue-600 shadow" : "text-blue-100 hover:text-white"}`}
            >
              Community Resources
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {activeTab === "circles" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Left panel: suggested matching connections & active circles list */}
          <div className="space-y-6">
            {/* Suggested Connections Match Card */}
            <div className="card space-y-4 shadow-sm border border-slate-200/80 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-500 animate-pulse" /> Suggested Peer Matches
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">Proximity matching</span>
              </div>

              {peers.length ? (
                <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                  {peers.map((peer, idx) => (
                    <div key={idx} className="group flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/30 hover:border-blue-200 hover:bg-blue-50/10 hover:shadow-sm transition duration-200">
                      <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${getAvatarColor(peer.student?.name)}`}>
                        {getInitials(peer.student?.name)}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-slate-800 text-xs truncate leading-none">{peer.student?.name}</p>
                          <span className="inline-flex rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700 border border-blue-200/20 shrink-0">
                            {peer.similarity}% Match
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold truncate uppercase">{peer.skill}</p>

                        <div className="flex items-center gap-2">
                          <div className="h-1 flex-1 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${peer.progress}%` }} />
                          </div>
                          <span className="text-[9.5px] font-bold text-slate-500 shrink-0">{peer.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-slate-400 font-bold italic">Generate your AI study roadmaps to enable matching metrics!</p>
                </div>
              )}
            </div>

            {/* Create Study Circle Panel */}
            <div className="card space-y-4 shadow-sm border border-slate-200/80 bg-white">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Start Study Circle</h3>
              </div>

              <form onSubmit={handleCreateCircle} className="space-y-3">
                <div>
                  <input
                    className="input text-xs"
                    placeholder="Circle Name (e.g. Node API Builders)"
                    value={newCircleName}
                    onChange={(e) => setNewCircleName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <textarea
                    className="input text-xs min-h-16 resize-none"
                    placeholder="Short description / co-learning goal..."
                    value={newCircleDesc}
                    onChange={(e) => setNewCircleDesc(e.target.value)}
                  />
                </div>
                <div>
                  <select
                    className="input text-xs font-bold text-slate-700"
                    value={newCircleSkill}
                    onChange={(e) => setNewCircleSkill(e.target.value)}
                    required
                  >
                    {roadmaps.map(r => (
                      <option key={r._id} value={r.skill}>{r.skill}</option>
                    ))}
                    {roadmaps.length === 0 && (
                      <option value="">No Active Roadmaps</option>
                    )}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={roadmaps.length === 0}
                  className="btn-primary w-full py-2 text-xs font-bold hover:shadow-lg hover:shadow-blue-500/10 transition duration-200"
                >
                  <Plus className="h-4 w-4" /> Launch Circle
                </button>
              </form>
            </div>

            {/* Active Circles Card */}
            <div className="card space-y-3 shadow-sm border border-slate-200/80 bg-white">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Active Study Circles</h3>

              {circles.length ? (
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {circles.map((circle) => {
                    const isMember = circle.members.some(m => m._id === user._id);
                    const isSelected = selectedCircle?._id === circle._id;
                    return (
                      <div
                        key={circle._id}
                        onClick={() => setSelectedCircle(circle)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-2 duration-200 ${isSelected
                            ? "bg-blue-50/60 border-blue-300 shadow-md shadow-blue-500/5 ring-1 ring-blue-300/35"
                            : "bg-white border-slate-200/80 hover:bg-slate-50/50 hover:border-slate-350"
                          }`}
                      >
                        <div className="flex justify-between items-start gap-1.5">
                          <h4 className="font-extrabold text-slate-800 text-xs leading-tight">{circle.name}</h4>
                          <span className="text-[8.5px] font-extrabold uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 shrink-0">
                            {circle.skill}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium line-clamp-2">{circle.description || "No description provided."}</p>
                        <div className="flex justify-between items-center mt-1 border-t border-slate-50 pt-2">
                          <span className="text-[10px] font-extrabold text-slate-450">{circle.members.length} peers collaborating</span>
                          {!isMember && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleJoinCircle(circle._id); }}
                              className="text-[10px] font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2.5 py-1 transition"
                            >
                              Join Group
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-xs text-slate-400 font-bold italic">No circles started. Launch a circle to invite peers!</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Area: Circle Chat Panel */}
          <div className="card p-0 flex flex-col justify-between min-h-[520px] border-slate-200/80 shadow-soft bg-white relative">
            {selectedCircle ? (
              <>
                {/* Active Circle Header */}
                <div className="border-b border-slate-100 p-4.5 flex items-center justify-between bg-slate-50/40 rounded-t-2xl">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      {selectedCircle.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-semibold">Goal: {selectedCircle.description || "Milestone progress sharing."}</p>
                  </div>

                  {/* Facepile / Member avatars */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2.5 overflow-hidden">
                      {selectedCircle.members.slice(0, 4).map((member, i) => (
                        <div
                          key={i}
                          className={`inline-block h-6.5 w-6.5 rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white select-none shrink-0 ${getAvatarColor(member.name)}`}
                          title={`${member.name} (${member.email})`}
                        >
                          {getInitials(member.name)}
                        </div>
                      ))}
                      {selectedCircle.members.length > 4 && (
                        <span className="flex items-center justify-center h-6.5 w-6.5 rounded-full bg-slate-100 border-2 border-white text-[9px] font-bold text-slate-500 shrink-0">
                          +{selectedCircle.members.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message list window */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[380px] bg-slate-50/20">
                  {chatMessages.length ? (
                    chatMessages.map((msg, idx) => {
                      const isMe = msg.sender?._id === user._id;
                      return (
                        <div key={idx} className={`flex gap-2.5 items-start ${isMe ? "justify-end" : "justify-start"}`}>
                          {!isMe && (
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 select-none ${getAvatarColor(msg.sender?.name)}`}>
                              {getInitials(msg.sender?.name)}
                            </div>
                          )}

                          <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm space-y-1 ${isMe
                              ? "bg-blue-600 text-white rounded-br-none shadow-blue-500/5"
                              : "bg-white text-slate-800 rounded-bl-none border border-slate-200/50"
                            }`}>
                            {!isMe && (
                              <p className="text-[9.5px] font-extrabold text-slate-450 leading-none">{msg.sender?.name}</p>
                            )}
                            <p className="text-xs leading-relaxed break-words font-medium">{msg.text}</p>
                            <span className={`block text-[8px] text-right font-semibold opacity-60 ${isMe ? "text-slate-200" : "text-slate-400"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                      <MessageSquare className="h-8 w-8 text-blue-500/40 animate-bounce" />
                      <h4 className="text-xs font-extrabold text-slate-700">Collaborative Board is Empty</h4>
                      <p className="text-[11px] font-medium text-slate-400">Ask a question or post code tips to begin co-learning!</p>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Form Chat input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white rounded-b-2xl flex gap-2">
                  <input
                    className="input flex-1 py-2 text-xs font-medium border-slate-200 focus:border-blue-500"
                    placeholder="Post a tip, drop documentation link, or coordinate study sessions..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 px-4 py-2 transition shadow-sm hover:shadow"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-slate-400 space-y-4">
                <div className="rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 p-5 text-blue-600">
                  <Users className="h-10 w-10 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-extrabold text-slate-800 text-sm">Unlock Study Circles Collaboration</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto font-semibold leading-relaxed">
                    Select a Study Circle in the sidebar panel or launch a new circle to coordinate milestones.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Reddit-style Community Resources Tab */
        <div className="grid gap-6 lg:grid-cols-[1fr_2.2fr]">
          {/* Left panel: sharing form */}
          <div className="space-y-6">
            {/* Share Link Form */}
            <div className="card space-y-4 shadow-sm border border-slate-200/80 bg-white">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-650">
                  <Link2 className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Crowdsource a Link</h3>
              </div>

              <form onSubmit={handleShareResource} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Track / Skill</label>
                  <select
                    className="input text-xs font-bold text-slate-700 mt-1.5"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    required
                  >
                    {roadmaps.map(r => (
                      <option key={r._id} value={r.skill}>{r.skill}</option>
                    ))}
                    {roadmaps.length === 0 && (
                      <option value="">No Active Roadmaps</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resource Title</label>
                  <input
                    className="input text-xs mt-1.5"
                    placeholder="e.g. Free Interactive CSS Flexbox Game"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">URL Link</label>
                  <input
                    className="input text-xs mt-1.5"
                    type="url"
                    placeholder="https://flexboxfroggy.com"
                    value={shareUrl}
                    onChange={(e) => setShareUrl(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</label>
                  <select
                    className="input text-xs font-bold text-slate-700 mt-1.5"
                    value={shareType}
                    onChange={(e) => setShareType(e.target.value)}
                  >
                    <option value="video">YouTube / Video Playlists</option>
                    <option value="documentation">Official Docs / Cheat Sheets</option>
                    <option value="article">Blog Posts / Walkthroughs</option>
                    <option value="other">Other reference course</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!selectedSkill}
                  className="btn-primary w-full py-2.5 text-xs font-bold hover:shadow-lg hover:shadow-indigo-500/10 transition duration-200"
                >
                  <Plus className="h-4 w-4" /> Submit Resource
                </button>
              </form>
            </div>
          </div>

          {/* Right panel: Resource links lists */}
          <div className="card space-y-4 shadow-soft border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" /> Crowdsourced Resources List
              </h3>
              <select
                className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200/20 focus:outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                {roadmaps.map(r => (
                  <option key={r._id} value={r.skill}>{r.skill}</option>
                ))}
                {roadmaps.length === 0 && (
                  <option value="">No Active Roadmaps</option>
                )}
              </select>
            </div>

            {resources.length ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {resources.map((res) => {
                  const score = res.score ?? 0;
                  const vote = res.userVote;
                  return (
                    <div key={res._id} className="flex items-start gap-4 rounded-2xl border border-slate-200/60 p-4 bg-white hover:border-blue-200 hover:shadow-md transition duration-200">
                      {/* Reddit-style vote panel */}
                      <div className="flex flex-col items-center gap-1 shrink-0 bg-slate-50/50 border border-slate-200/60 rounded-xl p-1 w-11 shadow-sm select-none">
                        <button
                          onClick={() => handleVote(res._id, vote === "up" ? "clear" : "up")}
                          className={`rounded p-1 transition ${vote === "up"
                              ? "text-blue-600 bg-blue-50 shadow-sm border border-blue-100"
                              : "text-slate-400 hover:bg-slate-200/50"
                            }`}
                          title="Upvote"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <span className={`text-[11px] font-extrabold ${score > 0 ? "text-blue-600" : score < 0 ? "text-rose-600" : "text-slate-500"}`}>
                          {score}
                        </span>
                        <button
                          onClick={() => handleVote(res._id, vote === "down" ? "clear" : "down")}
                          className={`rounded p-1 transition ${vote === "down"
                              ? "text-rose-600 bg-rose-50 shadow-sm border border-rose-100"
                              : "text-slate-400 hover:bg-slate-200/50"
                            }`}
                          title="Downvote"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Content Details */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase border ${res.type === "video" ? "bg-red-50 text-red-700 border-red-200/30" :
                              res.type === "documentation" ? "bg-purple-50 text-purple-700 border-purple-200/30" :
                                res.type === "article" ? "bg-emerald-50 text-emerald-700 border-emerald-200/30" :
                                  "bg-slate-50 text-slate-600 border-slate-200"
                            }`}>
                            {res.type === "documentation" ? "Documentation" : res.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            Shared by <span className="text-slate-600">{res.submittedBy?.name || "Peer"}</span>
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{res.title}</h4>

                        <div className="pt-1 flex items-center">
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-slate-50 hover:bg-blue-50/50 text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200/50 rounded-lg px-2.5 py-1 text-xs font-bold transition duration-200"
                          >
                            <Link2 className="h-3.5 w-3.5" /> Launch Resource <ExternalLink className="h-3 w-3 opacity-60" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty
                title="No Shared Resources Yet"
                text="Submit documentation pages, YouTube walkthroughs, or guides to begin building matches for this skill track!"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default P2PStudyHub;
