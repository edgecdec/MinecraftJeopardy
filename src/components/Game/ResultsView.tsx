'use client';

import React from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { Player } from '@/hooks/useGame';

interface ResultsViewProps {
  players: Player[];
  onReset: () => void;
  isHost: boolean;
}

export default function ResultsView({ players, onReset, isHost }: ResultsViewProps) {
  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <Box 
      sx={{ 
        height: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white'
      }}
    >
      <Typography variant="h2" sx={{ fontFamily: '"Press Start 2P", cursive', mb: 6, color: 'secondary.main', textShadow: '4px 4px #000' }}>
        GAME OVER!
      </Typography>

      <Typography variant="h4" sx={{ fontFamily: '"Press Start 2P", cursive', mb: 8 }}>
        WINNER: <span style={{ color: '#55ff55' }}>{winner ? winner.name : 'NO ONE'}</span>
      </Typography>

      <Stack spacing={2} sx={{ width: '100%', maxWidth: 600, mb: 8 }}>
        {sortedPlayers.map((p, i) => (
          <Paper 
            key={p.id} 
            sx={{ 
              p: 3, 
              bgcolor: i === 0 ? 'warning.dark' : 'grey.900', 
              color: 'white', 
              border: '4px solid white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontFamily: '"Press Start 2P", cursive', width: 40 }}>#{i + 1}</Typography>
              <Typography variant="h6" sx={{ fontFamily: '"Press Start 2P", cursive' }}>{p.name}</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontFamily: '"Press Start 2P", cursive', color: 'secondary.main' }}>
              ${p.score}
            </Typography>
          </Paper>
        ))}
      </Stack>

      {isHost && (
        <Button 
          variant="contained" 
          size="large" 
          color="primary" 
          onClick={onReset}
          sx={{ 
            fontFamily: '"Press Start 2P", cursive', 
            fontSize: '1.2rem', 
            py: 2, 
            px: 6, 
            border: '4px solid white',
            boxShadow: '0 8px 0 #000',
            '&:active': { transform: 'translateY(4px)', boxShadow: 'none' }
          }}
        >
          PLAY AGAIN
        </Button>
      )}
    </Box>
  );
}
