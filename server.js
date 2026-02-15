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
  incorrectBuzzes: [],
  controlPlayerId: null,
  gameState: 'BOARD',
  players: [],
  wagers: {},
  finalAnswers: {}
});

// Helper to remove secrets before broadcasting
const getPublicState = (room) => {
    const { hostId, ...publicState } = room;
    return publicState;
};

// Helper to parse cookies from header
const parseCookie = (str, name) => {
    if (!str) return null;
    const match = str.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
};

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
                // Use bash to execute script (avoids permission issues)
                exec('bash /var/www/MinecraftJeopardy/deploy_webhook.sh', (error, stdout, stderr) => {
                    if (error) console.error(`exec error: ${error}`);
                    if (stdout) console.log(`stdout: ${stdout}`);
                    if (stderr) console.error(`stderr: ${stderr}`);
                });
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
    // SECURITY: Extract ID from HttpOnly cookie
    const cookieString = socket.request.headers.cookie;
    const secureId = parseCookie(cookieString, 'jeopardy_id');

    if (!secureId) {
        console.log(`Socket ${socket.id} rejected: No secure cookie.`);
        socket.disconnect();
        return;
    }

    // Determine Role based on payload BUT use secureId for Identity
    socket.on('join_room', ({ code, name, role }) => {
       const roomCode = code.toUpperCase();
       socket.join(roomCode);
       
       if (!rooms[roomCode]) rooms[roomCode] = getInitialState();
       const room = rooms[roomCode];

       let assignedRole = 'player';

       if (role === 'host') {
           if (!room.hostId) {
               room.hostId = secureId; // Bind Host to Cookie ID
               console.log(`Room ${roomCode} claimed by host ${secureId} (Socket ${socket.id})`);
               assignedRole = 'host';
           } else if (room.hostId === secureId) {
               assignedRole = 'host';
           } else {
               socket.emit('host_taken');
               return; 
           }
       } else {
           if (name) {
               const existing = room.players.find(p => p.id === secureId);
               if (!existing) {
                   room.players.push({ id: secureId, name, score: 0 }); // Bind Player to Cookie ID
               } else {
                   existing.name = name; // Update name for existing session
               }
           }
           if (room.hostId === secureId) {
               assignedRole = 'host';
           }
       }

       socket.emit('set_role', { role: assignedRole, id: secureId });
       io.to(roomCode).emit('state_update', getPublicState(room));
    });

    socket.on('game_action', ({ code, action, payload, targetId }) => {
        // senderId is ignored from payload, use secureId
        const senderId = secureId; 
        
        const roomCode = code.toUpperCase();
        if (!rooms[roomCode]) return;
        const room = rooms[roomCode];

        const isHost = (room.hostId && room.hostId === senderId);

        if (action === 'buzz') {
            if (!room.locked && !room.buzzed && !room.incorrectBuzzes.includes(senderId)) {
                room.buzzed = senderId;
                const p = room.players.find(pl => pl.id === senderId);
                room.buzzedName = p ? p.name : 'Unknown';
                room.locked = true;
                io.to(roomCode).emit('state_update', getPublicState(room));
            }
            return;
        }
        if (action === 'submit_wager') {
            room.wagers[senderId] = payload.wager;
            io.to(roomCode).emit('state_update', getPublicState(room));
            return;
        }
        if (action === 'submit_answer') {
            room.finalAnswers[senderId] = payload.answer;
            io.to(roomCode).emit('state_update', getPublicState(room));
            return;
        }

        if (!isHost) return;

        switch (action) {
            case 'lock': room.locked = true; break;
            case 'unlock': room.locked = false; break;
            case 'reset': 
                room.buzzed = null; room.buzzedName = null; 
                room.locked = true; room.incorrectBuzzes = []; 
                break;
            case 'clear': 
                if (room.buzzed) room.incorrectBuzzes.push(room.buzzed);
                room.buzzed = null; room.buzzedName = null; room.locked = false; 
                break;
            case 'mark_correct':
                const winner = room.players.find(p => p.id === payload.playerId);
                if (winner) {
                    winner.score += payload.points;
                    room.controlPlayerId = payload.playerId; 
                }
                room.buzzed = null; room.buzzedName = null; 
                room.locked = true; room.incorrectBuzzes = [];
                break;
            case 'mark_wrong':
                 const loser = room.players.find(p => p.id === payload.playerId);
                 if (loser) loser.score -= payload.points;
                 if (!room.incorrectBuzzes.includes(payload.playerId)) room.incorrectBuzzes.push(payload.playerId);
                 room.buzzed = null; room.buzzedName = null; room.locked = false; 
                 break;
            
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
        io.to(roomCode).emit('state_update', getPublicState(room));
    });
  });

  httpServer.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
