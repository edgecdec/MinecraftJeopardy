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

  useEffect(() => {
    if (!code) return;

    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
        socket.emit('join_room', { 
            code, 
            name: playerName || 'Host', 
            role: playerName ? 'player' : 'host',
            config: initialConfig // Send config on join (server ignores if room exists)
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
  }, [code, playerName]); // initialConfig usually static

  const performAction = (action: string, payload: any = {}, targetId?: string) => {
    if (socketRef.current) {
        socketRef.current.emit('game_action', {
            code,
            action,
            payload,
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
    maxPlayers: state.maxPlayers,
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
    clear: () => performAction('clear'), 
    reset: () => performAction('reset'), 
    markCorrect: (pid: string, points: number) => performAction('mark_correct', { playerId: pid, points }),
    markWrong: (pid: string, points: number) => performAction('mark_wrong', { playerId: pid, points }),
    addPlayer: () => performAction('add_bot'),
    updateMaxPlayers: (n: number) => performAction('update_max_players', { maxPlayers: n }),
    updateState: (newState: { players?: any[], gameState?: string }) => performAction('update_state', newState),
    updatePlayer: (id: string, updates: { score?: number, name?: string }) => performAction('update_player', updates, id),
    removePlayer: (id: string) => performAction('remove_player', {}, id),
    submitWager: (wager: number) => performAction('submit_wager', { wager }),
    submitAnswer: (answer: string) => performAction('submit_answer', { answer }),
    refresh: () => {} 
  };
}
