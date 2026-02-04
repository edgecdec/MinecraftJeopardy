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
  buzzedPlayer?: string | null;
  wagers?: Record<string, number>;
  finalAnswers?: Record<string, string>;
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
  buzzedPlayer,
  wagers = {},
  finalAnswers = {},
  onRevealAnswer,
  onClose,
  onCompleteClue,
  onSubmitWager,
  onAdvanceFinal,
  onResetGame
}: ClueModalProps) {
  const [wager, setWager] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (!open) {
        setWager('');
        setDisplayedText('');
        setCharIndex(0);
    }
  }, [open]);

  // Reset typewriter when clue changes
  useEffect(() => {
      if (activeClue) {
          setDisplayedText('');
          setCharIndex(0);
      }
  }, [activeClue]);

  // Typewriter Effect
  useEffect(() => {
      if (!activeClue || round === 'FINAL') return; // Don't typewrite final jeopardy clue? Or maybe yes.
      // Actually standard Final Jeopardy reveals all at once usually.
      
      if (gameState === 'ANSWER' || gameState === 'DAILY_DOUBLE_WAGER') {
          setDisplayedText(activeClue.clue); // Show full
          return;
      }

      if (buzzedPlayer) return; // Pause when buzzed

      if (charIndex < activeClue.clue.length) {
          const timeout = setTimeout(() => {
              setDisplayedText(prev => prev + activeClue.clue[charIndex]);
              setCharIndex(prev => prev + 1);
          }, 30); // Speed: 30ms per char
          return () => clearTimeout(timeout);
      }
  }, [charIndex, activeClue, buzzedPlayer, gameState, round]);

  const handleWagerSubmit = () => {
    const amount = parseInt(wager);
    if (!isNaN(amount) && amount >= 0) {
      onSubmitWager(amount);
    }
  };

  if ((!activeClue && round !== 'FINAL') || !open) return null;

  const renderFinalJeopardy = () => (
    <>
      <Typography variant="h4" sx={{ mb: 6, color: 'secondary.main', fontFamily: '"Press Start 2P", cursive' }}>
        FINAL JEOPARDY: {activeClue?.category}
      </Typography>
      {/* ... existing Final Jeopardy content ... */}
      {/* Note: keeping existing Final Jeopardy logic as is, assuming no typewriter needed there for now unless requested */}
      {gameState === 'FINAL_CATEGORY' && (
        <Button variant="contained" size="large" onClick={onAdvanceFinal} sx={{ fontFamily: '"Press Start 2P", cursive' }}>
          REVEAL CATEGORY & WAGER
        </Button>
      )}

      {gameState === 'FINAL_WAGER' && (
        <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 800 }}>
          <Typography sx={{ mb: 4, fontFamily: '"Press Start 2P", cursive' }}>PLAYERS, LOCK IN YOUR WAGERS!</Typography>
          
          <Stack direction="row" spacing={4} justifyContent="center" sx={{ mb: 4, flexWrap: 'wrap' }}>
            {players.map(p => (
              <Paper key={p.id} sx={{ p: 2, bgcolor: wagers[p.id] !== undefined ? 'success.dark' : 'grey.800', minWidth: 150 }}>
                <Typography sx={{ fontFamily: '"Press Start 2P", cursive' }}>{p.name}</Typography>
                <Typography variant="caption">{wagers[p.id] !== undefined ? 'LOCKED' : 'THINKING...'}</Typography>
              </Paper>
            ))}
          </Stack>

          <Button variant="contained" size="large" onClick={onAdvanceFinal} sx={{ fontFamily: '"Press Start 2P", cursive' }}>
            REVEAL CLUE
          </Button>
        </Box>
      )}

      {(gameState === 'FINAL_CLUE' || gameState === 'FINAL_SCORING') && (
        <Typography variant="h3" align="center" sx={{ mb: 8, maxWidth: '80%', fontWeight: 'bold' }}>
          {activeClue?.clue}
        </Typography>
      )}

      {gameState === 'FINAL_CLUE' && (
        <Box sx={{ textAlign: 'center' }}>
            <Stack direction="row" spacing={4} justifyContent="center" sx={{ mb: 4 }}>
            {players.map(p => (
              <Paper key={p.id} sx={{ p: 2, bgcolor: finalAnswers[p.id] ? 'info.dark' : 'grey.800', minWidth: 150 }}>
                <Typography sx={{ fontFamily: '"Press Start 2P", cursive' }}>{p.name}</Typography>
                <Typography variant="caption">{finalAnswers[p.id] ? 'ANSWERED' : 'WRITING...'}</Typography>
              </Paper>
            ))}
          </Stack>
          <Button variant="contained" color="secondary" size="large" onClick={onAdvanceFinal} sx={{ fontFamily: '"Press Start 2P", cursive' }}>
            REVEAL ANSWER
          </Button>
        </Box>
      )}

      {gameState === 'FINAL_SCORING' && (
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Paper elevation={6} sx={{ display: 'inline-block', p: 4, bgcolor: 'success.dark', border: '4px solid white', mb: 4 }}>
            <Typography variant="h4" sx={{ fontFamily: '"Press Start 2P", cursive' }}>
              {activeClue?.answer.toUpperCase()}
            </Typography>
          </Paper>
          
          <Stack spacing={2} sx={{ mb: 4, alignItems: 'center' }}>
            {players.map(p => (
              <Paper key={p.id} sx={{ p: 2, bgcolor: 'grey.900', border: '2px solid grey', width: '100%', maxWidth: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography sx={{ fontFamily: '"Press Start 2P", cursive', color: 'secondary.main' }}>{p.name}</Typography>
                  <Typography variant="h6">"{finalAnswers[p.id] || '...'}"</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption">WAGER: ${wagers[p.id] || 0}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button 
                        size="small" 
                        color="success" 
                        variant="contained" 
                        onClick={() => onCompleteClue(p.id, true)}
                      >
                        CORRECT
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        variant="contained"
                        onClick={() => onCompleteClue(p.id, false)}
                      >
                        WRONG
                      </Button>
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>

          <Button variant="outlined" onClick={onResetGame} sx={{ mt: 4, color: 'white', borderColor: 'white', fontFamily: '"Press Start 2P", cursive' }}>
            END GAME & RESET
          </Button>
        </Box>
      )}
    </>
  );

  const renderStandardClue = () => {
    if (!activeClue) return null;
    return (
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
                sx={{ 
                  bgcolor: '#c6c6c6', borderRadius: 0,
                  border: '4px solid #fff', borderRightColor: '#555', borderBottomColor: '#555',
                  width: 300,
                  '& .MuiInputBase-input': { color: '#3f3f3f', fontWeight: 'bold' }
                }}
                inputProps={{ style: { fontSize: '2rem', textAlign: 'center', fontFamily: '"Press Start 2P", cursive' } }}
              />
              <Button variant="contained" color="warning" onClick={handleWagerSubmit} sx={{ fontFamily: '"Press Start 2P", cursive' }}>BET</Button>
            </Stack>
          </Box>
        ) : (
          <>
            <Typography variant="h3" align="center" sx={{ mb: 8, maxWidth: '80%', fontWeight: 'bold', fontSize: { xs: '1.5rem', md: '3rem' } }}>
              {displayedText}
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
    );
  };

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

        {buzzedPlayer && (
          <Paper 
            elevation={24}
            sx={{ 
              position: 'absolute', 
              top: '10%', 
              bgcolor: 'error.main', 
              color: 'white', 
              p: 4, 
              border: '4px solid white', 
              zIndex: 9999,
              animation: 'pulse 0.5s infinite alternate'
            }}
          >
            <Typography variant="h3" sx={{ fontFamily: '"Press Start 2P", cursive', textShadow: '4px 4px #000' }}>
              {buzzedPlayer} BUZZED!
            </Typography>
          </Paper>
        )}

        {round === 'FINAL' ? renderFinalJeopardy() : renderStandardClue()}
      </Box>
    </Dialog>
  );
}