/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PushUpSession {
  id: string;
  timestamp: string; // ISO date string
  reps: number;
  chamberId: string;
  restTimeSec: number;
}

export interface Transformation {
  id: string;
  name: string;
  bpMultiplier: number;
  threshold: number; // BP / Total Reps required
  color: string; // Tailwind text color class
  particlesColor: string; // Tailwind shadow/background class
  title: string; // Display rank title
}

export interface Character {
  id: string;
  name: string;
  description: string;
  baseBP: number;
  cost: number;
  unlockedByDefault: boolean;
  transformations: Transformation[];
}

export interface GravityChamber {
  id: string;
  name: string;
  description: string;
  gravityFactor: number; // e.g. 1, 10, 50, 100
  multiplier: number; // XP/BP multiplier
  cost: number;
  backgroundClass: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  targetReps: number;
  rewardZPoints: number;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  characterId: string;
  currentGravityId: string;
  zPoints: number;
  battlePower: number;
  unlockedCharacterIds: string[];
  unlockedGravityIds: string[];
  history: PushUpSession[];
  dailyTarget: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  reminderIntervalMin: number;
  soundEnabled: boolean;
  theme: 'dark' | 'light';
  syncStatus: 'synced' | 'unsynced' | 'syncing';
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  characterId: string;
  transformationName: string;
  battlePower: number;
  totalPushUps: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface BattleBoss {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  bpRequired: number;
  rewardZPoints: number;
  flavorText: string;
}

export interface BattleLobby {
  id: string;
  name: string;
  players: {
    id: string;
    name: string;
    characterId: string;
    repsDone: number;
    bp: number;
    isReady: boolean;
  }[];
  bossHp: number;
  bossMaxHp: number;
  status: 'lobby' | 'fighting' | 'won' | 'lost';
  timerSec: number;
}
