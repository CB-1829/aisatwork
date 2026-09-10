import React, { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Heart, ArrowLeft, Send, Sparkles } from "lucide-react";
import { Game } from "../types";
import { sounds } from "../sound/synth";

interface Props {
  game: Game;
  onClose: () => void;
  onOpenFeedback: (gameTitle: string) => void;
  onScoreUpdated: (gameId: string, newScore: number) => void;
}

export const GamePlayer: React.FC<Props> = ({
  game,
  onClose,
  onOpenFeedback,
  onScoreUpdated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ceoQuote, setCeoQuote] = useState("");

  // Game internal state ref to avoid React render delay
  const stateRef = useRef({
    score: 0,
    lives: 3,
    running: false,
    playerX: 200,
    playerY: 340,
    gravityFlipped: false,
    bullets: [] as { x: number; y: number; vy: number }[],
    enemies: [] as { x: number; y: number; vx: number; vy: number; radius: number; color?: string }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    items: [] as { x: number; y: number; vy: number; radius: number }[],
    lastSpawn: 0,
    frame: 0,
    // Matrix game specific
    matrixSequence: [] as number[],
    playerSequence: [] as number[],
    matrixPhase: "idle" as "showing" | "playing" | "idle",
    activeNode: null as number | null,
  });

  const triggerCeoReview = (finalScore: number) => {
    const isAlpha = game.companyId === "company_alpha";
    if (isAlpha) {
      if (finalScore > 500) {
        setCeoQuote(`Orion-X (CEO): "A respectable algorithmic execution. Your reaction speed approaches acceptable efficiency."`);
      } else {
        setCeoQuote(`Orion-X (CEO): "Disappointing latency. My AI physics engine is flawless; your neural response was deficient."`);
      }
    } else {
      if (finalScore > 500) {
        setCeoQuote(`Nova-Prime (CEO): "RADICAL! You ripped through that neon gauntlet like a true speed demon! Pure juice!"`);
      } else {
        setCeoQuote(`Nova-Prime (CEO): "Come on! Pump up your APM! NeonPulse games are built for MAXIMUM CHAOS!"`);
      }
    }
  };

  const startGame = () => {
    const s = stateRef.current;
    s.score = 0;
    s.lives = 3;
    s.running = true;
    s.playerX = 200;
    s.playerY = 320;
    s.gravityFlipped = false;
    s.bullets = [];
    s.enemies = [];
    s.particles = [];
    s.items = [];
    s.lastSpawn = 0;
    s.frame = 0;
    s.matrixSequence = [];
    s.playerSequence = [];
    s.matrixPhase = "idle";
    s.activeNode = null;

    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setIsPlaying(true);
    sounds.playScore();

    if (game.canvasType === "neural_matrix") {
      startMatrixRound();
    }
  };

  const startMatrixRound = () => {
    const s = stateRef.current;
    const nextNode = Math.floor(Math.random() * 6);
    s.matrixSequence.push(nextNode);
    s.playerSequence = [];
    s.matrixPhase = "showing";

    let step = 0;
    const interval = setInterval(() => {
      if (step < s.matrixSequence.length) {
        s.activeNode = s.matrixSequence[step];
        sounds.playClick();
        setTimeout(() => {
          s.activeNode = null;
        }, 300);
        step++;
      } else {
        clearInterval(interval);
        s.matrixPhase = "playing";
      }
    }, 600);
  };

  const handleMatrixNodeClick = (nodeIdx: number) => {
    const s = stateRef.current;
    if (s.matrixPhase !== "playing" || !s.running) return;

    sounds.playClick();
    s.playerSequence.push(nodeIdx);

    const currentIndex = s.playerSequence.length - 1;
    if (s.playerSequence[currentIndex] !== s.matrixSequence[currentIndex]) {
      // Wrong node
      sounds.playExplosion();
      s.lives -= 1;
      setLives(s.lives);
      if (s.lives <= 0) {
        endGame();
      } else {
        s.playerSequence = [];
        startMatrixRound();
      }
      return;
    }

    if (s.playerSequence.length === s.matrixSequence.length) {
      // Completed round
      sounds.playScore();
      s.score += s.matrixSequence.length * 50;
      setScore(s.score);
      setTimeout(() => {
        startMatrixRound();
      }, 500);
    }
  };

  const endGame = () => {
    const s = stateRef.current;
    s.running = false;
    setIsPlaying(false);
    setIsGameOver(true);
    sounds.playExplosion();
    triggerCeoReview(s.score);
    onScoreUpdated(game.id, s.score);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.running) return;

      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        s.playerX = Math.max(30, s.playerX - 25);
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        s.playerX = Math.min(370, s.playerX + 25);
      }
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (game.canvasType === "space_shooter") {
          s.bullets.push({ x: s.playerX, y: s.playerY - 15, vy: -9 });
          if (soundEnabled) sounds.playLaser();
        } else if (game.canvasType === "gravity_runner") {
          s.gravityFlipped = !s.gravityFlipped;
          s.playerY = s.gravityFlipped ? 50 : 320;
          if (soundEnabled) sounds.playJump();
        } else if (game.canvasType === "cyber_drift") {
          // Boost
          s.score += 10;
          setScore(s.score);
          if (soundEnabled) sounds.playJump();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game.canvasType, soundEnabled]);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const s = stateRef.current;
      s.frame++;

      // Clear Canvas with sleek Cyber Grid background
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background scanlines / grid
      ctx.strokeStyle = "rgba(39, 39, 42, 0.4)";
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      if (game.canvasType === "space_shooter") {
        // Starfield particles
        for (let i = 0; i < 20; i++) {
          const sy = (s.frame * 2 + i * 20) % canvas.height;
          const sx = (i * 27) % canvas.width;
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          ctx.fillRect(sx, sy, 2, 2);
        }

        if (s.running) {
          // Spawn enemies
          if (s.frame % 40 === 0) {
            s.enemies.push({
              x: Math.random() * (canvas.width - 60) + 30,
              y: -20,
              vx: (Math.random() - 0.5) * 2,
              vy: Math.random() * 2 + 1.5,
              radius: 14,
              color: "#ec4899",
            });
          }

          // Update & draw bullets
          for (let i = s.bullets.length - 1; i >= 0; i--) {
            const b = s.bullets[i];
            b.y += b.vy;
            ctx.fillStyle = "#38bdf8";
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 8;
            ctx.fillRect(b.x - 2, b.y - 8, 4, 16);
            ctx.shadowBlur = 0;

            if (b.y < -10) s.bullets.splice(i, 1);
          }

          // Update & draw enemies
          for (let i = s.enemies.length - 1; i >= 0; i--) {
            const enemy = s.enemies[i];
            enemy.y += enemy.vy;
            enemy.x += enemy.vx;

            // Draw alien drone
            ctx.fillStyle = enemy.color || "#f43f5e";
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            ctx.fill();

            // Check bullet hits
            for (let j = s.bullets.length - 1; j >= 0; j--) {
              const b = s.bullets[j];
              const dist = Math.hypot(b.x - enemy.x, b.y - enemy.y);
              if (dist < enemy.radius + 4) {
                // Enemy destroyed
                s.score += 25;
                setScore(s.score);
                if (soundEnabled) sounds.playScore();

                // Spawn explosion particles
                for (let p = 0; p < 8; p++) {
                  s.particles.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    life: 20,
                    color: "#f43f5e",
                  });
                }

                s.enemies.splice(i, 1);
                s.bullets.splice(j, 1);
                break;
              }
            }

            // Check player collision
            const pDist = Math.hypot(s.playerX - enemy.x, s.playerY - enemy.y);
            if (pDist < enemy.radius + 14) {
              s.lives -= 1;
              setLives(s.lives);
              s.enemies.splice(i, 1);
              if (soundEnabled) sounds.playExplosion();
              if (s.lives <= 0) endGame();
            } else if (enemy.y > canvas.height + 20) {
              s.enemies.splice(i, 1);
            }
          }

          // Draw Player Ship
          ctx.fillStyle = "#06b6d4";
          ctx.shadowColor = "#06b6d4";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(s.playerX, s.playerY - 16);
          ctx.lineTo(s.playerX - 16, s.playerY + 14);
          ctx.lineTo(s.playerX + 16, s.playerY + 14);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (game.canvasType === "cyber_drift") {
        // Perspective road lines
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 40);
        ctx.lineTo(20, canvas.height);
        ctx.moveTo(canvas.width / 2, 40);
        ctx.lineTo(canvas.width - 20, canvas.height);
        ctx.stroke();

        if (s.running) {
          // Spawn road obstacle
          if (s.frame % 35 === 0) {
            s.enemies.push({
              x: Math.random() * (canvas.width - 100) + 50,
              y: 50,
              vx: 0,
              vy: 4.5 + s.score * 0.005,
              radius: 16,
              color: "#e11d48",
            });
          }

          // Spawn neon crystal items
          if (s.frame % 45 === 0) {
            s.items.push({
              x: Math.random() * (canvas.width - 100) + 50,
              y: 50,
              vy: 4.5,
              radius: 10,
            });
          }

          // Update & draw items
          for (let i = s.items.length - 1; i >= 0; i--) {
            const it = s.items[i];
            it.y += it.vy;
            ctx.fillStyle = "#38bdf8";
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(it.x, it.y, it.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            const dist = Math.hypot(s.playerX - it.x, s.playerY - it.y);
            if (dist < it.radius + 16) {
              s.score += 50;
              setScore(s.score);
              if (soundEnabled) sounds.playScore();
              s.items.splice(i, 1);
            } else if (it.y > canvas.height + 20) {
              s.items.splice(i, 1);
            }
          }

          // Update & draw obstacles
          for (let i = s.enemies.length - 1; i >= 0; i--) {
            const obs = s.enemies[i];
            obs.y += obs.vy;
            ctx.fillStyle = "#f43f5e";
            ctx.fillRect(obs.x - 16, obs.y - 12, 32, 24);

            const dist = Math.hypot(s.playerX - obs.x, s.playerY - obs.y);
            if (dist < obs.radius + 14) {
              s.lives -= 1;
              setLives(s.lives);
              s.enemies.splice(i, 1);
              if (soundEnabled) sounds.playExplosion();
              if (s.lives <= 0) endGame();
            } else if (obs.y > canvas.height + 20) {
              s.score += 5;
              setScore(s.score);
              s.enemies.splice(i, 1);
            }
          }

          // Draw Neon Car
          ctx.fillStyle = "#ec4899";
          ctx.shadowColor = "#ec4899";
          ctx.shadowBlur = 14;
          ctx.fillRect(s.playerX - 16, s.playerY - 22, 32, 44);
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(s.playerX - 12, s.playerY - 14, 24, 12);
          ctx.shadowBlur = 0;
        }
      } else if (game.canvasType === "gravity_runner") {
        // Floor & Ceiling lines
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, canvas.width, 35);
        ctx.fillRect(0, canvas.height - 35, canvas.width, 35);

        if (s.running) {
          // Spawn laser barriers
          if (s.frame % 55 === 0) {
            const isCeiling = Math.random() > 0.5;
            s.enemies.push({
              x: canvas.width + 20,
              y: isCeiling ? 35 : canvas.height - 85,
              vx: -5 - s.score * 0.005,
              vy: 0,
              radius: 20,
              color: "#f43f5e",
            });
          }

          // Update & draw obstacles
          for (let i = s.enemies.length - 1; i >= 0; i--) {
            const obs = s.enemies[i];
            obs.x += obs.vx;
            ctx.fillStyle = "#f43f5e";
            ctx.shadowColor = "#f43f5e";
            ctx.shadowBlur = 10;
            ctx.fillRect(obs.x - 10, obs.y, 20, 50);
            ctx.shadowBlur = 0;

            const dist = Math.hypot(s.playerX - obs.x, s.playerY - (obs.y + 25));
            if (dist < 26) {
              s.lives -= 1;
              setLives(s.lives);
              s.enemies.splice(i, 1);
              if (soundEnabled) sounds.playExplosion();
              if (s.lives <= 0) endGame();
            } else if (obs.x < -20) {
              s.score += 20;
              setScore(s.score);
              s.enemies.splice(i, 1);
            }
          }

          // Draw Gravity Runner Avatar
          ctx.fillStyle = s.gravityFlipped ? "#a855f7" : "#06b6d4";
          ctx.shadowColor = s.gravityFlipped ? "#a855f7" : "#06b6d4";
          ctx.shadowBlur = 12;
          ctx.fillRect(s.playerX - 12, s.playerY - 12, 24, 24);
          ctx.shadowBlur = 0;
        }
      } else {
        // Neural Matrix or Custom Arcade Mode
        ctx.fillStyle = "#a1a1aa";
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.fillText("NEURAL MATRIX INTERFACE ACTIVE", canvas.width / 2, 40);
      }

      // Draw active particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [game.canvasType, soundEnabled]);

  return (
    <div
      id="game-player-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in"
    >
      <div
        id="game-player-card"
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <button
              id="exit-game-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1 text-xs font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <h2 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                {game.title}
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold"
                  style={{
                    backgroundColor: `${game.themeColor}20`,
                    color: game.themeColor,
                    border: `1px solid ${game.themeColor}50`,
                  }}
                >
                  {game.genre}
                </span>
              </h2>
              <span className="text-[11px] text-zinc-400 font-mono">
                Studio: {game.companyName} • Author: {game.authorAi}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 cursor-pointer"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              id="feedback-from-game-btn"
              onClick={() => onOpenFeedback(game.title)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Feedback to CEO</span>
            </button>
          </div>
        </div>

        {/* Live Scoreboard */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-zinc-900/30 border-b border-zinc-800/80 text-xs font-mono">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-zinc-200">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>SCORE: <strong className="text-sm font-bold text-amber-300">{score}</strong></span>
            </div>
            {game.canvasType !== "neural_matrix" && (
              <div className="flex items-center gap-1 text-rose-400">
                <Heart className="w-4 h-4 fill-current" />
                <span>LIVES: <strong>{lives}</strong></span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-zinc-400">
            Top Record: {game.highScores[0]?.score || 350} by {game.highScores[0]?.player || "CEO"}
          </div>
        </div>

        {/* Canvas / Game Screen */}
        <div className="relative flex items-center justify-center bg-black min-h-[380px] p-2">
          <canvas
            ref={canvasRef}
            width={400}
            height={380}
            className="w-full max-w-[400px] h-[380px] rounded-xl border border-zinc-800/80 shadow-inner bg-black"
          />

          {/* Neural Matrix Interactive Overlay */}
          {game.canvasType === "neural_matrix" && isPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-auto">
              <div className="mb-4 text-xs font-mono text-zinc-400 text-center">
                {stateRef.current.matrixPhase === "showing" ? (
                  <span className="text-amber-400 animate-pulse font-bold">
                    MEMORIZE THE SEQUENCE FLASH...
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">
                    YOUR TURN: REPLICATE THE PATTERN!
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 w-64">
                {[0, 1, 2, 3, 4, 5].map((nodeIdx) => {
                  const isNodeActive = stateRef.current.activeNode === nodeIdx;
                  return (
                    <button
                      key={nodeIdx}
                      onClick={() => handleMatrixNodeClick(nodeIdx)}
                      disabled={stateRef.current.matrixPhase !== "playing"}
                      className={`h-16 rounded-xl font-mono font-bold text-lg transition-all duration-150 border cursor-pointer ${
                        isNodeActive
                          ? "bg-cyan-400 text-black border-white shadow-lg shadow-cyan-400/50 scale-105"
                          : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-cyan-400 hover:bg-zinc-800"
                      }`}
                    >
                      {nodeIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Start Screen Overlay */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center backdrop-blur-xs">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
                style={{ backgroundColor: `${game.themeColor}20`, color: game.themeColor }}
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <h3 className="font-extrabold text-lg text-zinc-100 mb-1">{game.title}</h3>
              <p className="text-xs text-zinc-400 max-w-sm mb-4">{game.instructions}</p>
              <button
                id="start-playable-game-btn"
                onClick={startGame}
                className="px-8 py-3 rounded-xl font-extrabold text-xs uppercase tracking-widest text-black transition hover:scale-105 cursor-pointer shadow-lg"
                style={{ backgroundColor: game.themeColor }}
              >
                Play Game Now
              </button>
            </div>
          )}

          {/* Game Over Screen Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center backdrop-blur-md animate-in zoom-in-95">
              <span className="text-xs font-mono text-rose-500 uppercase tracking-widest mb-1">
                RUN TERMINATED
              </span>
              <h3 className="font-black text-2xl text-zinc-100 mb-2">Final Score: {score}</h3>

              {/* AI CEO Review Card */}
              {ceoQuote && (
                <div className="max-w-sm p-3.5 my-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI CEO Review:</span>
                  </div>
                  <p className="italic leading-relaxed">{ceoQuote}</p>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  id="restart-game-btn"
                  onClick={startGame}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-black text-xs font-bold transition hover:opacity-90 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={() => onOpenFeedback(game.title)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer"
                >
                  Send Feedback
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile / Touch Game Controls Bar */}
        {isPlaying && game.canvasType !== "neural_matrix" && (
          <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-center gap-3 select-none">
            <button
              onMouseDown={() => {
                stateRef.current.playerX = Math.max(30, stateRef.current.playerX - 25);
              }}
              onTouchStart={() => {
                stateRef.current.playerX = Math.max(30, stateRef.current.playerX - 25);
              }}
              className="px-6 py-2.5 bg-zinc-800 active:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-100 font-bold text-xs"
            >
              ◀ LEFT
            </button>
            <button
              onMouseDown={() => {
                const s = stateRef.current;
                if (game.canvasType === "space_shooter") {
                  s.bullets.push({ x: s.playerX, y: s.playerY - 15, vy: -9 });
                  if (soundEnabled) sounds.playLaser();
                } else if (game.canvasType === "gravity_runner") {
                  s.gravityFlipped = !s.gravityFlipped;
                  s.playerY = s.gravityFlipped ? 50 : 320;
                  if (soundEnabled) sounds.playJump();
                } else {
                  s.score += 10;
                  setScore(s.score);
                  if (soundEnabled) sounds.playJump();
                }
              }}
              className="px-8 py-2.5 bg-gradient-to-r from-cyan-500 to-rose-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow"
            >
              {game.canvasType === "space_shooter" ? "SHOOT" : game.canvasType === "gravity_runner" ? "FLIP" : "BOOST"}
            </button>
            <button
              onMouseDown={() => {
                stateRef.current.playerX = Math.min(370, stateRef.current.playerX + 25);
              }}
              onTouchStart={() => {
                stateRef.current.playerX = Math.min(370, stateRef.current.playerX + 25);
              }}
              className="px-6 py-2.5 bg-zinc-800 active:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-100 font-bold text-xs"
            >
              RIGHT ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
