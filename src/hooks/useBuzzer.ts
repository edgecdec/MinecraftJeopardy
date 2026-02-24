'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface RoomState {
  hostId: string | null;
  maxPlayers: number;
  locked: boolean;
  buzzed: string | null;
  buzzedName: string | null;
  incorrectBuzzes: string[]; 
  controlPlayerId: string | null;
  gameState: string;
  players: any[]; 
  wagers: Record<string, number>;
  finalAnswers: Record<string, string>;
}

export function useBuzzer(code: string, playerName?: string, initialConfig?: { maxPlayers: number }) {
  const [state, setState] = useState<RoomState>({ 
    hostId: null,
    maxPlayers: 3,
    locked: true, 
    buzzed: null, 
    buzzedName: null,
    incorrectBuzzes: [],
    controlPlayerId: null,
    gameState: 'BOARD',
    players: [],
    wagers: {},
    finalAnswers: {}
  });
  const [isHost, setIsHost] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Load saved players on mount (if host)
  const getSavedPlayers = useCallback(() => {
      try {
          const saved = localStorage.getItem(`jeopardy-players-${code}`);
          if (saved) return JSON.parse(saved);
      } catch (e) {
          console.error("Failed to load saved players", e);
      }
      return null;
  }, [code]);

  useEffect(() => {
    if (!code) return;

    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
        const isHostAttempt = !playerName;
        const savedPlayers = isHostAttempt ? getSavedPlayers() : null;
        
        const configToUse = {
            ...initialConfig,
            restoreState: savedPlayers ? { players: savedPlayers } : undefined
        };

        socket.emit('join_room', { 
            code, 
            name: playerName || 'Host', 
            role: isHostAttempt ? 'host' : 'player',
            config: configToUse
        });
    });

    socket.on('state_update', (newState: RoomState) => {
        setState(newState);
    });

    socket.on('set_role', (data: { role: string, id: string }) => {
        setIsHost(data.role === 'host');
        setDeviceId(data.id);
    });

    socket.on('host_taken', () => {
        setConnectionError('This room already has a host.');
        socket.disconnect();
    });

    socket.on('room_full', () => {
        setConnectionError('This room is full.');
        socket.disconnect();
    });

    return () => {
        socket.disconnect();
    };
  }, [code, playerName, initialConfig, getSavedPlayers]);

  // Save players to local storage when updated (only host does this)
  useEffect(() => {
      if (isHost && state.players.length > 0) {
          localStorage.setItem(`jeopardy-players-${code}`, JSON.stringify(state.players));
      }
  }, [isHost, state.players, code]);

  const performAction = useCallback((action: string, payload: any = {}, targetId?: string) => {
    if (socketRef.current) {
        socketRef.current.emit('game_action', {
            code,
            action,
            payload,
            targetId: targetId 
        });
    }
  }, [code]);

  const myPlayer = state.players.find(p => p.id === deviceId);
  const myScore = myPlayer ? myPlayer.score : 0;

  return {
    connectionError,
    isHost,
    // State
    locked: state.locked,
    buzzedId: state.buzzed,
    buzzedName: state.buzzedName,
    incorrectBuzzes: state.incorrectBuzzes,
    controlPlayerId: state.controlPlayerId,
    maxPlayers: state.maxPlayers,
    gameState: state.gameState,
    allPlayers: state.players,
    myScore,
    wagers: state.wagers,
    finalAnswers: state.finalAnswers,
    isMe: state.buzzed === deviceId,
    deviceId,
    // Actions
    buzz: useCallback(() => performAction('buzz'), [performAction]),
    lock: useCallback(() => performAction('lock'), [performAction]),
    unlock: useCallback(() => performAction('unlock'), [performAction]),
    clear: useCallback(() => performAction('clear'), [performAction]), 
    reset: useCallback(() => performAction('reset'), [performAction]), 
    markCorrect: useCallback((pid: string, points: number) => performAction('mark_correct', { playerId: pid, points }), [performAction]),
    markWrong: useCallback((pid: string, points: number) => performAction('mark_wrong', { playerId: pid, points }), [performAction]),
    addPlayer: useCallback(() => performAction('add_bot'), [performAction]),
    updateMaxPlayers: useCallback((n: number) => performAction('update_max_players', { maxPlayers: n }), [performAction]),
    updateState: useCallback((newState: { players?: any[], gameState?: string }) => performAction('update_state', newState), [performAction]),
    updatePlayer: useCallback((id: string, updates: { score?: number, name?: string }) => performAction('update_player', updates, id), [performAction]),
    removePlayer: useCallback((id: string) => performAction('remove_player', {}, id), [performAction]),
    submitWager: useCallback((wager: number) => performAction('submit_wager', { wager }), [performAction]),
    submitAnswer: useCallback((answer: string) => performAction('submit_answer', { answer }), [performAction]),
    refresh: () => {} 
  };
}
