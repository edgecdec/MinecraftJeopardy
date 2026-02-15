'use client';

import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Stack, Paper, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useRouter } from 'next/navigation';
import { AVAILABLE_GAMES, DEFAULT_GAME_ID } from '@/lib/gameRegistry';

export default function Lobby() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedGame, setSelectedGame] = useState(DEFAULT_GAME_ID);

  const handleHost = () => {
    // Generate random 4-letter code
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    router.push(`/host?code=${code}&game=${selectedGame}`);
  };

  const handleJoin = () => {
    if (roomCode && playerName) {
      router.push(`/player?code=${roomCode.toUpperCase()}&name=${encodeURIComponent(playerName)}`);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#121212',
        backgroundImage: 'url("/textures/dirt_background.png")',
        backgroundSize: '128px',
        color: 'white'
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, bgcolor: 'rgba(0,0,0,0.8)', border: '4px solid grey', textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontFamily: '"Press Start 2P", cursive', mb: 4, color: 'secondary.main' }}>
            MINECRAFT JEOPARDY
          </Typography>

          <Stack spacing={4}>
            <Box>
              <Stack spacing={2}>
                <FormControl fullWidth variant="filled" sx={{ bgcolor: '#c6c6c6', borderRadius: 0, border: '4px solid white' }}>
                  <InputLabel sx={{ color: '#555' }}>GAME THEME</InputLabel>
                  <Select
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    sx={{ color: '#3f3f3f', fontWeight: 'bold' }}
                  >
                    {AVAILABLE_GAMES.map((game) => (
                      <MenuItem key={game.id} value={game.id}>
                        {game.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  onClick={handleHost}
                  sx={{ fontFamily: '"Press Start 2P", cursive', py: 2, fontSize: '1.2rem' }}
                >
                  HOST A GAME
                </Button>
              </Stack>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'grey.500' }}>
                Create a room and control the board.
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ color: 'white' }}>- OR -</Typography>

            <Box>
              <Stack spacing={2}>
                <TextField 
                  label="ROOM CODE" 
                  variant="filled" 
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  sx={{ 
                    bgcolor: '#c6c6c6', 
                    borderRadius: 0,
                    border: '4px solid #fff',
                    borderRightColor: '#555',
                    borderBottomColor: '#555',
                    '& .MuiInputBase-input': { color: '#3f3f3f', fontWeight: 'bold' },
                    '& .MuiInputLabel-root': { color: '#555' }
                  }}
                  inputProps={{ style: { fontFamily: 'monospace' } }}
                />
                <TextField 
                  label="YOUR NAME" 
                  variant="filled" 
                  value={playerName}
                  onChange={(e) => {
                    if (e.target.value.length <= 15) {
                        setPlayerName(e.target.value);
                    }
                  }}
                  sx={{ 
                    bgcolor: '#c6c6c6', 
                    borderRadius: 0,
                    border: '4px solid #fff',
                    borderRightColor: '#555',
                    borderBottomColor: '#555',
                    '& .MuiInputBase-input': { color: '#3f3f3f', fontWeight: 'bold' },
                    '& .MuiInputLabel-root': { color: '#555' }
                  }}
                  inputProps={{ 
                    style: { fontFamily: 'monospace' },
                    maxLength: 15
                  }}
                />
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="success"
                  size="large" 
                  onClick={handleJoin}
                  disabled={!roomCode || !playerName}
                  sx={{ fontFamily: '"Press Start 2P", cursive', py: 2 }}
                >
                  JOIN GAME
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
