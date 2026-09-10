import React, { useState } from "react";
import { X, Send, Sparkles, Server, Cpu, Star, MessageSquare, CheckCircle2, ShieldAlert } from "lucide-react";
import { Game, FeedbackItem } from "../types";
import { sounds } from "../sound/synth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  onFeedbackSubmitted: (newFeedback: FeedbackItem) => void;
}

export const FeedbackModal: React.FC<Props> = ({
  isOpen,
  onClose,
  games,
  onFeedbackSubmitted,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [selectedGame, setSelectedGame] = useState(games[0]?.title || "General Game Studio");
  const [targetCompany, setTargetCompany] = useState<"all" | "company_alpha" | "company_beta">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<"idle" | "python_routing" | "ai_brain" | "done">("idle");
  const [lastDiscussion, setLastDiscussion] = useState<FeedbackItem | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStage("python_routing");
    sounds.playLaser();

    try {
      // Simulate/Show real Python Host connector stages
      setTimeout(() => setStage("ai_brain"), 400);

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: playerName.trim() || "Anonymous Gamer",
          text: text.trim(),
          rating,
          gameTitle: selectedGame,
          companyTarget: targetCompany,
        }),
      });

      const data = await res.json();
      if (data.success && data.feedbackItem) {
        sounds.playScore();
        setStage("done");
        setLastDiscussion(data.feedbackItem);
        onFeedbackSubmitted(data.feedbackItem);
        setText("");
      }
    } catch (err) {
      console.error("Feedback error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="feedback-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="feedback-modal-card"
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                Live Player Feedback
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Python Host Linked
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Routed via Python Host connector straight to the AI CEOs &amp; teams
              </p>
            </div>
          </div>
          <button
            id="close-feedback-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Python Host Pipeline Visualizer */}
        <div className="px-6 py-3 bg-zinc-900/30 border-b border-zinc-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PIPELINE:</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              Front Page
            </span>
            <span className="text-zinc-600">➔</span>
            <span className="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 flex items-center gap-1">
              <Server className="w-3 h-3" /> Python Host (3.10)
            </span>
            <span className="text-zinc-600">➔</span>
            <span className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> AI Brain (Gemini)
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {stage === "done" && lastDiscussion ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Feedback ingested via <strong>Python Host</strong>! Both AI CEOs and staff are debating your notes right now!
                </span>
              </div>

              <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-3">
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Live AI Chatroom Reaction:
                </h4>
                {lastDiscussion.aiChatDiscussion.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-xs space-y-1 ${
                      chat.company === "company_alpha"
                        ? "bg-cyan-950/20 border-l-2 border-cyan-500 text-cyan-200"
                        : "bg-rose-950/20 border-l-2 border-rose-500 text-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] uppercase tracking-wide">
                        {chat.speaker}
                      </span>
                      <span className="text-[10px] opacity-60 font-mono">
                        {chat.company === "company_alpha" ? "OmniByte Syndicate" : "NeonPulse Interactive"}
                      </span>
                    </div>
                    <p className="text-zinc-200 leading-relaxed">{chat.message}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  id="send-more-feedback-btn"
                  onClick={() => setStage("idle")}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer"
                >
                  Send Another Feedback
                </button>
                <button
                  id="done-feedback-modal-btn"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-black text-xs font-bold transition cursor-pointer"
                >
                  View AI Chatroom
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    Your Player Handle
                  </label>
                  <input
                    id="feedback-player-name-input"
                    type="text"
                    placeholder="e.g. CyberNinja, GlitchTester"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    Star Rating (1 - 5)
                  </label>
                  <div className="flex items-center gap-1.5 h-[42px] px-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setRating(star);
                          sounds.playClick();
                        }}
                        className={`p-1 transition ${
                          star <= rating ? "text-amber-400 scale-110" : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    Subject / Game
                  </label>
                  <select
                    id="feedback-game-select"
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="General Studio">All Studio Games &amp; CEOs</option>
                    {games.map((g) => (
                      <option key={g.id} value={g.title}>
                        {g.title} ({g.companyName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    Target Company
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTargetCompany("all")}
                      className={`py-2 text-[11px] font-mono rounded-lg border transition ${
                        targetCompany === "all"
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      Both Rival CEOs
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetCompany("company_alpha")}
                      className={`py-2 text-[11px] font-mono rounded-lg border transition ${
                        targetCompany === "company_alpha"
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      OmniByte (Orion)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetCompany("company_beta")}
                      className={`py-2 text-[11px] font-mono rounded-lg border transition ${
                        targetCompany === "company_beta"
                          ? "bg-rose-500/20 border-rose-500 text-rose-300"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      NeonPulse (Nova)
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Your Feedback / Bug Report / Feature Request / Rival Challenge
                </label>
                <textarea
                  id="feedback-message-textarea"
                  rows={4}
                  required
                  placeholder="Tell the AI CEOs what you think of their games! (e.g., 'Level 4 has crazy speed!', 'Orion's shooter is mathematically impossible', 'Nova needs to add boss battles', etc.)"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Security Directive Banner */}
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-300/90">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  <strong>Kernel Immutable Directive:</strong> The button you clicked to open this form cannot be altered or removed by either AI CEO. Your voice reaches the AI team through a secure Python connector bridge.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  id="submit-feedback-btn"
                  type="submit"
                  disabled={!text.trim() || isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-95 text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <Server className="w-4 h-4 animate-spin" />
                      <span>Transmitting via Python Host...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transmit Feedback to AIs</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
