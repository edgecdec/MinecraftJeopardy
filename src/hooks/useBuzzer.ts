'use client';

import { useState, useEffect, useCallback } from 'react';

interface RoomState {
  locked: boolean;
  buzzed: string | null;
  buzzedName: string | null;
  gameState: string;
  scores: Record<string, number>;
  wagers: Record<string, number>;
  finalAnswers: Record<string, string>;
}

export function useBuzzer(code: string, playerName?: string) {
  const [state, setState] = useState<RoomState>({ 
    locked: true, 
    buzzed: null, 
    buzzedName: null,
    gameState: 'BOARD',
    scores: {},
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

  const performAction = async (action: string, payload: any = {}) => {
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          action, 
          playerId: deviceId,
          playerName: playerName,
          payload
        })
      });
      fetchState();
    } catch (e) {
      console.error("Failed to perform action", e);
    }
  };

  return {
    locked: state.locked,
    buzzedId: state.buzzed,
    buzzedName: state.buzzedName,
    gameState: state.gameState,
    scores: state.scores,
    myScore: state.scores[deviceId] || 0,
    wagers: state.wagers,
    finalAnswers: state.finalAnswers,
    isMe: state.buzzed === deviceId,
    deviceId,
    buzz: () => performAction('buzz'),
    lock: () => performAction('lock'),
    unlock: () => performAction('unlock'),
    clear: () => performAction('clear'),
    reset: () => performAction('reset'),
    updateState: (newState: { scores?: any, gameState?: string }) => performAction('update_state', newState),
    submitWager: (wager: number) => performAction('submit_wager', { wager }),
    submitAnswer: (answer: string) => performAction('submit_answer', { answer }),
    refresh: fetchState
  };
}