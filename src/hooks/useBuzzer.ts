'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface RoomState {
  locked: boolean;
  buzzed: string | null;
  buzzedName: string | null;
  incorrectBuzzes: string[]; // List of IDs who answered wrong
  controlPlayerId: string | null; // Who picked the last clue
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

  useEffect(() => {
    let id = localStorage.getItem('jeopardy_device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('jeopardy_device_id', id);
    }
    setDeviceId(id);
  }, []);

  useEffect(() => {
    if (!code || !deviceId) return;

    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
        socket.emit('join_room', { 
            code, 
            name: playerName || 'Host', 
            playerId: deviceId,
            role: playerName ? 'player' : 'host' 
        });
    });

    socket.on('state_update', (newState: RoomState) => {
        setState(newState);
    });

    socket.on('set_role', (role: string) => {
        setIsHost(role === 'host');
    });

    socket.on('host_taken', () => {
        setConnectionError('This room already has a host.');
        socket.disconnect();
    });

    return () => {
        socket.disconnect();
    };
  }, [code, deviceId, playerName]);

  const performAction = (action: string, payload: any = {}, targetId?: string) => {
    if (socketRef.current) {
        socketRef.current.emit('game_action', {
            code,
            action,
            payload,
            senderId: deviceId, 
            targetId: targetId 
        });
    }
  };

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
    gameState: state.gameState,
    allPlayers: state.players,
    myScore,
    wagers: state.wagers,
    finalAnswers: state.finalAnswers,
    isMe: state.buzzed === deviceId,
    deviceId,
    // Actions
    buzz: () => performAction('buzz'),
    lock: () => performAction('lock'),
    unlock: () => performAction('unlock'),
    clear: () => performAction('clear'), // Clear buzzer but KEEP clue active (wrong answer)
    reset: () => performAction('reset'), // Full reset (new clue)
    markCorrect: (pid: string, points: number) => performAction('mark_correct', { playerId: pid, points }),
    markWrong: (pid: string, points: number) => performAction('mark_wrong', { playerId: pid, points }),
    addPlayer: () => performAction('add_bot'),
    updateState: (newState: { players?: any[], gameState?: string }) => performAction('update_state', newState),
    updatePlayer: (id: string, updates: { score?: number, name?: string }) => performAction('update_player', updates, id),
    removePlayer: (id: string) => performAction('remove_player', {}, id),
    submitWager: (wager: number) => performAction('submit_wager', { wager }),
    submitAnswer: (answer: string) => performAction('submit_answer', { answer }),
    refresh: () => {} 
  };
}
