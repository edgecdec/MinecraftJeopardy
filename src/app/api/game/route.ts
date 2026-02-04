import { NextRequest, NextResponse } from 'next/server';

// --- IN-MEMORY STORE ---
// Note: In Vercel Serverless, this global variable might reset if the lambda spins down.
// For a guaranteed persistent state, use Vercel KV (Redis) or a database.
// For local dev, this works perfectly.
declare global {
  var gameRooms: Record<string, RoomState>;
}

if (!global.gameRooms) {
  global.gameRooms = {};
}

interface PlayerInfo {
  id: string;
  name: string;
  score: number;
}

interface RoomState {
  locked: boolean;
  buzzed: string | null; // Player ID
  buzzedName: string | null; // Player Name
  lastAction: number;
  gameState: string; 
  players: PlayerInfo[]; // Full list from Host
  wagers: Record<string, number>; 
  finalAnswers: Record<string, string>; 
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  const room = global.gameRooms[code] || { 
    locked: true, 
    buzzed: null, 
    buzzedName: null, 
    lastAction: Date.now(),
    gameState: 'BOARD',
    players: [],
    wagers: {},
    finalAnswers: {}
  };
  return NextResponse.json(room);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, action, playerId, playerName, payload } = body;

  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  if (!global.gameRooms[code]) {
    global.gameRooms[code] = { 
        locked: true, 
        buzzed: null, 
        buzzedName: null, 
        lastAction: Date.now(),
        gameState: 'BOARD',
        players: [],
        wagers: {},
        finalAnswers: {}
    };
  }

  const room = global.gameRooms[code];

  switch (action) {
    // ... previous cases ...
    case 'buzz':
      if (!room.locked && !room.buzzed) {
        room.buzzed = playerId;
        room.buzzedName = playerName;
        room.locked = true;
        room.lastAction = Date.now();
      }
      break;
    case 'lock':
      room.locked = true;
      room.lastAction = Date.now();
      break;
    case 'unlock':
      room.locked = false;
      room.buzzed = null;
      room.buzzedName = null;
      room.lastAction = Date.now();
      break;
    case 'reset':
      room.buzzed = null;
      room.buzzedName = null;
      room.lastAction = Date.now();
      break;
    case 'clear':
        room.buzzed = null;
        room.buzzedName = null;
        room.locked = false;
        room.lastAction = Date.now();
        break;
    
    case 'update_state':
        if (payload.players) room.players = payload.players;
        if (payload.gameState) room.gameState = payload.gameState;
        room.lastAction = Date.now();
        break;
    case 'submit_wager':
        if (playerId && payload.wager !== undefined) {
            room.wagers[playerId] = payload.wager;
            room.lastAction = Date.now();
        }
        break;
    case 'submit_answer':
        if (playerId && payload.answer !== undefined) {
            room.finalAnswers[playerId] = payload.answer;
            room.lastAction = Date.now();
        }
        break;
  }

  return NextResponse.json(room);
}
