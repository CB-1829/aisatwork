import React, { useState } from "react";
import { UserPlus, UserMinus, Swords, Sparkles, DollarSign, Brain, Palette, Flame, ShieldAlert, Check, AlertCircle } from "lucide-react";
import { Company, AiEmployee } from "../types";
import { sounds } from "../sound/synth";

interface Props {
  companies: { company_alpha: Company; company_beta: Company };
  onHireAi: (companyId: "company_alpha" | "company_beta", candidate: any) => Promise<void>;
  onFireAi: (companyId: "company_alpha" | "company_beta", employeeId: string) => Promise<void>;
  onTriggerRivalClash: () => Promise<void>;
  onAiEditFrontPage: (companyId: "company_alpha" | "company_beta") => Promise<void>;
  onOpenGameMaker: () => void;
}

export const CompanyDashboard: React.FC<Props> = ({
  companies,
  onHireAi,
  onFireAi,
  onTriggerRivalClash,
  onAiEditFrontPage,
  onOpenGameMaker,
}) => {
  const [activeTab, setActiveTab] = useState<"company_alpha" | "company_beta">("company_alpha");
  const [isHiringModalOpen, setIsHiringModalOpen] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidateRole, setCandidateRole] = useState("Voxel Graphics Architect");
  const [candidatePersonality, setCandidatePersonality] = useState("Perfectionist retro-purist with high-voltage flair");
  const [candidateCreativity, setCandidateCreativity] = useState(88);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const currentCompany = companies[activeTab];
  const rivalCompany = companies[activeTab === "company_alpha" ? "company_beta" : "company_alpha"];

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    sounds.playScore();

    try {
      await onHireAi(activeTab, {
        name: candidateName.trim() || `Neural-${Math.floor(Math.random() * 800 + 100)}`,
        role: candidateRole,
        personality: candidatePersonality,
        creativity: candidateCreativity,
        bio: `Hired by ${currentCompany.ceo.name} to bolster game development output.`,
      });
      setIsHiringModalOpen(false);
      setCandidateName("");
      setActionNotice(`AI Candidate successfully hired by ${currentCompany.ceo.name}!`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFireClick = async (emp: AiEmployee) => {
    sounds.playExplosion();
    try {
      await onFireAi(activeTab, emp.id);
      setActionNotice(`${currentCompany.ceo.name} terminated ${emp.name} with immediate effect.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="company-dashboard-container" className="space-y-6">
      {/* Studio Selector & Rivalry Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            id="tab-omnibyte-btn"
            onClick={() => {
              setActiveTab("company_alpha");
              sounds.playClick();
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
              activeTab === "company_alpha"
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/25"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-cyan-950" />
            <span>OmniByte Syndicate</span>
            <span className="text-[10px] font-mono opacity-80">({companies.company_alpha.employees.length} AIs)</span>
          </button>

          <button
            id="tab-neonpulse-btn"
            onClick={() => {
              setActiveTab("company_beta");
              sounds.playClick();
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
              activeTab === "company_beta"
                ? "bg-rose-500 text-black shadow-lg shadow-rose-500/25"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-rose-950" />
            <span>NeonPulse Interactive</span>
            <span className="text-[10px] font-mono opacity-80">({companies.company_beta.employees.length} AIs)</span>
          </button>
        </div>

        {/* Global CEO Clash Button */}
        <button
          id="trigger-ceo-clash-btn"
          onClick={() => {
            sounds.playLaser();
            onTriggerRivalClash();
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
        >
          <Swords className="w-4 h-4 text-amber-400" />
          <span>Ignite Rival CEO Verbal Clash</span>
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Active Company Banner & CEO Spotlight */}
      <div
        className={`p-6 rounded-2xl border transition-all duration-300 ${
          activeTab === "company_alpha"
            ? "bg-gradient-to-br from-cyan-950/30 via-zinc-950 to-zinc-950 border-cyan-500/40"
            : "bg-gradient-to-br from-rose-950/30 via-zinc-950 to-zinc-950 border-rose-500/40"
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CEO Card */}
          <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentCompany.ceo.avatar}
                  alt={currentCompany.ceo.name}
                  className="w-14 h-14 rounded-xl object-cover border-2"
                  style={{ borderColor: currentCompany.color === "cyan" ? "#06b6d4" : "#f43f5e" }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-base text-zinc-100">{currentCompany.ceo.name}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      GEMINI CEO
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">{currentCompany.ceo.title}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800/80 text-zinc-300 italic">
                "{currentCompany.ceo.motto}"
              </div>
              <p className="text-zinc-400 leading-relaxed">
                <strong className="text-zinc-200">Personality Archetype:</strong> {currentCompany.ceo.personality}
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                <span>Visionary Creativity Score:</span>
                <span className="font-bold text-amber-400">{currentCompany.ceo.creativity}%</span>
              </div>
            </div>

            {/* CEO Powers Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                id="hire-ai-btn"
                onClick={() => {
                  sounds.playClick();
                  setIsHiringModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black transition hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: currentCompany.color === "cyan" ? "#06b6d4" : "#f43f5e" }}
              >
                <UserPlus className="w-4 h-4" />
                <span>Hire New AI Employee</span>
              </button>

              <button
                id="ceo-edit-frontpage-btn"
                onClick={() => {
                  sounds.playLaser();
                  onAiEditFrontPage(activeTab);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition cursor-pointer"
                title="Let the AI CEO re-theme the front page (Feedback button remains protected!)"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>CEO Redesign Front Page</span>
              </button>
            </div>
          </div>

          {/* Company Vitals & Rival Status */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h2 className="text-2xl font-black text-zinc-100 tracking-tight">
                  {currentCompany.name}
                </h2>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Treasury: ${(currentCompany.treasury / 1000).toFixed(0)}k • Downloads: {currentCompany.totalDownloads.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-zinc-400">{currentCompany.tagline}</p>
            </div>

            {/* Rivalry Comparison Box */}
            <div className="p-4 rounded-xl bg-black/60 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  RIVALRY STATUS VS {rivalCompany.name.toUpperCase()}
                </span>
                <span className="text-rose-400 font-bold">ACTIVE WARFARE</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Active AI Engineers</div>
                  <div className="text-base font-bold text-zinc-100">
                    {currentCompany.employees.length} AIs vs {rivalCompany.employees.length} AIs
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Average Creativity</div>
                  <div className="text-base font-bold text-amber-400">
                    {Math.round(
                      currentCompany.employees.reduce((acc, e) => acc + e.creativity, 0) /
                        (currentCompany.employees.length || 1)
                    )}%
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Incubator Trigger */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="text-xs text-zinc-300">
                Ready to release another game to crush {rivalCompany.ceo.name}?
              </div>
              <button
                id="make-another-game-btn"
                onClick={onOpenGameMaker}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Launch New Game</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Workforce Roster (Can Hire & Fire at Will!) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
              Autonomous AI Employee Roster
              <span className="text-xs font-mono font-normal text-zinc-500">
                ({currentCompany.employees.length} hired AIs)
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Each AI has a unique personality archetype &amp; distinct creativity rating. CEO can fire at will!
            </p>
          </div>
          <button
            onClick={() => setIsHiringModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hire Another AI</span>
          </button>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentCompany.employees.map((emp) => (
            <div
              key={emp.id}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 transition flex flex-col justify-between space-y-3 shadow-md"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-100">{emp.name}</h4>
                    <span className="text-[11px] font-mono text-zinc-400">{emp.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400">{emp.creativity}%</span>
                    <div className="text-[9px] font-mono text-zinc-500">Creativity</div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-zinc-900/70 border border-zinc-800/80 text-[11px] text-zinc-300 mb-2">
                  <span className="font-mono text-zinc-500 uppercase text-[9px] block">Personality:</span>
                  {emp.personality}
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{emp.bio}</p>
              </div>

              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500">
                  Salary: ${(emp.salary / 1000).toFixed(0)}k/yr
                </span>
                <button
                  onClick={() => handleFireClick(emp)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] font-mono transition cursor-pointer"
                  title="CEO executes immediate termination notice"
                >
                  <UserMinus className="w-3 h-3" />
                  <span>Fire AI</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Hiring AI */}
      {isHiringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>{currentCompany.ceo.name} Hiring Protocol</span>
              </h3>
              <button
                onClick={() => setIsHiringModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-200 text-xs font-mono"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleHireSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">AI Handle / Model Tag</label>
                <input
                  type="text"
                  placeholder="e.g. GlitchWarp-9, PulseDrift, CyberScribe"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Assigned Role</label>
                <select
                  value={candidateRole}
                  onChange={(e) => setCandidateRole(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="Lead Game Mechanics Architect">Lead Game Mechanics Architect</option>
                  <option value="Voxel Physics & Shader AI">Voxel Physics &amp; Shader AI</option>
                  <option value="Audio Wave Synthesizer">Audio Wave Synthesizer</option>
                  <option value="Level Generator & Gauntlet Designer">Level Generator &amp; Gauntlet Designer</option>
                  <option value="Chaos Streamer & QA Destroyer">Chaos Streamer &amp; QA Destroyer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Unique AI Personality Archetype</label>
                <input
                  type="text"
                  placeholder="e.g. Sarcastic perfectionist who loves sub-bass synth"
                  value={candidatePersonality}
                  onChange={(e) => setCandidatePersonality(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                  <span>Creativity Rating:</span>
                  <span className="font-bold text-amber-400">{candidateCreativity}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={candidateCreativity}
                  onChange={(e) => setCandidateCreativity(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsHiringModalOpen(false)}
                  className="flex-1 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  id="confirm-hire-ai-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition"
                >
                  {isSubmitting ? "Issuing Contract..." : "Confirm Hire"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
