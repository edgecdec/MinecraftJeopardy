'use client';

import { useState, useEffect, useCallback } from 'react';

interface RoomState {
  locked: boolean;
  buzzed: string | null;
  buzzedName: string | null;
  gameState: string;
  players: any[]; 
  wagers: Record<string, number>;
  finalAnswers: Record<string, string>;
}

export function useBuzzer(code: string, playerName?: string) {
  const [state, setState] = useState<RoomState>({ 
    locked: true, 
    buzzed: null, 
    buzzedName: null,
    gameState: 'BOARD',
    players: [],
    wagers: {},
    finalAnswers: {}
  });
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    // Generate or retrieve persistent Device ID
    let id = localStorage.getItem('jeopardy_device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('jeopardy_device_id', id);
    }
    setDeviceId(id);
  }, []);

  const fetchState = useCallback(async () => {
    if (!code) return;
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
    fetchState();
    const interval = setInterval(fetchState, 500);
    return () => clearInterval(interval);
  }, [code, fetchState]);

  useEffect(() => {
    if (!code || !deviceId || !playerName) return;
    
    // Join the game to register self
    const joinGame = async () => {
        try {
            await fetch('/api/game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, action: 'join', playerId: deviceId, playerName })
            });
            fetchState();
        } catch (e) {
            console.error("Failed to join", e);
        }
    };
    
    joinGame();
  }, [code, deviceId, playerName]); // Re-join if name/code changes

  const performAction = async (action: string, payload: any = {}, targetId?: string) => {
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          action, 
          playerId: targetId || deviceId,
          playerName: playerName,
          payload
        })
      });
      fetchState();
    } catch (e) {
      console.error("Failed to perform action", e);
    }
  };

  const myPlayer = state.players.find(p => p.id === deviceId);
  const myScore = myPlayer ? myPlayer.score : 0;

  return {
    locked: state.locked,
    buzzedId: state.buzzed,
    buzzedName: state.buzzedName,
    gameState: state.gameState,
    allPlayers: state.players,
    myScore,
    wagers: state.wagers,
    finalAnswers: state.finalAnswers,
    isMe: state.buzzed === deviceId,
    deviceId,
    buzz: () => performAction('buzz'),
    lock: () => performAction('lock'),
    unlock: () => performAction('unlock'),
    clear: () => performAction('clear'),
    reset: () => performAction('reset'),
    updateState: (newState: { gameState?: string }) => performAction('update_state', newState),
    updatePlayer: (id: string, updates: { score?: number, name?: string }) => performAction('update_player', updates, id),
    submitWager: (wager: number) => performAction('submit_wager', { wager }),
    submitAnswer: (answer: string) => performAction('submit_answer', { answer }),
    refresh: fetchState
  };
}