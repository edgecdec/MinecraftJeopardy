'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Box, Button, Typography, Container, TextField, Stack, Paper } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useBuzzer } from '@/hooks/useBuzzer';

function PlayerContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Steve';
  const code = searchParams.get('code') || 'TEST';

  const { buzzedId, buzzedName, locked, buzz, isMe, gameState, myScore, submitWager, submitAnswer, wagers, finalAnswers, deviceId } = useBuzzer(code, name);
  const [localWager, setLocalWager] = useState('');
  const [localAnswer, setLocalAnswer] = useState('');
  const [wagerSubmitted, setWagerSubmitted] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const handleBuzz = () => {
    if (!locked && !buzzedId) {
      buzz();
    }
  };

  const handleWagerSubmit = () => {
    const amount = parseInt(localWager);
    if (!isNaN(amount) && amount >= 0 && amount <= myScore) {
      submitWager(amount);
      setWagerSubmitted(true);
    } else if (myScore <= 0 && amount === 0) {
       submitWager(0);
       setWagerSubmitted(true);
    }
  };

  const handleAnswerSubmit = () => {
    submitAnswer(localAnswer);
    setAnswerSubmitted(true);
  };

  // Reset local state if game resets
  useEffect(() => {
    if (gameState === 'BOARD') {
        setWagerSubmitted(false);
        setAnswerSubmitted(false);
        setLocalWager('');
        setLocalAnswer('');
    }
  }, [gameState]);

  const isWinner = buzzedId === deviceId; // Use deviceId for consistency

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: isWinner ? 'success.dark' : (buzzedId && gameState === 'CLUE') ? 'error.dark' : '#121212',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        transition: 'background-color 0.2s'
      }}
    >
      {/* Header Info */}
      <Box sx={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'grey.500', fontFamily: 'monospace' }}>
          ROOM: {code}
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: '"Press Start 2P", cursive', mt: 1, color: 'secondary.main' }}>
          {name}
        </Typography>
        <Typography variant="h5" sx={{ fontFamily: '"Press Start 2P", cursive', mt: 2 }}>
          SCORE: ${myScore}
        </Typography>
      </Box>

      {/* --- FINAL JEOPARDY: WAGER --- */}
      {gameState === 'FINAL_WAGER' && (
        <Stack spacing={4} alignItems="center" sx={{ mt: 8, width: '100%', maxWidth: 400 }}>
          <Typography variant="h5" sx={{ fontFamily: '"Press Start 2P", cursive', textAlign: 'center' }}>
            FINAL JEOPARDY
          </Typography>
          <Typography sx={{ textAlign: 'center' }}>Enter your wager (Max: ${Math.max(0, myScore)})</Typography>
          
          {wagerSubmitted ? (
            <Paper sx={{ p: 3, bgcolor: 'success.main', color: 'white' }}>
              <Typography variant="h6">WAGER LOCKED</Typography>
            </Paper>
          ) : (
            <>
              <TextField 
                fullWidth
                variant="filled" 
                label="WAGER"
                type="number"
                value={localWager}
                onChange={(e) => setLocalWager(e.target.value)}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
                inputProps={{ style: { fontFamily: '"Press Start 2P", cursive', fontSize: '1.2rem' } }}
              />
              <Button 
                fullWidth
                variant="contained" 
                size="large"
                color="warning"
                onClick={handleWagerSubmit}
                disabled={myScore < 0}
                sx={{ fontFamily: '"Press Start 2P", cursive', py: 2 }}
              >
                SUBMIT WAGER
              </Button>
              {myScore < 0 && <Typography color="error">Negative score: You cannot wager.</Typography>}
            </>
          )}
        </Stack>
      )}

      {/* --- FINAL JEOPARDY: ANSWER --- */}
      {(gameState === 'FINAL_CLUE' || gameState === 'FINAL_SCORING') && (
        <Stack spacing={4} alignItems="center" sx={{ mt: 8, width: '100%', maxWidth: 400 }}>
          <Typography variant="h5" sx={{ fontFamily: '"Press Start 2P", cursive', textAlign: 'center' }}>
            FINAL JEOPARDY
          </Typography>
          
          {answerSubmitted ? (
            <Paper sx={{ p: 3, bgcolor: 'success.main', color: 'white' }}>
              <Typography variant="h6">ANSWER LOCKED</Typography>
            </Paper>
          ) : (
            <>
              <TextField 
                fullWidth
                variant="filled" 
                label="YOUR ANSWER"
                value={localAnswer}
                onChange={(e) => setLocalAnswer(e.target.value)}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
                inputProps={{ style: { fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 'bold' } }}
              />
              <Button 
                fullWidth
                variant="contained" 
                size="large"
                color="secondary"
                onClick={handleAnswerSubmit}
                sx={{ fontFamily: '"Press Start 2P", cursive', py: 2 }}
              >
                SUBMIT ANSWER
              </Button>
            </>
          )}
        </Stack>
      )}

      {/* --- STANDARD GAME --- */}
      {gameState === 'BOARD' || gameState === 'CLUE' || gameState === 'DAILY_DOUBLE_WAGER' || gameState === 'ANSWER' ? (
        buzzedId ? (
          <Typography variant="h3" sx={{ fontFamily: '"Press Start 2P", cursive', textAlign: 'center', mb: 4 }}>
            {isWinner ? 'YOU BUZZED!' : `${buzzedName} BUZZED!`}
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
        )
      ) : null}
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
