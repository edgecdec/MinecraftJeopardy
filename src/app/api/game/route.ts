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
  buzzed: string | null;
  lastAction: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  const room = global.gameRooms[code] || { locked: true, buzzed: null, lastAction: Date.now() };
  return NextResponse.json(room);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, action, player } = body;

  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  // Init room if not exists
  if (!global.gameRooms[code]) {
    global.gameRooms[code] = { locked: true, buzzed: null, lastAction: Date.now() };
  }

  const room = global.gameRooms[code];

  switch (action) {
    case 'buzz':
      if (!room.locked && !room.buzzed) {
        room.buzzed = player;
        room.locked = true; // Auto-lock on buzz
        room.lastAction = Date.now();
      }
      break;
    case 'lock':
      room.locked = true;
      room.lastAction = Date.now();
      break;
    case 'unlock':
      room.locked = false;
      room.buzzed = null; // Clear previous buzz on unlock
      room.lastAction = Date.now();
      break;
    case 'reset':
      room.buzzed = null;
      room.lastAction = Date.now();
      break;
    case 'clear':
        room.buzzed = null;
        room.locked = false;
        room.lastAction = Date.now();
        break;
  }

  return NextResponse.json(room);
}
