'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, Stack, TextField, Paper } from '@mui/material';
import { Clue, GameState, Round, Player } from '@/hooks/useGame';

interface ClueModalProps {
  open: boolean;
  activeClue: Clue | null;
  gameState: GameState;
  round: Round;
  players: Player[];
  onRevealAnswer: () => void;
  onClose: () => void;
  onCompleteClue: (playerId: string | null, correct: boolean) => void;
  onSubmitWager: (amount: number) => void;
  onAdvanceFinal: () => void;
  onResetGame: () => void;
}

export default function ClueModal({
  open,
  activeClue,
  gameState,
  round,
  players,
  onRevealAnswer,
  onClose,
  onCompleteClue,
  onSubmitWager,
  onAdvanceFinal,
  onResetGame
}: ClueModalProps) {
  const [wager, setWager] = useState('');

  useEffect(() => {
    if (!open) setWager('');
  }, [open]);

  const handleWagerSubmit = () => {
    const amount = parseInt(wager);
    if (!isNaN(amount) && amount >= 0) {
      onSubmitWager(amount);
    }
  };

  if (!activeClue && round !== 'FINAL') return null;

  return (
    <Dialog 
      fullScreen 
      open={open} 
      PaperProps={{
        sx: { 
          bgcolor: 'rgba(10,10,10,0.95)', 
          backgroundImage: 'url("/textures/book_background.png")', 
          color: 'white',
          p: 4
        }
      }}
    >
      <Box 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '8px solid',
          borderColor: 'grey.800',
          position: 'relative',
          p: 4
        }}
      >
        {[
          { top: 10, left: 10 }, { top: 10, right: 10 }, 
          { bottom: 10, left: 10 }, { bottom: 10, right: 10 }
        ].map((pos, i) => (
          <Box key={i} sx={{ position: 'absolute', ...pos, width: 20, height: 20, bgcolor: 'grey.500', boxShadow: '2px 2px #000', border: '1px solid #fff' }} />
        ))}

        {round === 'FINAL' && activeClue ? (
          <>
            <Typography variant="h4" sx={{ mb: 6, color: 'secondary.main', fontFamily: '"Press Start 2P", cursive' }}>
              FINAL JEOPARDY: {activeClue.category}
            </Typography>

            {gameState === 'FINAL_CATEGORY' && (
              <Button variant="contained" size="large" onClick={onAdvanceFinal} sx={{ fontFamily: '"Press Start 2P", cursive' }}>
                REVEAL CATEGORY & WAGER
              </Button>
            )}

            {gameState === 'FINAL_WAGER' && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ mb: 4, fontFamily: '"Press Start 2P", cursive' }}>PLAYERS, LOCK IN YOUR WAGERS!</Typography>
                <Button variant="contained" size="large" onClick={onAdvanceFinal} sx={{ fontFamily: '"Press Start 2P", cursive' }}>
                  REVEAL CLUE
                </Button>
              </Box>
            )}

            {(gameState === 'FINAL_CLUE' || gameState === 'FINAL_SCORING') && (
              <Typography variant="h3" align="center" sx={{ mb: 8, maxWidth: '80%', fontWeight: 'bold' }}>
                {activeClue.clue}
              </Typography>
            )}

            {gameState === 'FINAL_CLUE' && (
              <Button variant="contained" color="secondary" size="large" onClick={onAdvanceFinal} sx={{ fontFamily: '"Press Start 2P", cursive' }}>
                REVEAL ANSWER
              </Button>
            )}

            {gameState === 'FINAL_SCORING' && (
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Paper elevation={6} sx={{ display: 'inline-block', p: 4, bgcolor: 'success.dark', border: '4px solid white', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontFamily: '"Press Start 2P", cursive' }}>
                    {activeClue.answer.toUpperCase()}
                  </Typography>
                </Paper>
                <Typography sx={{ mb: 2, color: 'grey.400', fontFamily: '"Press Start 2P", cursive', fontSize: '0.6rem' }}>ADJUST SCORES MANUALLY BASED ON WAGERS:</Typography>
                <Button variant="outlined" onClick={onResetGame} sx={{ mt: 4, color: 'white', borderColor: 'white', fontFamily: '"Press Start 2P", cursive' }}>
                  END GAME & RESET
                </Button>
              </Box>
            )}
          </>
        ) : (
          activeClue && (
            <>
              <Typography variant="h5" sx={{ mb: 6, color: 'secondary.main', fontFamily: '"Press Start 2P", cursive', textShadow: '3px 3px #000' }}>
                {activeClue.category.toUpperCase()} — ${activeClue.value}
              </Typography>
              
              {gameState === 'DAILY_DOUBLE_WAGER' ? (
                <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 600 }}>
                  <Typography variant="h2" sx={{ mb: 4, fontFamily: '"Press Start 2P", cursive', color: 'error.main', animation: 'popIn 0.5s infinite alternate' }}>
                    DAILY DOUBLE!
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <TextField 
                      autoFocus variant="filled" value={wager}
                      onChange={(e) => setWager(e.target.value.replace(/\D/g, ''))}
                      inputProps={{ style: { color: 'white', fontSize: '2rem', textAlign: 'center', fontFamily: '"Press Start 2P", cursive' } }}
                      sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 300 }}
                    />
                    <Button variant="contained" color="warning" onClick={handleWagerSubmit} sx={{ fontFamily: '"Press Start 2P", cursive' }}>BET</Button>
                  </Stack>
                </Box>
              ) : (
                <>
                  <Typography variant="h3" align="center" sx={{ mb: 8, maxWidth: '80%', fontWeight: 'bold', fontSize: { xs: '1.5rem', md: '3rem' } }}>
                    {activeClue.clue}
                  </Typography>
                  
                  {gameState === 'ANSWER' && (
                    <Paper elevation={6} sx={{ mt: 2, p: 4, bgcolor: 'success.dark', border: '4px solid white', animation: 'popIn 0.3s ease-out' }}>
                      <Typography variant="h4" sx={{ fontFamily: '"Press Start 2P", cursive', textShadow: '2px 2px #000' }}>
                        {activeClue.answer.toUpperCase()}
                      </Typography>
                    </Paper>
                  )}

                  <Box sx={{ mt: 'auto', width: '100%', display: 'flex', justifyContent: 'center', gap: 4 }}>
                    {gameState === 'CLUE' && (
                      <>
                        <Button variant="contained" color="secondary" size="large" onClick={onRevealAnswer} sx={{ fontFamily: '"Press Start 2P", cursive' }}>REVEAL ANSWER</Button>
                        <Button variant="outlined" onClick={onClose} sx={{ color: 'grey.400', borderColor: 'grey.400', fontFamily: '"Press Start 2P", cursive' }}>SKIP</Button>
                      </>
                    )}
                    {gameState === 'ANSWER' && (
                      <Stack direction="row" spacing={4} alignItems="center" sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                        {players.map(player => (
                          <Stack key={player.id} spacing={1} alignItems="center">
                            <Button variant="contained" color="success" onClick={() => onCompleteClue(player.id, true)} sx={{ fontFamily: '"Press Start 2P", cursive', minWidth: 120, border: '2px solid #fff' }}>{player.name} (+)</Button>
                            <Button variant="contained" color="error" onClick={() => onCompleteClue(player.id, false)} sx={{ fontFamily: '"Press Start 2P", cursive', minWidth: 120, border: '2px solid #fff' }}>{player.name} (-)</Button>
                          </Stack>
                        ))}
                        <Box sx={{ width: 40 }} />
                        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ fontFamily: '"Press Start 2P", cursive', border: '2px solid #fff' }}>NO ONE</Button>
                      </Stack>
                    )}
                  </Box>
                </>
              )}
            </>
          )
        )}
      </Box>
    </Dialog>
  );
}
