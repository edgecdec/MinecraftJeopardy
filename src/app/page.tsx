'use client';

import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Stack, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Lobby() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleHost = () => {
    // Generate random 4-letter code
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    router.push(`/host?code=${code}`);
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
              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                onClick={handleHost}
                sx={{ fontFamily: '"Press Start 2P", cursive', py: 2, fontSize: '1.2rem' }}
              >
                HOST A GAME
              </Button>
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
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                  inputProps={{ style: { fontFamily: 'monospace', fontWeight: 'bold' } }}
                />
                <TextField 
                  label="YOUR NAME" 
                  variant="filled" 
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                  inputProps={{ style: { fontFamily: 'monospace' } }}
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