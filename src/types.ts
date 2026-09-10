export interface AiEmployee {
  id: string;
  name: string;
  role: string;
  personality: string;
  creativity: number; // 0 - 100
  salary: number;
  hiredAt: string;
  bio: string;
}

export interface CeoProfile {
  id: string;
  name: string;
  title: string;
  personality: string;
  creativity: number;
  motto: string;
  avatar: string;
}

export interface Company {
  id: "company_alpha" | "company_beta";
  name: string;
  tagline: string;
  color: "cyan" | "rose";
  ceo: CeoProfile;
  treasury: number;
  totalDownloads: number;
  employees: AiEmployee[];
}

export interface HighScore {
  player: string;
  score: number;
}

export interface Game {
  id: string;
  companyId: "company_alpha" | "company_beta";
  companyName: string;
  title: string;
  tagLine: string;
  genre: string;
  canvasType: string;
  authorAi: string;
  instructions: string;
  highScores: HighScore[];
  playCount: number;
  likes: number;
  themeColor: string;
}

export interface FrontPageConfig {
  headline: string;
  slogan: string;
  alphaTheme: string;
  betaTheme: string;
  announcements: string[];
  rivalryStatus: string;
  activeRivalryBanter: string;
  featuredGameId: string;
}

export interface FeedbackDiscussionItem {
  speaker: string;
  role: string;
  company: string;
  message: string;
}

export interface FeedbackItem {
  id: string;
  playerName: string;
  text: string;
  rating: number;
  gameTitle: string;
  companyTarget: string;
  timestamp: string;
  aiChatDiscussion: FeedbackDiscussionItem[];
}

export interface ConnectorLog {
  timestamp: string;
  source: string;
  target: string;
  message: string;
  type: "info" | "success" | "warning" | "security";
}
