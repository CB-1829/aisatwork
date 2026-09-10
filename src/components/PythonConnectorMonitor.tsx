import React, { useState } from "react";
import { Terminal, Server, Cpu, ShieldCheck, RefreshCw, AlertOctagon, CheckCircle, Activity } from "lucide-react";
import { ConnectorLog } from "../types";
import { sounds } from "../sound/synth";

interface Props {
  logs: ConnectorLog[];
  onRefreshStatus: () => void;
  onAttemptIllegalHack: () => void;
}

export const PythonConnectorMonitor: React.FC<Props> = ({
  logs,
  onRefreshStatus,
  onAttemptIllegalHack,
}) => {
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<any>(null);

  const handlePing = async () => {
    setIsPinging(true);
    sounds.playClick();
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setPingResult(data.pythonHost);
      onRefreshStatus();
      sounds.playScore();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div
      id="python-connector-monitor-card"
      className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4"
    >
      {/* Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
              Python Host &amp; AI Connector Bridge
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ACTIVE KERNEL
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Front Page <span className="text-zinc-600">⇄</span> Python Host Connector (server/python_host.py) <span className="text-zinc-600">⇄</span> AI Brain
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="ping-python-host-btn"
            onClick={handlePing}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-mono transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin" : ""}`} />
            <span>Ping Python Host</span>
          </button>

          <button
            id="test-illegal-feedback-hack-btn"
            onClick={() => {
              sounds.playAnchorLockAlert();
              onAttemptIllegalHack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-mono transition cursor-pointer"
            title="Force an AI CEO to attempt hacking the Feedback Button to verify the Python kernel blocks it!"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Button Protection</span>
          </button>
        </div>
      </div>

      {/* Visual Pipeline Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
            <span>NODE 01: FRONT PAGE</span>
            <Activity className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs text-zinc-300">
            UI rendered at port 3000. Contains editable game studio pages and the <strong>permanently locked</strong> feedback anchor.
          </p>
          <div className="text-[10px] font-mono text-zinc-500">Status: Listening (React 19)</div>
        </div>

        <div className="p-3 bg-zinc-900/60 border border-amber-500/30 rounded-xl space-y-1 relative">
          <div className="flex items-center justify-between text-[11px] font-mono text-amber-400">
            <span>NODE 02: PYTHON HOST</span>
            <Server className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs text-zinc-300">
            <code className="text-amber-300 font-mono text-[11px]">server/python_host.py</code>
            <br />
            Enforces Immutable Directive 001, ingests player feedback, routes AI commands.
          </p>
          <div className="text-[10px] font-mono text-amber-400/90 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Kernel Protection: ACTIVE</span>
          </div>
        </div>

        <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-rose-400">
            <span>NODE 03: AI BRAIN</span>
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs text-zinc-300">
            Powers Gemini AI CEOs Orion-X &amp; Nova-Prime, dynamic game generation, hiring/firing, and AI feedback chat.
          </p>
          <div className="text-[10px] font-mono text-zinc-500">Model: Gemini 3.8 Flash</div>
        </div>
      </div>

      {/* Ping Details Banner (if pinged) */}
      {pingResult && (
        <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs font-mono text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Python Host Response: Python {pingResult.python_version} • {pingResult.host_engine}
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            Feedback Anchor: {pingResult.feedback_button_protected ? "PROTECTED 🔒" : "VULNERABLE"}
          </span>
        </div>
      )}

      {/* Live Terminal Log Viewer */}
      <div className="rounded-xl bg-black border border-zinc-800 p-3 font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900 text-zinc-500 text-[11px]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>CONNECTOR LOG STREAM</span>
          </div>
          <span>REALTIME IPC EVENTS</span>
        </div>

        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {logs.slice().reverse().map((log, i) => (
            <div
              key={i}
              className={`text-[11px] leading-relaxed flex items-start gap-2 ${
                log.type === "security"
                  ? "text-amber-400 bg-amber-950/30 p-1.5 rounded border border-amber-800/40"
                  : log.type === "warning"
                  ? "text-rose-400"
                  : log.type === "success"
                  ? "text-emerald-400"
                  : "text-zinc-300"
              }`}
            >
              <span className="text-zinc-600 shrink-0 select-none">[{log.timestamp}]</span>
              <span className="font-bold text-zinc-400 shrink-0">[{log.source} ➔ {log.target}]:</span>
              <span className="break-all">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
