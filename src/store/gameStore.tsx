/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { GameState, GameStatus, Player, Submission, Vote } from '../types/game';
import { BLACK_CARDS, WHITE_CARDS } from '../data/cards';
import { IMAGE_BLACK_CARDS, IMAGE_WHITE_CARDS } from '../data/imageCards';
import { BLACK_CARDS_AR, WHITE_CARDS_AR } from '../data/cardsAr';
import { IMAGE_BLACK_CARDS_AR, IMAGE_WHITE_CARDS_AR } from '../data/imageCardsAr';

const INITIAL_HAND_SIZE = 10;

const initialState: GameState = {
  partyId: '',
  status: 'LOBBY',
  hostId: '',
  players: [],
  blackCard: null,
  submissions: [],
  votes: [],
  roundWinnerId: null,
  round: 1,
  blackCardDiscard: [],
  whiteCardDiscard: [],
  deck: 'original',
  language: 'en',
};

type Action =
  | { type: 'SYNC_STATE'; payload: GameState }
  | { type: 'RESET_GAME' };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SYNC_STATE':
      return action.payload;
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  joinParty: (partyId: string, player: Player, initLanguage?: 'en' | 'ar') => void;
  startGame: () => void;
  deployCard: (playerId: string, cards: string[]) => void;
  voteCard: (voterId: string, targetPlayerId: string) => void;
  nextRound: () => void;
  resetGame: () => void;
  setDeck: (deck: 'original' | 'images') => void;
  setLanguage: (lang: 'en' | 'ar') => void;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const fetchState = useCallback(async (partyId: string) => {
    try {
      const res = await fetch(`/api/game/${partyId}`);
      if (!res.ok) {
        if (res.status === 404) return; // Silent for 404
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const text = await res.text();
      if (!text) return;
      const data = JSON.parse(text);
      if (data && !data.error) {
        dispatch({ type: 'SYNC_STATE', payload: data });
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  }, []);

  // Polling for real-time updates
  useEffect(() => {
    if (!state.partyId) return;
    const interval = setInterval(() => fetchState(state.partyId), 1000);
    return () => clearInterval(interval);
  }, [state.partyId, fetchState]);

  const sendAction = async (partyId: string, action: any) => {
    try {
      const res = await fetch(`/api/game/${partyId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const text = await res.text();
      if (!text) return;
      const newState = JSON.parse(text);
      if (newState && !newState.error) {
        dispatch({ type: 'SYNC_STATE', payload: newState });
      } else if (newState?.error) {
        console.error("Server Action Error:", newState.error);
      }
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  const setDeck = useCallback((deck: 'original' | 'images') => {
    sendAction(state.partyId, { type: 'SET_DECK', payload: { deck } });
  }, [state.partyId]);

  const setLanguage = useCallback((language: 'en' | 'ar') => {
    if (state.partyId) {
      sendAction(state.partyId, { type: 'SET_LANGUAGE', payload: { language } });
    } else {
      dispatch({ type: 'SYNC_STATE', payload: { ...state, language } });
    }
  }, [state]);

  const joinParty = useCallback((partyId: string, player: Player, initLanguage?: 'en' | 'ar') => {
    sendAction(partyId, { type: 'JOIN_PARTY', payload: { partyId, player, language: initLanguage || state.language } });
  }, [state.language]);

  const startGame = useCallback(() => {
    const isImages = state.deck === 'images';
    const isArabic = state.language === 'ar';
    
    let blackCards = isImages ? IMAGE_BLACK_CARDS : BLACK_CARDS;
    let whiteCards = isImages ? IMAGE_WHITE_CARDS : WHITE_CARDS;

    if (isArabic) {
      blackCards = isImages ? IMAGE_BLACK_CARDS_AR : BLACK_CARDS_AR;
      whiteCards = isImages ? (IMAGE_WHITE_CARDS_AR as any) : WHITE_CARDS_AR;
    }

    const availableBlack = blackCards.filter((c: any) => !state.blackCardDiscard.includes(c.text));
    const chosenBlack = availableBlack[Math.floor(Math.random() * availableBlack.length)];

    const allNewWhite: string[] = [];
    const updatedPlayers = state.players.map(p => {
      const availableWhite = whiteCards.filter((c: any) => !state.whiteCardDiscard.includes(c.text || c) && !p.hand.includes(c.text || c) && !allNewWhite.includes(c.text || c));
      const hand = [];
      const deck = [...availableWhite];
      // Use 10 for INITIAL_HAND_SIZE
      for (let i = 0; i < 10; i++) {
        if (deck.length > 0) {
          const idx = Math.floor(Math.random() * deck.length);
          const card = deck.splice(idx, 1)[0];
          const cardText = typeof card === 'string' ? card : (card as any).text;
          hand.push(cardText);
          allNewWhite.push(cardText);
        }
      }
      return { ...p, hand };
    });

    sendAction(state.partyId, { 
      type: 'START_GAME', 
      payload: { 
        blackCard: chosenBlack, 
        players: updatedPlayers,
        whiteCardDiscard: [...state.whiteCardDiscard, ...allNewWhite]
      } 
    });
  }, [state]);

  const deployCard = useCallback((playerId: string, cards: string[]) => {
    sendAction(state.partyId, { type: 'DEPLOY_CARD', payload: { playerId, cards } });
  }, [state.partyId]);

  const voteCard = useCallback((voterId: string, targetPlayerId: string) => {
    sendAction(state.partyId, { type: 'VOTE_CARD', payload: { voterId, targetPlayerId } });
  }, [state.partyId]);

  const nextRound = useCallback(() => {
    const isImages = state.deck === 'images';
    const isArabic = state.language === 'ar';

    let blackCards = isImages ? IMAGE_BLACK_CARDS : BLACK_CARDS;
    let whiteCards = isImages ? IMAGE_WHITE_CARDS : WHITE_CARDS;

    if (isArabic) {
      blackCards = isImages ? IMAGE_BLACK_CARDS_AR : BLACK_CARDS_AR;
      whiteCards = isImages ? (IMAGE_WHITE_CARDS_AR as any) : WHITE_CARDS_AR;
    }

    const availableBlack = blackCards.filter((c: any) => !state.blackCardDiscard.includes(c.text));
    const chosenBlack = availableBlack[Math.floor(Math.random() * availableBlack.length)];

    // All currently held cards and previously drawn cards are "occupied" (discarded)
    const occupiedWhite = [...state.whiteCardDiscard, ...state.players.flatMap(p => p.hand)];
    let availableWhite = whiteCards.filter((c: any) => !occupiedWhite.includes(c.text || c));

    const allNewWhite: string[] = [];
    const updatedPlayers = state.players.map(p => {
      const drawnCards = [];
      const currentDeck = availableWhite.filter((c: any) => !allNewWhite.includes(c.text || c));
      
      // Draw 10 completely new cards
      for (let i = 0; i < 10; i++) {
        if (currentDeck.length > 0) {
          const idx = Math.floor(Math.random() * currentDeck.length);
          const card = currentDeck.splice(idx, 1)[0];
          const cardText = typeof card === 'string' ? card : (card as any).text;
          drawnCards.push(cardText);
          allNewWhite.push(cardText);
        }
      }
      
      return { ...p, hand: drawnCards };
    });

    sendAction(state.partyId, { 
      type: 'NEXT_ROUND', 
      payload: { 
        blackCard: chosenBlack, 
        players: updatedPlayers,
        whiteCardDiscard: [...occupiedWhite, ...allNewWhite]
      } 
    });
  }, [state]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return (
    <GameContext.Provider value={{ state, joinParty, startGame, deployCard, voteCard, nextRound, resetGame, setDeck, setLanguage }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}
