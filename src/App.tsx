/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useGame } from './store/gameStore';
import LandingPage, { Platform } from './components/LandingPage';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import { GameProvider } from './store/gameStore';

function AppContent() {
  const { state } = useGame();
  const [localPlayer, setLocalPlayer] = useState<{ id: string; name: string; avatar: string; platform: Platform } | null>(null);

  // If we have a local player, find their current data in the game state
  const currentPlayer = localPlayer ? state.players.find(p => p.id === localPlayer.id) : null;

  if (!localPlayer || !state.partyId) {
    return <LandingPage onSetLocalPlayer={setLocalPlayer} />;
  }

  if (state.status === 'LOBBY') {
    return <Lobby localPlayerId={localPlayer.id} />;
  }

  return <GameBoard localPlayerId={localPlayer.id} />;
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
