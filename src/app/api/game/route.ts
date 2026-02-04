import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// --- IN-MEMORY STORE FALLBACK (Local Dev) ---
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
  players: PlayerInfo[]; 
  wagers: Record<string, number>; 
  finalAnswers: Record<string, string>; 
}

const DEFAULT_STATE: RoomState = { 
    locked: true, 
    buzzed: null, 
    buzzedName: null, 
    lastAction: Date.now(),
    gameState: 'BOARD',
    players: [],
    wagers: {},
    finalAnswers: {}
};

async function getRoom(code: string): Promise<RoomState> {
    if (process.env.KV_REST_API_URL) {
        return (await kv.get<RoomState>(`room:${code}`)) || DEFAULT_STATE;
    }
    return global.gameRooms[code] || DEFAULT_STATE;
}

async function setRoom(code: string, room: RoomState) {
    if (process.env.KV_REST_API_URL) {
        // Expire in 24 hours
        await kv.set(`room:${code}`, room, { ex: 86400 });
    } else {
        global.gameRooms[code] = room;
    }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  const room = await getRoom(code);
  return NextResponse.json(room);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, action, playerId, playerName, payload } = body;

  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  let room = await getRoom(code);
  
  // Clone to avoid mutating default reference if in-memory
  room = JSON.parse(JSON.stringify(room));

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
            room.lastAction = Date.now();
        }
        break;

    case 'buzz':
      if (!room.locked && !room.buzzed) {
        room.buzzed = playerId;
        room.buzzedName = playerName;
        room.locked = true;
        room.lastAction = Date.now();
        
        if (playerId && !room.players.find(p => p.id === playerId)) {
             room.players.push({ id: playerId, name: playerName || 'Unknown', score: 0 });
        }
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
        if (payload.gameState) room.gameState = payload.gameState;
        // Don't overwrite players here unless explicit? Host syncs players?
        // Actually, Host syncs players via update_player logic now.
        // But Host might still send players array if it's the "master".
        // Let's assume Host is NOT master of the list, but master of the SCORES.
        // Merging logic:
        if (payload.players) {
            // Merge scores from host into room.players
            payload.players.forEach((hostP: any) => {
                const p = room.players.find(rp => rp.id === hostP.id);
                if (p) p.score = hostP.score;
            });
        }
        room.lastAction = Date.now();
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

  await setRoom(code, room);
  return NextResponse.json(room);
}