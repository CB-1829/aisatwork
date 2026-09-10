import React, { useState } from "react";
import { X, Sparkles, Wand2, Gamepad2, Layers, Cpu } from "lucide-react";
import { Company, Game } from "../types";
import { sounds } from "../sound/synth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  companies: { company_alpha: Company; company_beta: Company };
  onGameCreated: (newGame: Game) => void;
}

export const GameMakerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  companies,
  onGameCreated,
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<"company_alpha" | "company_beta">("company_alpha");
  const [promptText, setPromptText] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Fast-Paced Arcade Dodger");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const currentCompany = companies[selectedCompanyId];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    setIsGenerating(true);
    sounds.playLaser();

    try {
      const res = await fetch("/api/games/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompanyId,
          gamePrompt: promptText.trim() || `An addictive ${selectedGenre} crafted by ${currentCompany.ceo.name}'s elite AI crew`,
          genrePreference: selectedGenre,
        }),
      });

      const data = await res.json();
      if (data.success && data.game) {
        sounds.playScore();
        onGameCreated(data.game);
        onClose();
      }
    } catch (err) {
      console.error("Game generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      id="game-maker-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
    >
      <div
        id="game-maker-modal-card"
        className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                AI Studio Game Incubator
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  UNLIMITED CREATION
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Order AI CEOs &amp; their engineers to design &amp; assemble a brand new game
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          {/* Company Selector */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-2">
              Select Commissioning Studio &amp; CEO
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedCompanyId("company_alpha")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  selectedCompanyId === "company_alpha"
                    ? "bg-cyan-950/30 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/10"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="font-bold text-xs text-cyan-400">{companies.company_alpha.name}</div>
                <div className="text-[11px] text-zinc-300">CEO: {companies.company_alpha.ceo.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-1">
                  Team: {companies.company_alpha.employees.length} AIs • Algorithmic Precision
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCompanyId("company_beta")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  selectedCompanyId === "company_beta"
                    ? "bg-rose-950/30 border-rose-500 text-rose-200 shadow-md shadow-rose-500/10"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="font-bold text-xs text-rose-400">{companies.company_beta.name}</div>
                <div className="text-[11px] text-zinc-300">CEO: {companies.company_beta.ceo.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-1">
                  Team: {companies.company_beta.employees.length} AIs • Kinetic Chaos &amp; Juice
                </div>
              </button>
            </div>
          </div>

          {/* Genre Choice */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">
              Gameplay Genre / Engine Archetype
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="Fast-Paced Arcade Dodger">Fast-Paced Arcade Dodger (Reflex)</option>
              <option value="Space Defense Swarm Shooter">Space Defense Swarm Shooter (Combat)</option>
              <option value="Precision Gravity Runner">Precision Gravity Runner (Platformer)</option>
              <option value="Neural Matrix Sequence Hacking">Neural Matrix Sequence Hacking (Puzzle)</option>
              <option value="Hyper Cyber Drift">Hyper Cyber Drift (Racer)</option>
            </select>
          </div>

          {/* Game Inspiration Prompt */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">
              Theme / Creative Direction (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g., 'Make a sub-zero blizzard laser game that outperforms Orion-X', or 'An intense synthwave boss rush game with chromatic aberration'"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Staff involvement notice */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Assigned Lead AI: {currentCompany.employees[0]?.name || "Autonomous Sub-Core"}</span>
            </div>
            <span className="text-[11px] text-amber-400">
              Creativity: {currentCompany.employees[0]?.creativity || 90}%
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-generate-game-btn"
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin" />
                  <span>AIs Designing Game...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Deploy New AI Game</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
