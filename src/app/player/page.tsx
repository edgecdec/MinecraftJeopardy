'use client';

import React, { useState, Suspense } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useBuzzer } from '@/hooks/useBuzzer';

function PlayerContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Steve';
  const code = searchParams.get('code') || 'TEST';

  const { buzzed, locked, buzz } = useBuzzer(code, name);

  const handleBuzz = () => {
    if (!locked && !buzzed) {
      buzz();
    }
  };

  const isWinner = buzzed === name;

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: isWinner ? 'success.dark' : buzzed ? 'error.dark' : '#121212',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        transition: 'background-color 0.2s'
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: 'grey.500', fontFamily: 'monospace' }}>
        ROOM: {code} | PLAYER: {name}
      </Typography>

      {buzzed ? (
        <Typography variant="h3" sx={{ fontFamily: '"Press Start 2P", cursive', textAlign: 'center', mb: 4 }}>
          {isWinner ? 'YOU BUZZED!' : `${buzzed} BUZZED!`}
        </Typography>
      ) : (
        <Button
          variant="contained"
          color={locked ? "error" : "success"}
          onClick={handleBuzz}
          disabled={locked}
          sx={{ 
            width: '280px', 
            height: '280px', 
            borderRadius: '50%', 
            fontSize: '2rem',
            fontFamily: '"Press Start 2P", cursive',
            boxShadow: locked ? 'none' : '0 10px 0 #000',
            border: '8px solid white',
            transform: locked ? 'translateY(5px)' : 'none',
            transition: 'all 0.1s',
            '&:active': { transform: 'translateY(10px)', boxShadow: 'none' }
          }}
        >
          {locked ? 'WAIT' : 'BUZZ'}
        </Button>
      )}
    </Box>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<Box sx={{ color: 'white', p: 4 }}>Loading Buzzer...</Box>}>
      <PlayerContent />
    </Suspense>
  );
}