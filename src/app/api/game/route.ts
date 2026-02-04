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

interface RoomState {
  locked: boolean;
  buzzed: string | null; // Player ID
  buzzedName: string | null; // Player Name
  lastAction: number;
  gameState: string; // BOARD, FINAL_WAGER, FINAL_CLUE, etc.
  scores: Record<string, number>; // playerId -> score
  wagers: Record<string, number>; // playerId -> wager
  finalAnswers: Record<string, string>; // playerId -> answer
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
    scores: {},
    wagers: {},
    finalAnswers: {}
  };
  return NextResponse.json(room);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, action, playerId, playerName, payload } = body;

  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  // Init room if not exists
  if (!global.gameRooms[code]) {
    global.gameRooms[code] = { 
        locked: true, 
        buzzed: null, 
        buzzedName: null, 
        lastAction: Date.now(),
        gameState: 'BOARD',
        scores: {},
        wagers: {},
        finalAnswers: {}
    };
  }

  const room = global.gameRooms[code];

  switch (action) {
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
    
    // NEW ACTIONS
    case 'update_state':
        if (payload.scores) room.scores = payload.scores;
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
