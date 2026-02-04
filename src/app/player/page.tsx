'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useSearchParams } from 'next/navigation';
// import { useChannel, usePresence } from "@ably-labs/react-hooks"; 

export default function PlayerPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Steve';
  const code = searchParams.get('code') || 'TEST';

  const [locked, setLocked] = useState(true);
  const [buzzed, setBuzzed] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // Ably Logic Placeholder
  /*
  const [channel] = useChannel(code, (message) => {
    if (message.name === 'unlock') {
      setLocked(false);
      setBuzzed(false);
      setWinner(null);
    } else if (message.name === 'lock') {
      setLocked(true);
    } else if (message.name === 'buzz') {
      setLocked(true);
      setWinner(message.data.name);
    }
  });

  const { updateStatus } = usePresence(code, { name });
  */

  const handleBuzz = () => {
    if (!locked && !buzzed) {
      setBuzzed(true);
      // channel.publish('buzz', { name });
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: winner === name ? 'success.dark' : '#121212',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: 'grey.500' }}>
        ROOM: {code} | PLAYER: {name}
      </Typography>

      {winner ? (
        <Typography variant="h3" sx={{ fontFamily: '"Press Start 2P", cursive', textAlign: 'center', mb: 4 }}>
          {winner === name ? 'YOU BUZZED!' : `${winner} BUZZED!`}
        </Typography>
      ) : (
        <Button
          variant="contained"
          color={locked ? "error" : "success"}
          onClick={handleBuzz}
          disabled={locked || buzzed}
          sx={{ 
            width: '300px', 
            height: '300px', 
            borderRadius: '50%', 
            fontSize: '2rem',
            fontFamily: '"Press Start 2P", cursive',
            boxShadow: '0 10px 0 #000',
            border: '8px solid white',
            '&:active': { transform: 'translateY(10px)', boxShadow: 'none' }
          }}
        >
          {locked ? 'LOCKED' : 'BUZZ'}
        </Button>
      )}
    </Box>
  );
}
