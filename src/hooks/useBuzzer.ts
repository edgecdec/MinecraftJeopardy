'use client';

import { useState, useEffect, useCallback } from 'react';

interface RoomState {
  locked: boolean;
  buzzed: string | null;
}

export function useBuzzer(code: string, playerName?: string) {
  const [state, setState] = useState<RoomState>({ locked: true, buzzed: null });

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/game?code=${code}`);
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (e) {
      console.error("Failed to fetch game state", e);
    }
  }, [code]);

  useEffect(() => {
    if (!code) return;
    
    // Initial fetch
    fetchState();

    // Poll every 500ms
    const interval = setInterval(fetchState, 500);
    return () => clearInterval(interval);
  }, [code, fetchState]);

  const performAction = async (action: string) => {
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, action, player: playerName })
      });
      fetchState(); // Immediate sync
    } catch (e) {
      console.error("Failed to perform action", e);
    }
  };

  return {
    locked: state.locked,
    buzzed: state.buzzed,
    buzz: () => performAction('buzz'),
    lock: () => performAction('lock'),
    unlock: () => performAction('unlock'),
    clear: () => performAction('clear'),
    reset: () => performAction('reset'),
    refresh: fetchState
  };
}