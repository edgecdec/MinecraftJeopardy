const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const crypto = require('crypto');
const { exec } = require('child_process');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'my_super_secret_jeopardy_token';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const rooms = {};

const getInitialState = () => ({
  hostId: null,
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
      const { pathname } = parsedUrl;

      if (pathname === '/api/webhook' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const signature = req.headers['x-hub-signature-256'];
            if (!signature) { res.statusCode = 401; res.end('No signature'); return; }
            const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
            const digest = 'sha256=' + hmac.update(body).digest('hex');
            if (signature === digest) {
                console.log('Webhook verified. Deploying...');
                res.statusCode = 200; res.end('Deploying');
                exec('/root/deploy_webhook.sh');
            } else {
                res.statusCode = 403; res.end('Forbidden');
            }
        });
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    socket.on('join_room', ({ code, name, playerId, role }) => {
       const roomCode = code.toUpperCase();
       socket.join(roomCode);
       
       if (!rooms[roomCode]) rooms[roomCode] = getInitialState();
       const room = rooms[roomCode];

       if (role === 'host') {
           if (!room.hostId) {
               room.hostId = playerId;
               console.log(`Room ${roomCode} claimed by host ${playerId}`);
           } else if (room.hostId !== playerId) {
               // Host taken!
               socket.emit('host_taken');
               return; // Do not send state_update, do not allow view
           }
       } else {
           if (playerId && name) {
               const existing = room.players.find(p => p.id === playerId);
               if (!existing) room.players.push({ id: playerId, name, score: 0 });
               else existing.name = name;
           }
       }
       io.to(roomCode).emit('state_update', room);
    });

    socket.on('game_action', ({ code, action, payload, senderId, targetId }) => {
        const roomCode = code.toUpperCase();
        if (!rooms[roomCode]) return;
        const room = rooms[roomCode];

        if (action === 'buzz') {
            if (!room.locked && !room.buzzed) {
                room.buzzed = senderId;
                const p = room.players.find(pl => pl.id === senderId);
                room.buzzedName = p ? p.name : 'Unknown';
                room.locked = true;
                io.to(roomCode).emit('state_update', room);
            }
            return;
        }
        if (action === 'submit_wager') {
            room.wagers[senderId] = payload.wager;
            io.to(roomCode).emit('state_update', room);
            return;
        }
        if (action === 'submit_answer') {
            room.finalAnswers[senderId] = payload.answer;
            io.to(roomCode).emit('state_update', room);
            return;
        }

        if (room.hostId && room.hostId !== senderId) return;

        switch (action) {
            case 'lock': room.locked = true; break;
            case 'unlock': room.locked = false; break;
            case 'reset': room.buzzed = null; room.buzzedName = null; room.locked = true; break;
            case 'clear': room.buzzed = null; room.buzzedName = null; room.locked = true; break;
            case 'update_state': Object.assign(room, payload); break;
            case 'update_player': 
                const p = room.players.find(x => x.id === targetId);
                if (p) Object.assign(p, payload);
                break;
            case 'remove_player':
                room.players = room.players.filter(x => x.id !== targetId);
                break;
            case 'add_bot':
                const botId = `bot-${Math.random().toString(36).substring(2,7)}`;
                room.players.push({ id: botId, name: `Player ${room.players.length+1}`, score: 0 });
                break;
        }
        io.to(roomCode).emit('state_update', room);
    });
  });

  httpServer.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
