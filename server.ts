/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory store for game states
const games: Record<string, any> = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Get state for a specific party
  app.get("/api/game/:partyId", (req, res) => {
    const { partyId } = req.params;
    console.log(`GET state for ${partyId}`);
    const game = games[partyId];
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json(game);
  });

  // Action dispatcher
  app.post("/api/game/:partyId/action", (req, res) => {
    const { partyId } = req.params;
    const action = req.body;
    console.log(`ACTION on ${partyId}:`, action.type);

    // This is a simplified "reducer" on the server
    if (!games[partyId]) {
      if (action.type === 'JOIN_PARTY') {
        games[partyId] = {
          partyId,
          status: 'LOBBY',
          hostId: action.payload.player.id,
          players: [action.payload.player],
          blackCard: null,
          submissions: [],
          votes: [],
          roundWinnerId: null,
          round: 1,
          blackCardDiscard: [],
          whiteCardDiscard: [],
          deck: 'original',
          language: action.payload.language || 'en',
        };
      } else {
        return res.status(404).json({ error: "Game not found and action is not JOIN_PARTY" });
      }
    } else {
      const state = games[partyId];
      
      switch (action.type) {
        case 'JOIN_PARTY':
          const playerExists = state.players.find((p: any) => p.id === action.payload.player.id);
          if (!playerExists) {
            state.players.push(action.payload.player);
            console.log(`Player added: ${action.payload.player.name} (${action.payload.player.id}). Total: ${state.players.length}`);
          } else {
            console.log(`Player already in game: ${action.payload.player.name} (${action.payload.player.id})`);
          }
          break;
        case 'START_GAME':
          state.status = 'SUBMISSION';
          state.blackCard = action.payload.blackCard;
          state.players = action.payload.players.map((p: any) => ({
            ...p,
            score: 0,
            hand: p.hand.slice(0, 10)
          }));
          state.whiteCardDiscard = action.payload.whiteCardDiscard || [];
          state.blackCardDiscard.push(state.blackCard.text);
          state.round = 1;
          break;
        case 'DEPLOY_CARD':
          if (!state.submissions.find((s: any) => s.playerId === action.payload.playerId)) {
            state.submissions.push(action.payload);
          }
          if (state.submissions.length === state.players.length) {
             state.status = 'VOTING';
          }
          break;
        case 'VOTE_CARD':
          // Avoid duplicate votes
          if (!state.votes.find((v: any) => v.voterId === action.payload.voterId)) {
            state.votes.push(action.payload);
          }
          if (state.votes.length === state.players.length) {
            state.status = 'RESULTS';
            // Tally votes
            const tallies: Record<string, number> = {};
            state.votes.forEach((v: any) => {
              tallies[v.targetPlayerId] = (tallies[v.targetPlayerId] || 0) + 1;
            });
            let winnerId = '';
            let maxVotes = -1;
            Object.entries(tallies).forEach(([pid, count]) => {
              if (count > maxVotes) { maxVotes = count; winnerId = pid; }
            });
            state.roundWinnerId = winnerId;
            state.players = state.players.map((p: any) => 
               p.id === winnerId ? { ...p, score: (p.score || 0) + 1 } : p
            );
          }
          break;
        case 'NEXT_ROUND':
          if (state.round >= 8) {
            return res.json(state);
          }
          state.status = 'SUBMISSION';
          state.blackCard = action.payload.blackCard;
          state.players = action.payload.players;
          state.whiteCardDiscard = action.payload.whiteCardDiscard || state.whiteCardDiscard;
          state.blackCardDiscard.push(state.blackCard.text);
          state.submissions = [];
          state.votes = [];
          state.roundWinnerId = null;
          state.round += 1;
          break;
        case 'SET_DECK':
          if (state.status === 'LOBBY' && action.payload.deck) {
            state.deck = action.payload.deck;
          }
          break;
        case 'SET_LANGUAGE':
          if (state.status === 'LOBBY' && action.payload.language) {
            state.language = action.payload.language;
          }
          break;
      }
    }

    res.json(games[partyId]);
  });

  // --- Vite Middleware ---
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
