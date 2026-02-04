'use client';

import { useState, useEffect, useCallback } from 'react';

interface RoomState {
  locked: boolean;
  buzzed: string | null; // This is the ID of the person who buzzed
  buzzedName: string | null; // This is the visible name
}

export function useBuzzer(code: string, playerName?: string) {
  const [state, setState] = useState<RoomState>({ locked: true, buzzed: null, buzzedName: null });
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

  const performAction = async (action: string) => {
    if (!deviceId) return;
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          action, 
          playerId: deviceId,
          playerName: playerName 
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
    isMe: state.buzzed === deviceId,
    buzz: () => performAction('buzz'),
    lock: () => performAction('lock'),
    unlock: () => performAction('unlock'),
    clear: () => performAction('clear'),
    reset: () => performAction('reset'),
    refresh: fetchState
  };
}