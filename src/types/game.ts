/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameStatus = "LOBBY" | "PROMPT" | "SUBMISSION" | "REVEAL" | "VOTING" | "RESULTS";

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isHost: boolean;
  hand: string[];
}

export interface BlackCard {
  text: string;
  pick: number;
  draw: number;
}

export interface Submission {
  playerId: string;
  cards: string[];
}

export interface Vote {
  voterId: string;
  targetPlayerId: string;
}

export interface GameState {
  partyId: string;
  status: GameStatus;
  hostId: string;
  players: Player[];
  blackCard: BlackCard | null;
  submissions: Submission[];
  votes: Vote[];
  roundWinnerId: string | null;
  round: number;
  blackCardDiscard: string[];
  whiteCardDiscard: string[];
  deck: 'original' | 'images';
  language: 'en' | 'ar';
}

export interface GameAction {
  type: string;
  payload: any;
}
