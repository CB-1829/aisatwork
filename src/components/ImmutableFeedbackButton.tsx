import React, { useState } from "react";
import { MessageSquarePlus, ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { sounds } from "../sound/synth";

interface Props {
  onClick: () => void;
  unreadCount?: number;
}

export const ImmutableFeedbackButton: React.FC<Props> = ({ onClick, unreadCount = 0 }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    sounds.playClick();
    onClick();
  };

  return (
    <div
      id="immutable-feedback-anchor"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end group select-none"
    >
      {/* Tooltip explaining immutable status */}
      {showTooltip && (
        <div className="mb-2 p-3 bg-zinc-950/95 border border-amber-500/50 rounded-lg shadow-2xl backdrop-blur-md max-w-xs text-xs text-zinc-300 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>IMMUTABLE DIRECTIVE 001</span>
          </div>
          <p className="leading-relaxed">
            This Feedback Button is <strong className="text-zinc-100">hardware-locked</strong>. Both AI CEOs have full permission to redesign the front page, but this button is protected by the Python Host security kernel and cannot be modified, re-themed, or deleted.
          </p>
        </div>
      )}

      {/* Security Status Tag */}
      <div className="flex items-center gap-1 px-2.5 py-0.5 mb-1 text-[10px] font-mono tracking-wider uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full shadow-inner">
        <ShieldCheck className="w-3 h-3 text-amber-400" />
        <span>KERNEL LOCKED • UNMODIFIABLE</span>
      </div>

      {/* The Button */}
      <button
        id="btn-permanent-feedback-anchor"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-black shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 border-2 border-amber-300 cursor-pointer"
        title="Send player feedback through Python connector directly to AI CEOs"
      >
        {/* Glow halo */}
        <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 blur-sm opacity-50 group-hover:opacity-80 transition duration-300 -z-10" />

        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/20 text-black">
          <MessageSquarePlus className="w-5 h-5 stroke-[2.5]" />
        </div>

        <div className="flex flex-col text-left">
          <span className="font-extrabold uppercase leading-tight text-xs tracking-wider">
            FEEDBACK TO AI CEOs
          </span>
          <span className="text-[10px] font-mono font-medium opacity-80 leading-none">
            via Python Host Connector
          </span>
        </div>

        {unreadCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-black text-amber-400 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
