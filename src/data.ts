/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, GravityChamber, DailyMission, BattleBoss } from './types';

export const CHARACTERS: Character[] = [
  {
    id: 'goku',
    name: 'Son Goku',
    description: 'The legendary Saiyan raised on Earth, always seeking to exceed his limits.',
    baseBP: 10,
    cost: 0,
    unlockedByDefault: true,
    transformations: [
      { id: 'goku_base', name: 'Base Form', bpMultiplier: 1, threshold: 0, color: 'text-amber-500', particlesColor: 'rgba(245, 158, 11, 0.5)', title: 'Earthling Trainer' },
      { id: 'goku_kaioken', name: 'Kaio-Ken x20', bpMultiplier: 2.5, threshold: 100, color: 'text-red-500 font-bold animate-pulse', particlesColor: 'rgba(239, 68, 68, 0.7)', title: 'Kaioken Elite' },
      { id: 'goku_ssj', name: 'Super Saiyan', bpMultiplier: 5, threshold: 500, color: 'text-yellow-400 font-bold', particlesColor: 'rgba(250, 204, 21, 0.8)', title: 'Saiyan Legend' },
      { id: 'goku_ssj3', name: 'Super Saiyan 3', bpMultiplier: 10, threshold: 1500, color: 'text-yellow-300 font-black', particlesColor: 'rgba(253, 224, 71, 0.9)', title: 'Limit Breaker' },
      { id: 'goku_ssg', name: 'Super Saiyan God', bpMultiplier: 25, threshold: 4000, color: 'text-rose-500 font-extrabold', particlesColor: 'rgba(244, 63, 94, 0.8)', title: 'Godly Acolyte' },
      { id: 'goku_ssb', name: 'Super Saiyan Blue', bpMultiplier: 60, threshold: 10000, color: 'text-cyan-400 font-black', particlesColor: 'rgba(34, 211, 238, 0.9)', title: 'Divine Saiyan' },
      { id: 'goku_ui', name: 'Ultra Instinct', bpMultiplier: 150, threshold: 25000, color: 'text-slate-100 font-black tracking-widest', particlesColor: 'rgba(241, 245, 249, 1)', title: 'Angel-Level Master' }
    ]
  },
  {
    id: 'vegeta',
    name: 'Vegeta',
    description: 'The proud Prince of all Saiyans, refuses to be outdone by Kakarot.',
    baseBP: 12,
    cost: 150,
    unlockedByDefault: false,
    transformations: [
      { id: 'vegeta_base', name: 'Base Form', bpMultiplier: 1, threshold: 0, color: 'text-blue-500', particlesColor: 'rgba(59, 130, 246, 0.5)', title: 'Saiyan Prince' },
      { id: 'vegeta_ssj', name: 'Super Saiyan', bpMultiplier: 5, threshold: 500, color: 'text-yellow-400 font-bold', particlesColor: 'rgba(250, 204, 21, 0.8)', title: 'Super Saiyan Prince' },
      { id: 'vegeta_ssj2', name: 'Super Saiyan 2', bpMultiplier: 8, threshold: 1200, color: 'text-yellow-300 font-bold animate-pulse', particlesColor: 'rgba(253, 224, 71, 0.9)', title: 'Majin Awakened' },
      { id: 'vegeta_ssb', name: 'Super Saiyan Blue', bpMultiplier: 65, threshold: 9500, color: 'text-cyan-400 font-black', particlesColor: 'rgba(34, 211, 238, 0.9)', title: 'Divine Elite' },
      { id: 'vegeta_ue', name: 'Ultra Ego', bpMultiplier: 140, threshold: 24000, color: 'text-fuchsia-600 font-black tracking-wide', particlesColor: 'rgba(192, 38, 211, 1)', title: 'God of Destruction Candidate' }
    ]
  },
  {
    id: 'gohan',
    name: 'Son Gohan',
    description: 'A scholar who harbors incredible deep, dormant rage-powered strength.',
    baseBP: 8,
    cost: 100,
    unlockedByDefault: false,
    transformations: [
      { id: 'gohan_base', name: 'Base Form', bpMultiplier: 1, threshold: 0, color: 'text-orange-500', particlesColor: 'rgba(249, 115, 22, 0.4)', title: 'Timid Scholar' },
      { id: 'gohan_ssj2', name: 'Super Saiyan 2', bpMultiplier: 9, threshold: 800, color: 'text-yellow-300 font-black animate-pulse', particlesColor: 'rgba(253, 224, 71, 0.95)', title: 'Cell Games Avenger' },
      { id: 'gohan_ultimate', name: 'Ultimate Gohan', bpMultiplier: 35, threshold: 5000, color: 'text-purple-400 font-bold', particlesColor: 'rgba(192, 132, 252, 0.8)', title: 'Potential Unlocked' },
      { id: 'gohan_beast', name: 'Gohan Beast', bpMultiplier: 145, threshold: 23000, color: 'text-rose-200 font-black tracking-wider animate-pulse', particlesColor: 'rgba(244, 204, 211, 1)', title: 'Primal Rage God' }
    ]
  },
  {
    id: 'trunks',
    name: 'Future Trunks',
    description: 'A grim survivor from a ruined future, wielding a legendary sword.',
    baseBP: 9,
    cost: 120,
    unlockedByDefault: false,
    transformations: [
      { id: 'trunks_base', name: 'Base Form', bpMultiplier: 1, threshold: 0, color: 'text-purple-500', particlesColor: 'rgba(168, 85, 247, 0.4)', title: 'Future Survivor' },
      { id: 'trunks_ssj', name: 'Super Saiyan', bpMultiplier: 5, threshold: 500, color: 'text-yellow-400 font-bold', particlesColor: 'rgba(250, 204, 21, 0.8)', title: 'Time Traveler' },
      { id: 'trunks_rage', name: 'Super Saiyan Rage', bpMultiplier: 45, threshold: 6000, color: 'text-amber-300 font-black', particlesColor: 'rgba(217, 119, 6, 0.9)', title: 'Sword of Hope Wielder' }
    ]
  },
  {
    id: 'piccolo',
    name: 'Piccolo',
    description: 'Wise Namekian master and tactician, dedicated to extreme meditation.',
    baseBP: 7,
    cost: 80,
    unlockedByDefault: false,
    transformations: [
      { id: 'piccolo_base', name: 'Base Form', bpMultiplier: 1, threshold: 0, color: 'text-emerald-500', particlesColor: 'rgba(16, 185, 129, 0.4)', title: 'Namekian Hermit' },
      { id: 'piccolo_kami', name: 'Fused with Kami', bpMultiplier: 4, threshold: 300, color: 'text-emerald-400 font-semibold', particlesColor: 'rgba(52, 211, 153, 0.6)', title: 'Unified Namek' },
      { id: 'piccolo_orange', name: 'Orange Piccolo', bpMultiplier: 80, threshold: 12000, color: 'text-orange-600 font-extrabold', particlesColor: 'rgba(234, 88, 12, 1)', title: 'Demon Clan Awakening' }
    ]
  }
];

export const GRAVITY_CHAMBERS: GravityChamber[] = [
  {
    id: 'earth',
    name: 'Capsule Corp Backyard',
    description: 'Normal Earth gravity. Good for conditioning and warming up.',
    gravityFactor: 1,
    multiplier: 1.0,
    cost: 0,
    backgroundClass: 'bg-gradient-to-b from-sky-900 to-emerald-990 border-emerald-800'
  },
  {
    id: 'king_kai',
    name: 'King Kai\'s Planet',
    description: 'Small planet with 10x Earth gravity. Training under King Kai himself!',
    gravityFactor: 10,
    multiplier: 1.5,
    cost: 150,
    backgroundClass: 'bg-gradient-to-b from-blue-950 to-amber-950 border-amber-800'
  },
  {
    id: 'gravity_100',
    name: 'Spaceship Gravity Chamber',
    description: 'Built by Dr. Briefs with adjustable gravity up to 100x Earth.',
    gravityFactor: 100,
    multiplier: 2.5,
    cost: 500,
    backgroundClass: 'bg-gradient-to-b from-slate-900 to-zinc-950 border-zinc-700'
  },
  {
    id: 'hyperbolic',
    name: 'Hyperbolic Time Chamber',
    description: 'A silent void of white space. A year in the chamber is just a day outside. x500 Gravity.',
    gravityFactor: 500,
    multiplier: 4.5,
    cost: 1200,
    backgroundClass: 'bg-gradient-to-b from-zinc-800 to-stone-900 border-stone-600'
  },
  {
    id: 'whis_realm',
    name: 'Whis\'s Pocket Dimension',
    description: 'Gravity is so dense, a single step is a monumental effort. x1000 Gravity.',
    gravityFactor: 1000,
    multiplier: 8.0,
    cost: 3000,
    backgroundClass: 'bg-gradient-to-b from-indigo-950 to-fuchsia-950 border-orchid-700'
  }
];

export const DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'm1',
    title: 'Kai\'s Morning Warmup',
    description: 'Perform a single set of at least 15 push-ups',
    targetReps: 15,
    rewardZPoints: 40,
    completed: false
  },
  {
    id: 'm2',
    title: 'Gravity Endurer',
    description: 'Accumulate a total of 50 progress reps today',
    targetReps: 50,
    rewardZPoints: 80,
    completed: false
  },
  {
    id: 'm3',
    title: 'Break the Shell',
    description: 'Log and save at least 3 separate push up sets today',
    targetReps: 3, // mapped to set counts
    rewardZPoints: 60,
    completed: false
  },
  {
    id: 'm4',
    title: 'Senzu Bean Powerup',
    description: 'Do push-ups in any 10x+ Gravity chamber',
    targetReps: 1, // binary tracker
    rewardZPoints: 50,
    completed: false
  }
];

export const BATTLE_BOSSES: BattleBoss[] = [
  {
    id: 'raditz',
    name: 'Raditz',
    maxHp: 200,
    currentHp: 200,
    bpRequired: 20,
    rewardZPoints: 50,
    flavorText: 'An invading Saiyan warrior searching for his brother. "Your power level is only 5!"'
  },
  {
    id: 'nappa',
    name: 'Nappa',
    maxHp: 600,
    currentHp: 600,
    bpRequired: 150,
    rewardZPoints: 120,
    flavorText: 'A massive brute who terrorized Earth\'s protectors. "Vegeta, what does the scouter say?!"'
  },
  {
    id: 'vegeta_boss',
    name: 'Elite Prince Vegeta',
    maxHp: 1500,
    currentHp: 1500,
    bpRequired: 600,
    rewardZPoints: 250,
    flavorText: 'The ruthless prince of Saiyans, charging his Galick Gun to vaporize the Earth!'
  },
  {
    id: 'frieza',
    name: 'Lord Frieza (100% Power)',
    maxHp: 4000,
    currentHp: 4000,
    bpRequired: 2000,
    rewardZPoints: 500,
    flavorText: 'The emperor of space, threatening to blow up Planet Namek. "I will show you my absolute terror!"'
  },
  {
    id: 'cell',
    name: 'Perfect Cell',
    maxHp: 10000,
    currentHp: 10000,
    bpRequired: 7000,
    rewardZPoints: 1000,
    flavorText: 'The ultimate bio-android who declared the Cell Games. "Entertain me before I destroy everything."'
  },
  {
    id: 'majin_buu',
    name: 'Kid Buu',
    maxHp: 25000,
    currentHp: 25000,
    bpRequired: 15000,
    rewardZPoints: 2000,
    flavorText: 'The pink, chaotic manifestation of pure evil. Regulates health instantly unless hit with a high-rep set.'
  },
  {
    id: 'jiren',
    name: 'Jiren the Grey',
    maxHp: 60000,
    currentHp: 60000,
    bpRequired: 40000,
    rewardZPoints: 5000,
    flavorText: 'A solitary force of absolute power from Universe 11. "Power is everything." '
  },
  {
    id: 'beerus',
    name: 'Lord Beerus',
    maxHp: 150000,
    currentHp: 150000,
    bpRequired: 100000,
    rewardZPoints: 10000,
    flavorText: 'The God of Destruction of Universe 7. "Do you have what it takes to survive my Hakai?"'
  }
];
