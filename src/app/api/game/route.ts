import { NextRequest, NextResponse } from 'next/server';

// --- EPHEMERAL RELAY (In-Memory Only) ---
declare global {
  var gameRelay: Record<string, RoomRelay>;
}

if (!global.gameRelay) {
  global.gameRelay = {};
}

interface RoomRelay {
  locked: boolean;
  buzzed: string | null;
  buzzedName: string | null;
  gameState: string;
  players: any[];
  wagers: Record<string, number>;
  finalAnswers: Record<string, string>;
  lastUpdate: number;
}

const getEmptyRoom = (): RoomRelay => ({
  locked: true,
  buzzed: null,
  buzzedName: null,
  gameState: 'BOARD',
  players: [],
  wagers: {},
  finalAnswers: {},
  lastUpdate: Date.now()
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  const room = global.gameRelay[code] || getEmptyRoom();
  return NextResponse.json(room);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, action, playerId, playerName, payload } = body;

  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  if (!global.gameRelay[code]) {
    global.gameRelay[code] = getEmptyRoom();
  }

  const room = global.gameRelay[code];

  switch (action) {
    case 'join':
        if (playerId && playerName) {
            const existingPlayerIndex = room.players.findIndex(p => p.id === playerId);
            if (existingPlayerIndex === -1) {
                let safeName = playerName;
                let suffix = 1;
                while (room.players.some(p => p.name === safeName)) {
                    safeName = `${playerName} (${suffix++})`;
                }
                room.players.push({ id: playerId, name: safeName, score: 0 });
            } else {
                room.players[existingPlayerIndex].name = playerName;
            }
        }
        break;

    case 'add_player':
        const newId = `bot-${Math.random().toString(36).substring(2, 7)}`;
        const botName = `Player ${room.players.length + 1}`;
        room.players.push({ id: newId, name: botName, score: 0 });
        break;

    case 'buzz':
      if (!room.locked && !room.buzzed) {
        room.buzzed = playerId;
        room.buzzedName = playerName;
        room.locked = true;
      }
      break;
    case 'lock': room.locked = true; break;
    case 'unlock': 
        room.locked = false; 
        room.buzzed = null; 
        room.buzzedName = null; 
        break;
    case 'reset':
        room.buzzed = null;
        room.buzzedName = null;
        break;
    case 'update_state':
        // Host pushes full state here
        if (payload.gameState) room.gameState = payload.gameState;
        if (payload.players) room.players = payload.players;
        if (payload.wagers) room.wagers = payload.wagers;
        if (payload.finalAnswers) room.finalAnswers = payload.finalAnswers;
        break;
    case 'update_player':
        if (playerId) {
            const pIndex = room.players.findIndex(p => p.id === playerId);
            if (pIndex !== -1) {
                if (payload.score !== undefined) room.players[pIndex].score = payload.score;
                if (payload.name !== undefined) room.players[pIndex].name = payload.name;
                room.lastAction = Date.now();
            }
        }
        break;
        
    case 'remove_player':
        if (playerId) {
            room.players = room.players.filter(p => p.id !== playerId);
            room.lastAction = Date.now();
        }
        break;

    case 'submit_wager':
    case 'submit_answer':
        if (playerId) room.finalAnswers[playerId] = payload.answer;
        break;
  }

  room.lastUpdate = Date.now();
  return NextResponse.json(room);
}
