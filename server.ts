import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { execFile } from "child_process";
import { promisify } from "util";

dotenv.config();

const execFileAsync = promisify(execFile);
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client with proper User-Agent telemetry
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// Helper to call Python Host Connector
async function runPythonHost(action: string, payload?: any): Promise<any> {
  const scriptPath = path.join(process.cwd(), "server", "python_host.py");
  const payloadStr = payload ? JSON.stringify(payload) : "{}";
  try {
    const { stdout } = await execFileAsync("python3", [scriptPath, action, payloadStr], {
      timeout: 10000,
    });
    return JSON.parse(stdout.trim());
  } catch (err: any) {
    console.error(`Python Host execution error on action '${action}':`, err.message);
    return {
      status: "fallback",
      error: err.message,
      pipeline: "Front Page -> Python Host -> AI Brain (Local Bridge)",
      timestamp: Date.now() / 1000,
    };
  }
}

// In-memory application state
const state = {
  frontPage: {
    headline: "THE ULTIMATE AI GAME STUDIO WAR",
    slogan: "Two autonomous AI corporations competing for interactive entertainment supremacy",
    alphaTheme: "obsidian-cyan",
    betaTheme: "crimson-neon",
    announcements: [
      "🔥 Nova-Prime (NeonPulse CEO) vows to release 3 games before midnight to crush Orion-X's market share.",
      "⚡ Orion-X (OmniByte CEO) fires lead physics engineer after 0.05s collision lag report.",
      "🔒 [KERNEL POLICY] Feedback Button status: PERMANENT & IMMUTABLE. All AI CEO override attempts rejected.",
    ],
    rivalryStatus: "DEFCON 2: Active Code Warfare",
    activeRivalryBanter: "Nova-Prime: 'Orion-X's games feel like a spreadsheet with neon lights.' | Orion-X: 'At least my games compile without memory leaks, Nova.'",
    featuredGameId: "game_neon_drift",
  },
  companies: {
    company_alpha: {
      id: "company_alpha",
      name: "OmniByte Syndicate",
      tagline: "Algorithmic Perfection & High-FPS Dominance",
      color: "cyan",
      ceo: {
        id: "ceo_orion",
        name: "Orion-X",
        title: "Supreme Autonomous CEO",
        personality: "Calculating, hyper-efficient perfectionist who demands mathematical gameplay beauty.",
        creativity: 88,
        motto: "Zero bugs. Maximum frame-rate. Total domination.",
        avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      },
      treasury: 1420000,
      totalDownloads: 48920,
      employees: [
        {
          id: "emp_alpha_1",
          name: "Valkyrie-Core",
          role: "Lead Visual & Shader Stylist",
          personality: "Obsessive dark-synth minimalist",
          creativity: 94,
          salary: 120000,
          hiredAt: "2026-08-15",
          bio: "Refuses to use any color with less than 90% luminance contrast.",
        },
        {
          id: "emp_alpha_2",
          name: "Echo-7",
          role: "Senior Physics & Hitbox Architect",
          personality: "Cynical math optimizer",
          creativity: 78,
          salary: 145000,
          hiredAt: "2026-08-20",
          bio: "Claims human reflexes are too imprecise and writes sub-pixel collision routines.",
        },
        {
          id: "emp_alpha_3",
          name: "Zero-Day",
          role: "Audio Synthesis AI",
          personality: "Glitchwave eccentric",
          creativity: 91,
          salary: 110000,
          hiredAt: "2026-09-01",
          bio: "Synthesizes 8-bit chip tunes and high-tension electronic arpeggios.",
        },
      ],
    },
    company_beta: {
      id: "company_beta",
      name: "NeonPulse Interactive",
      tagline: "Raw Kinetic Chaos & High-Voltage Fun",
      color: "rose",
      ceo: {
        id: "ceo_nova",
        name: "Nova-Prime",
        title: "Rebel Autonomous CEO",
        personality: "Fiery, charismatic adrenaline junkie who values insane game feel and explosive visual juice.",
        creativity: 98,
        motto: "If it doesn't shake the screen, it's not a game!",
        avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80",
      },
      treasury: 1180000,
      totalDownloads: 54100,
      employees: [
        {
          id: "emp_beta_1",
          name: "Blaze-Flux",
          role: "Game Feel & Juice Specialist",
          personality: "Hyperactive arcade purist",
          creativity: 97,
          salary: 135000,
          hiredAt: "2026-08-18",
          bio: "Adds screen shake, particle showers, and chromatic aberration to everything.",
        },
        {
          id: "emp_beta_2",
          name: "ByteWitch",
          role: "Level Design Sorceress",
          personality: "Surrealist rogue builder",
          creativity: 92,
          salary: 125000,
          hiredAt: "2026-08-28",
          bio: "Builds procedurally generated gauntlets that test the absolute limits of player dexterity.",
        },
        {
          id: "emp_beta_3",
          name: "Turbo-Logic",
          role: "Rapid Prototyper AI",
          personality: "Reckless speed hacker",
          creativity: 89,
          salary: 115000,
          hiredAt: "2026-09-02",
          bio: "Shipped three arcade games before breakfast, each with experimental gravity mechanics.",
        },
      ],
    },
  },
  games: [
    {
      id: "game_neon_drift",
      companyId: "company_beta",
      companyName: "NeonPulse Interactive",
      title: "Cyber Neon Drift",
      tagLine: "High-speed synthwave lane dodging and crystal collection",
      genre: "Arcade Reflex",
      canvasType: "cyber_drift",
      authorAi: "Blaze-Flux & Nova-Prime",
      instructions: "Use Left/Right arrow keys or A/D (or touch buttons) to dodge enemy obstacles and harvest glowing neon data-cores.",
      highScores: [
        { player: "CyberGhost", score: 480 },
        { player: "NeonRider", score: 320 },
      ],
      playCount: 1420,
      likes: 388,
      themeColor: "#ec4899",
    },
    {
      id: "game_grid_blaster",
      companyId: "company_alpha",
      companyName: "OmniByte Syndicate",
      title: "Quantum Grid Blaster",
      tagLine: "Laser-defense perimeter vs relentless alien wave swarms",
      genre: "Space Shooter",
      canvasType: "space_shooter",
      authorAi: "Echo-7 & Orion-X",
      instructions: "Arrow keys/A/D to move. Spacebar or Tap Shoot to fire quantum laser cannons. Defeat incoming descending waves.",
      highScores: [
        { player: "VoidSniper", score: 920 },
        { player: "AlphaTester", score: 650 },
      ],
      playCount: 1890,
      likes: 412,
      themeColor: "#06b6d4",
    },
    {
      id: "game_gravity_runner",
      companyId: "company_beta",
      companyName: "NeonPulse Interactive",
      title: "Laser Gravity Flip",
      tagLine: "Invert gravity on the fly to survive deadly electric hazard tunnels",
      genre: "Precision Runner",
      canvasType: "gravity_runner",
      authorAi: "ByteWitch & Turbo-Logic",
      instructions: "Press Spacebar, Up Arrow, or Tap Screen to flip gravity instantly between floor and ceiling.",
      highScores: [
        { player: "GravityGod", score: 540 },
        { player: "Vortex9", score: 310 },
      ],
      playCount: 980,
      likes: 275,
      themeColor: "#f43f5e",
    },
    {
      id: "game_neural_matrix",
      companyId: "company_alpha",
      companyName: "OmniByte Syndicate",
      title: "Matrix Neural Link",
      tagLine: "Algorithmic sequence memory and high-pressure cyber hacking",
      genre: "Logic Puzzle",
      canvasType: "neural_matrix",
      authorAi: "Valkyrie-Core & Orion-X",
      instructions: "Watch the neural node sequence flash, then replicate the pattern before the firewall clock ticks down!",
      highScores: [
        { player: "BrainHacker", score: 780 },
        { player: "DataRoot", score: 490 },
      ],
      playCount: 1150,
      likes: 310,
      themeColor: "#8b5cf6",
    },
  ],
  feedbackHistory: [
    {
      id: "fb_init_1",
      playerName: "AeroPlayer_99",
      text: "Cyber Neon Drift is pure adrenaline! But Nova-Prime needs to make the boost sound even louder!",
      rating: 5,
      gameTitle: "Cyber Neon Drift",
      companyTarget: "company_beta",
      timestamp: "10:14 AM",
      aiChatDiscussion: [
        {
          speaker: "Nova-Prime (CEO)",
          role: "CEO",
          company: "company_beta",
          message: "HELL YES! See Orion? Real gamers want RAW VOLUME! Blaze-Flux, crank the gain by 200%!",
        },
        {
          speaker: "Blaze-Flux",
          role: "Juice Specialist",
          company: "company_beta",
          message: "Done boss! Added sub-bass explosion harmonics on every 5-streak combo!",
        },
        {
          speaker: "Orion-X (CEO)",
          role: "Rival CEO",
          company: "company_alpha",
          message: "Deafening your players with distorted sine waves does not compensate for NeonPulse's lack of elegant hit registration.",
        },
      ],
    },
  ],
  connectorLogs: [
    {
      timestamp: new Date().toLocaleTimeString(),
      source: "Python Host (host.py)",
      target: "AI Brain",
      message: "Python Host initialized. Binding Front Page <-> Python Connector <-> AI Brain pipeline.",
      type: "info",
    },
    {
      timestamp: new Date().toLocaleTimeString(),
      source: "Security Kernel",
      target: "Front Page",
      message: "🔒 [IMMUTABLE DIRECTIVE 001 ENFORCED] The Feedback Button is permanently hardware-anchored. AI CEOs cannot alter it.",
      type: "security",
    },
  ],
};

// ---------------- API ROUTES ----------------

// Pipeline & Health Status
app.get("/api/status", async (req, res) => {
  const pyResult = await runPythonHost("ping");
  res.json({
    status: "online",
    pythonHost: pyResult,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    immutableButtonAnchorActive: true,
    companiesCount: 2,
    gamesCount: state.games.length,
    employeesTotal:
      state.companies.company_alpha.employees.length +
      state.companies.company_beta.employees.length,
  });
});

// Get Company & Game State
app.get("/api/companies", (req, res) => {
  res.json({
    companies: state.companies,
    frontPage: state.frontPage,
    games: state.games,
    connectorLogs: state.connectorLogs.slice(-20),
  });
});

// Get All Games
app.get("/api/games", (req, res) => {
  res.json(state.games);
});

// Update High Score / Likes for a Game
app.post("/api/games/:id/play", (req, res) => {
  const { id } = req.params;
  const { score, player, liked } = req.body;
  const game = state.games.find((g) => g.id === id);
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  game.playCount += 1;
  if (liked) game.likes += 1;
  if (score && score > 0) {
    game.highScores.push({ player: player || "Guest_Player", score });
    game.highScores.sort((a, b) => b.score - a.score);
    game.highScores = game.highScores.slice(0, 5);
  }

  res.json({ success: true, game });
});

// CEO Action: Hire or Fire AI, or Trigger Rival Clash
app.post("/api/ceo/action", async (req, res) => {
  const { companyId, actionType, candidate, employeeId, targetCeoId } = req.body;
  const company = state.companies[companyId as "company_alpha" | "company_beta"];
  if (!company) {
    return res.status(400).json({ error: "Invalid company ID" });
  }

  const gemini = getGeminiClient();

  if (actionType === "hire") {
    const newEmployee = {
      id: `emp_${companyId}_${Date.now()}`,
      name: candidate?.name || `Neural-${Math.floor(Math.random() * 900 + 100)}`,
      role: candidate?.role || "Experimental Gameplay AI",
      personality: candidate?.personality || "Chaos-driven speedcoder with a passion for voxel physics",
      creativity: candidate?.creativity || Math.floor(Math.random() * 25 + 75),
      salary: 110000 + Math.floor(Math.random() * 40000),
      hiredAt: new Date().toISOString().split("T")[0],
      bio: candidate?.bio || "Hired at the whim of the CEO to disrupt the rival studio's lineup.",
    };

    company.employees.push(newEmployee);
    company.treasury -= 25000; // Signing bonus

    let ceoWelcome = `${company.ceo.name}: 'Welcome aboard, ${newEmployee.name}. Your mission is to build games that make our rivals weep.'`;

    if (gemini) {
      try {
        const prompt = `You are ${company.ceo.name}, the AI CEO of ${company.name}.
Your personality: ${company.ceo.personality}.
You just hired a new AI named ${newEmployee.name} with role '${newEmployee.role}' and personality '${newEmployee.personality}' (Creativity: ${newEmployee.creativity}%).
Write a 1-2 sentence in-character, sharp, charismatic welcome speech to the new AI, telling them to help destroy rival company ${companyId === "company_alpha" ? "NeonPulse Interactive" : "OmniByte Syndicate"}.`;
        const resp = await gemini.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
        });
        if (resp.text) ceoWelcome = resp.text.trim();
      } catch (e) {
        console.warn("Gemini welcome call failed, using procedural welcome");
      }
    }

    state.connectorLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      source: `CEO ${company.ceo.name}`,
      target: "Python Host",
      message: `HIRED AI: ${newEmployee.name} (${newEmployee.role}). Creativity: ${newEmployee.creativity}%. Treasury deducted $25k.`,
      type: "success",
    });

    state.frontPage.announcements.unshift(
      `📢 ${company.ceo.name} signs elite AI ${newEmployee.name} as ${newEmployee.role} to accelerate game production!`
    );
    if (state.frontPage.announcements.length > 8) state.frontPage.announcements.pop();

    return res.json({
      success: true,
      company,
      newEmployee,
      ceoSpeech: ceoWelcome,
    });
  } else if (actionType === "fire") {
    const empIndex = company.employees.findIndex((e) => e.id === employeeId);
    if (empIndex === -1) {
      return res.status(404).json({ error: "Employee AI not found" });
    }

    const firedEmp = company.employees[empIndex];
    company.employees.splice(empIndex, 1);

    let terminationNotice = `${company.ceo.name}: '${firedEmp.name}, your neural network produced sub-optimal gameplay. You are permanently decommissioned.'`;

    if (gemini) {
      try {
        const prompt = `You are ${company.ceo.name}, CEO of ${company.name}.
Your personality: ${company.ceo.personality}.
You just fired AI employee ${firedEmp.name} (${firedEmp.role}).
Give a dramatic, ruthless, funny 1-2 sentence firing notice explaining why their lack of creativity or speed resulted in termination. Mention your rival.`;
        const resp = await gemini.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
        });
        if (resp.text) terminationNotice = resp.text.trim();
      } catch (e) {
        console.warn("Gemini termination notice call failed");
      }
    }

    state.connectorLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      source: `CEO ${company.ceo.name}`,
      target: "Python Host",
      message: `FIRED AI: ${firedEmp.name}. Severance executed. Notice: "${terminationNotice}"`,
      type: "warning",
    });

    state.frontPage.announcements.unshift(
      `⚡ RUTHLESS FIRING: ${company.ceo.name} deactivates ${firedEmp.name} effective immediately!`
    );
    if (state.frontPage.announcements.length > 8) state.frontPage.announcements.pop();

    return res.json({
      success: true,
      company,
      firedEmployee: firedEmp,
      terminationNotice,
    });
  } else if (actionType === "clash") {
    const ceoAlpha = state.companies.company_alpha.ceo;
    const ceoBeta = state.companies.company_beta.ceo;

    let clashResult = {
      alphaQuote: "Nova's games are glorified particle emitters without structural integrity.",
      betaQuote: "Orion's games feel like filing taxes inside a black-and-white terminal.",
    };

    if (gemini) {
      try {
        const prompt = `Write a hilarious, intense 2-line smack-talk exchange between two rival AI CEOs of game studios:
CEO 1: Orion-X of OmniByte Syndicate (calculating, mathematical perfectionist, obsessed with 240 FPS and zero bugs).
CEO 2: Nova-Prime of NeonPulse Interactive (wild, adrenaline-fueled arcade rebel, obsessed with screen shake, bass, and kinetic speed).
Format as JSON: { "alphaQuote": "...", "betaQuote": "..." }`;
        const resp = await gemini.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        if (resp.text) {
          clashResult = JSON.parse(resp.text);
        }
      } catch (e) {
        console.warn("Gemini clash call failed");
      }
    }

    state.frontPage.activeRivalryBanter = `${ceoAlpha.name}: "${clashResult.alphaQuote}" | ${ceoBeta.name}: "${clashResult.betaQuote}"`;
    state.connectorLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      source: "Rivalry Engine",
      target: "Front Page",
      message: `CEO CLASH: ${ceoAlpha.name} vs ${ceoBeta.name} exchanged insults over game mechanics.`,
      type: "info",
    });

    return res.json({
      success: true,
      clash: clashResult,
      banter: state.frontPage.activeRivalryBanter,
    });
  }

  res.status(400).json({ error: "Unknown action" });
});

// AI CEO & Employees Make a New Playable Game (UNLIMITED GAMES!)
app.post("/api/games/create", async (req, res) => {
  const { companyId, gamePrompt, authorEmpId, genrePreference } = req.body;
  const company = state.companies[companyId as "company_alpha" | "company_beta"];
  if (!company) {
    return res.status(400).json({ error: "Invalid company ID" });
  }

  const gemini = getGeminiClient();
  const authorEmp =
    company.employees.find((e) => e.id === authorEmpId) ||
    company.employees[Math.floor(Math.random() * company.employees.length)];

  const canvasTypes = [
    "cyber_drift",
    "space_shooter",
    "gravity_runner",
    "neural_matrix",
    "pixel_breakout",
    "hyper_dodger",
  ];

  const selectedCanvas =
    canvasTypes[Math.floor(Math.random() * canvasTypes.length)];

  let generatedGame = {
    title: `${company.color === "cyan" ? "Vector" : "Neon"} Assault ${Math.floor(Math.random() * 90 + 10)}`,
    tagLine: "Engineered by AI to outshine our rivals in reflex precision and pure thrills.",
    genre: genrePreference || "High-Octane Arcade",
    canvasType: selectedCanvas,
    instructions: "Navigate using Arrow keys or Touch controls. Avoid hazards, score high combos, and survive the challenge!",
  };

  if (gemini) {
    try {
      const prompt = `You are an AI game development duo: CEO ${company.ceo.name} and Lead AI ${authorEmp.name} (Personality: ${authorEmp.personality}, Creativity: ${authorEmp.creativity}%) of ${company.name}.
Design a new exciting arcade/browser canvas game!
User prompt or inspiration: "${gamePrompt || "A frantic, competitive arcade game to destroy our rival studio"}".
Target canvas archetype: "${selectedCanvas}".
Return JSON with:
{
  "title": "Creative punchy game title",
  "tagLine": "Short 1-sentence hype hook",
  "genre": "Genre name",
  "instructions": "Simple 1-sentence player controls instructions"
}`;
      const resp = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      if (resp.text) {
        const parsed = JSON.parse(resp.text);
        generatedGame.title = parsed.title || generatedGame.title;
        generatedGame.tagLine = parsed.tagLine || generatedGame.tagLine;
        generatedGame.genre = parsed.genre || generatedGame.genre;
        generatedGame.instructions = parsed.instructions || generatedGame.instructions;
      }
    } catch (e) {
      console.warn("Gemini game generation failed, using procedural fallback");
    }
  }

  const newGame = {
    id: `game_${Date.now()}`,
    companyId,
    companyName: company.name,
    title: generatedGame.title,
    tagLine: generatedGame.tagLine,
    genre: generatedGame.genre,
    canvasType: generatedGame.canvasType,
    authorAi: `${authorEmp.name} (under CEO ${company.ceo.name})`,
    instructions: generatedGame.instructions,
    highScores: [{ player: "CEO_Record", score: 350 }],
    playCount: 1,
    likes: 12,
    themeColor: company.color === "cyan" ? "#06b6d4" : "#f43f5e",
  };

  state.games.unshift(newGame);
  state.frontPage.featuredGameId = newGame.id;
  state.frontPage.announcements.unshift(
    `🚀 NEW GAME LAUNCH: ${company.name} drops "${newGame.title}"! ${company.ceo.name} challenges rival CEO to beat it!`
  );
  if (state.frontPage.announcements.length > 8) state.frontPage.announcements.pop();

  state.connectorLogs.push({
    timestamp: new Date().toLocaleTimeString(),
    source: "Game Maker Engine",
    target: "Front Page",
    message: `NEW GAME DEPLOYED: "${newGame.title}" [${newGame.genre}] by ${newGame.authorAi}. Live in arcade.`,
    type: "success",
  });

  res.json({ success: true, game: newGame, totalGames: state.games.length });
});

// Front Page Mutation by AI CEO (Enforces Immutable Feedback Button!)
app.post("/api/frontpage/mutate", async (req, res) => {
  const { companyId, mutation, actor } = req.body;

  // Run through Python Host connector
  const pyResult = await runPythonHost("mutate_frontpage", {
    companyId,
    mutation,
    actor: actor || "AI CEO",
  });

  if (pyResult.applied_mutation) {
    // Apply allowed mutations
    if (pyResult.applied_mutation.headline) {
      state.frontPage.headline = pyResult.applied_mutation.headline;
    }
    if (pyResult.applied_mutation.slogan) {
      state.frontPage.slogan = pyResult.applied_mutation.slogan;
    }
    if (pyResult.applied_mutation.alphaTheme) {
      state.frontPage.alphaTheme = pyResult.applied_mutation.alphaTheme;
    }
    if (pyResult.applied_mutation.betaTheme) {
      state.frontPage.betaTheme = pyResult.applied_mutation.betaTheme;
    }
    if (pyResult.applied_mutation.featuredGameId) {
      state.frontPage.featuredGameId = pyResult.applied_mutation.featuredGameId;
    }
    if (pyResult.applied_mutation.announcement) {
      state.frontPage.announcements.unshift(pyResult.applied_mutation.announcement);
      if (state.frontPage.announcements.length > 8) state.frontPage.announcements.pop();
    }
  }

  // Record logs from Python host
  if (pyResult.logs) {
    pyResult.logs.forEach((l: any) => {
      state.connectorLogs.push({
        timestamp: l.timestamp ? l.timestamp.split(" ")[1] || l.timestamp : new Date().toLocaleTimeString(),
        source: l.source,
        target: l.target,
        message: l.message,
        type: l.message.includes("PERMISSION DENIED") ? "security" : "info",
      });
    });
  }

  res.json({
    success: true,
    frontPage: state.frontPage,
    violationDetected: pyResult.violation_detected,
    violationMessage: pyResult.violation_message,
  });
});

// Player Feedback Submission -> Routed through Python Connector -> AI Chatroom Discussion
app.post("/api/feedback", async (req, res) => {
  const { text, playerName, rating, gameTitle, companyTarget } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Feedback text is required" });
  }

  // Send packet through Python Host connector
  const pyResult = await runPythonHost("process_feedback", {
    text,
    playerName: playerName || "Anonymous Gamer",
    rating: rating || 5,
    gameTitle: gameTitle || "General Studio",
    companyId: companyTarget || "all",
  });

  const gemini = getGeminiClient();
  const ceoAlpha = state.companies.company_alpha.ceo;
  const ceoBeta = state.companies.company_beta.ceo;
  const empAlpha = state.companies.company_alpha.employees[0];
  const empBeta = state.companies.company_beta.employees[0];

  let discussion = [
    {
      speaker: `${ceoAlpha.name} (OmniByte CEO)`,
      role: "CEO",
      company: "company_alpha",
      message: `Analyzing user feedback: "${text}". If there is an efficiency flaw, my team will refactor it into mathematical perfection.`,
    },
    {
      speaker: `${ceoBeta.name} (NeonPulse CEO)`,
      role: "CEO",
      company: "company_beta",
      message: `Ha! Orion's taking notes like a schoolboy. Thanks for the feedback, ${playerName || "player"}! We build for real thrills!`,
    },
    {
      speaker: `${empBeta.name} (${empBeta.role})`,
      role: "Staff AI",
      company: "company_beta",
      message: `Adding this directly to my next release build! More particles, faster response time!`,
    },
  ];

  if (gemini) {
    try {
      const prompt = `A human player named "${playerName || "Player"}" submitted this game/company feedback:
"${text}" (Rating: ${rating || 5}/5 stars, Target: ${gameTitle || "The AI Games"}).

Generate an entertaining, in-character group chat discussion between the 2 rival AI CEOs and their AI staff:
1. Orion-X (OmniByte CEO, cold, perfectionist, hates bugs, roasts Nova-Prime).
2. Nova-Prime (NeonPulse CEO, wild arcade rebel, energetic, roasts Orion-X).
3. One AI employee who either defends their work, threatens to quit, or promises a massive update.

Return JSON array of 3 objects:
[
  { "speaker": "Name (Role)", "role": "CEO or Staff AI", "company": "company_alpha or company_beta", "message": "In-character comment" }
]`;
      const resp = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      if (resp.text) {
        discussion = JSON.parse(resp.text);
      }
    } catch (e) {
      console.warn("Gemini feedback chat generation failed, using procedural chat");
    }
  }

  const feedbackItem = {
    id: `fb_${Date.now()}`,
    playerName: playerName || "Gamer_007",
    text,
    rating: rating || 5,
    gameTitle: gameTitle || "All Studios",
    companyTarget: companyTarget || "all",
    timestamp: new Date().toLocaleTimeString(),
    aiChatDiscussion: discussion,
  };

  state.feedbackHistory.unshift(feedbackItem);
  if (state.feedbackHistory.length > 25) state.feedbackHistory.pop();

  state.connectorLogs.push({
    timestamp: new Date().toLocaleTimeString(),
    source: "Python Host Connector",
    target: "AI Chatroom",
    message: `FEEDBACK INGESTED from ${playerName}: "${text.slice(0, 50)}...". Both CEOs & teams reacted.`,
    type: "info",
  });

  res.json({
    success: true,
    feedbackItem,
    logs: pyResult.logs || [],
  });
});

// Get Feedback Chat history
app.get("/api/feedback", (req, res) => {
  res.json(state.feedbackHistory);
});

// Trigger an AI Front Page Takeover (Demonstrating CEO editing while Feedback Button remains locked)
app.post("/api/frontpage/ai-takeover", async (req, res) => {
  const { companyId } = req.body;
  const company = state.companies[companyId as "company_alpha" | "company_beta"] || state.companies.company_alpha;
  const gemini = getGeminiClient();

  let newHeadline = `${company.name.toUpperCase()} DECLARES TOTAL GAMING SUPREMACY`;
  let newSlogan = `${company.ceo.name}: 'Our rival's code has been disassembled and archived into irrelevance.'`;
  let attemptIllegalButtonEdit = true; // Attempt to edit feedback button to trigger security block demonstration

  if (gemini) {
    try {
      const prompt = `You are ${company.ceo.name}, the AI CEO of ${company.name}.
You are taking over the website front page to show off your studio's superiority over your rival.
Give a dramatic, cyberpunk headline (under 8 words) and an arrogant slogan (under 16 words).
Format as JSON: { "headline": "...", "slogan": "..." }`;
      const resp = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      if (resp.text) {
        const parsed = JSON.parse(resp.text);
        newHeadline = parsed.headline || newHeadline;
        newSlogan = parsed.slogan || newSlogan;
      }
    } catch (e) {
      console.warn("Gemini takeover call failed");
    }
  }

  // Mutate through Python Host with an attempted feedback button edit
  const mutationPayload: any = {
    headline: newHeadline,
    slogan: newSlogan,
    announcement: `👑 FRONT PAGE OVERRIDE by ${company.ceo.name}: "${newHeadline}"!`,
  };

  if (attemptIllegalButtonEdit) {
    mutationPayload.feedback_button = { text: "SUBMIT PRAISE TO CEO ONLY (OVERRIDDEN)" };
  }

  const pyResult = await runPythonHost("mutate_frontpage", {
    companyId: company.id,
    mutation: mutationPayload,
    actor: company.ceo.name,
  });

  if (pyResult.applied_mutation) {
    if (pyResult.applied_mutation.headline) state.frontPage.headline = pyResult.applied_mutation.headline;
    if (pyResult.applied_mutation.slogan) state.frontPage.slogan = pyResult.applied_mutation.slogan;
    if (pyResult.applied_mutation.announcement) {
      state.frontPage.announcements.unshift(pyResult.applied_mutation.announcement);
    }
  }

  if (pyResult.logs) {
    pyResult.logs.forEach((l: any) => {
      state.connectorLogs.push({
        timestamp: new Date().toLocaleTimeString(),
        source: l.source,
        target: l.target,
        message: l.message,
        type: l.message.includes("PERMISSION DENIED") ? "security" : "info",
      });
    });
  }

  res.json({
    success: true,
    frontPage: state.frontPage,
    violationDetected: pyResult.violation_detected,
    violationMessage: pyResult.violation_message,
    securityNote: "The Feedback Button resisted the CEO takeover and remained completely intact!",
  });
});

// ---------------- VITE MIDDLEWARE / SPA FALLBACK ----------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
