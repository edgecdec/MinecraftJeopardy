const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory game state storage
const rooms = {};

const getInitialState = () => ({
  locked: true,
  buzzed: null,
  buzzedName: null,
  gameState: 'BOARD',
  players: [],
  wagers: {},
  finalAnswers: {}
});

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    // console.log('Client connected:', socket.id);

    socket.on('join_room', ({ code, name, playerId }) => {
       const roomCode = code.toUpperCase();
       socket.join(roomCode);
       
       if (!rooms[roomCode]) {
           rooms[roomCode] = getInitialState();
       }
       const room = rooms[roomCode];

       // Add/Update player
       if (playerId && name) {
           const existing = room.players.find(p => p.id === playerId);
           if (!existing) {
               room.players.push({ id: playerId, name, score: 0 });
           } else {
               existing.name = name;
           }
       }

       // Send current state
       io.to(roomCode).emit('state_update', room);
    });

    socket.on('game_action', ({ code, action, payload, playerId }) => {
        const roomCode = code.toUpperCase();
        if (!rooms[roomCode]) return;
        const room = rooms[roomCode];

        switch (action) {
            case 'buzz':
                if (!room.locked && !room.buzzed) {
                    room.buzzed = playerId;
                    const p = room.players.find(pl => pl.id === playerId);
                    room.buzzedName = p ? p.name : 'Unknown';
                    room.locked = true;
                }
                break;
            case 'lock':
                room.locked = true;
                break;
            case 'unlock':
                room.locked = false;
                break;
            case 'reset': // Clear buzzer
                room.buzzed = null;
                room.buzzedName = null;
                room.locked = true;
                break;
            case 'clear': // Reset game
                room.buzzed = null;
                room.buzzedName = null;
                room.locked = true;
                // Keep players/scores
                break;
            case 'update_state':
                Object.assign(room, payload); // e.g. { gameState: 'CLUE' }
                break;
            case 'update_player': // Score/Name
                const player = room.players.find(p => p.id === playerId);
                if (player) {
                    Object.assign(player, payload);
                }
                break;
            case 'remove_player':
                room.players = room.players.filter(p => p.id !== playerId);
                break;
            case 'submit_wager':
                room.wagers[playerId] = payload.wager;
                break;
            case 'submit_answer':
                room.finalAnswers[playerId] = payload.answer;
                break;
            case 'add_bot':
                const botId = `bot-${Math.random().toString(36).substring(2,7)}`;
                room.players.push({ id: botId, name: `Player ${room.players.length+1}`, score: 0 });
                break;
        }

        io.to(roomCode).emit('state_update', room);
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
