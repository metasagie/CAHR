/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { useGame } from '../store/gameStore';

const BOT_NAMES = ['Stinky Pete', 'Booger Boy', 'Fart Master', 'Snotty Scotty', 'Puke Princess', 'Diar-Rhea'];
const BOT_EMOJIS = ['🧟', '🧟‍♂️', '🧟‍♀️', '👻', '👽', '🤖'];

export function useBots(localPlayerId: string) {
  const { state, joinParty, deployCard, voteCard, startGame } = useGame();
  const botInterval = useRef<NodeJS.Timeout | null>(null);

  const botsAdded = useRef(false);

  // Auto-add bots if user is host and alone in lobby (for demo purposes)
  useEffect(() => {
    // Only run if we are the host and there's currently only one player (us)
    // and we haven't already added bots
    if (state.status === 'LOBBY' && state.hostId === localPlayerId && state.players.length === 1 && !botsAdded.current) {
      botsAdded.current = true;
      const botsToId = ['bot_0', 'bot_1', 'bot_2'];
      
      const timer = setTimeout(() => {
        // Send all join requests
        botsToId.forEach((id, i) => {
          joinParty(state.partyId, {
            id,
            name: BOT_NAMES[i],
            avatar: BOT_EMOJIS[i % BOT_EMOJIS.length],
            score: 0,
            isHost: false,
            hand: [],
          });
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [state.status, state.partyId, state.hostId, state.players.length, localPlayerId, joinParty]);

  // Bot submissions
  useEffect(() => {
    if (state.status === 'SUBMISSION') {
      const bots = state.players.filter(p => p.id.startsWith('bot_'));
      bots.forEach(bot => {
        const alreadySubmitted = state.submissions.some(s => s.playerId === bot.id);
        if (!alreadySubmitted) {
          const timer = setTimeout(() => {
            // Bots don't have "real" hands in the store logic (they are simplified)
            // But we can just pick a random card from the deck for them
            // In a real server-side game this would be better
            const whiteCards = [
              "A cloud that rains diarrhea.",
              "A Pokémon named 'Jim'.",
              "Sucking at life.",
              "A burrito smoothie.",
              "Hot, juicy broccoli farts.",
              "Taking a dump in the backyard and blaming it on the dog."
            ];
            const randomCard = whiteCards[Math.floor(Math.random() * whiteCards.length)];
            deployCard(bot.id, randomCard);
          }, 2000 + Math.random() * 5000);
          return () => clearTimeout(timer);
        }
      });
    }
  }, [state.status, state.submissions, state.players, deployCard]);

  // Bot votes
  useEffect(() => {
    if (state.status === 'VOTING') {
      const bots = state.players.filter(p => p.id.startsWith('bot_'));
      bots.forEach(bot => {
        const alreadyVoted = state.votes.some(v => v.voterId === bot.id);
        if (!alreadyVoted) {
          const timer = setTimeout(() => {
            const potentialTargets = state.submissions.filter(s => s.playerId !== bot.id);
            if (potentialTargets.length > 0) {
              const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
              voteCard(bot.id, target.playerId);
            }
          }, 3000 + Math.random() * 4000);
          return () => clearTimeout(timer);
        }
      });
    }
  }, [state.status, state.votes, state.players, state.submissions, voteCard]);
}
