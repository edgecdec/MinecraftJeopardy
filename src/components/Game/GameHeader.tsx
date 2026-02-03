'use client';

import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { Round } from '@/hooks/useGame';

interface GameHeaderProps {
  round: Round;
  onNextRound: () => void;
}

export default function GameHeader({ round, onNextRound }: GameHeaderProps) {
  return (
    <Box sx={{ textAlign: 'center', mb: 4, position: 'relative' }}>
      <Typography 
        variant="h2" 
        sx={{ 
          fontFamily: '"Press Start 2P", cursive',
          color: 'secondary.main',
          textShadow: '4px 4px #000',
          letterSpacing: '2px',
          fontSize: { xs: '1.5rem', md: '2.5rem' },
          mb: 1
        }}
      >
        MINECRAFT JEOPARDY
      </Typography>
      <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
        <Typography variant="h6" sx={{ color: 'grey.400', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8rem' }}>
          ROUND: <span style={{ color: '#fff' }}>{round}</span>
        </Typography>
        
        <Button 
          size="small" 
          variant="contained" 
          color="primary" 
          onClick={onNextRound}
          sx={{ fontFamily: '"Press Start 2P", cursive', fontSize: '0.6rem' }}
        >
          {round === 'FINAL' ? 'RESET GAME' : 'NEXT ROUND >'}
        </Button>
      </Stack>
    </Box>
  );
}
