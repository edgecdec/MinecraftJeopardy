'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useGame } from '@/hooks/useGame';
import { useSound } from '@/hooks/useSound';
import ScoreBoard from '@/components/ScoreBoard';
import GameHeader from '@/components/Game/GameHeader';
import GameBoard from '@/components/Game/GameBoard';
import ClueModal from '@/components/Game/ClueModal';

import { useBuzzer } from '@/hooks/useBuzzer';

function HostGameContent() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || 'LOCAL';

  const { 
    players,
    addPlayer,
    removePlayer,
    updatePlayerName,
    updatePlayerScore,
    answeredClues, 
    activeClue, 
    gameState, 
    round,
    selectClue, 
    submitWager,
    revealAnswer, 
    completeClue, 
    closeClue,
    questions,
    generateBoard,
    replaceCategory,
    advanceFinalJeopardy
  } = useGame();

  const { playSound } = useSound();
  const { buzzedName, lock, unlock, reset, clear, updateState, wagers, finalAnswers } = useBuzzer(roomCode);

  // Sync Game State to API so players see it
  useEffect(() => {
    updateState({ 
        gameState, 
        players: players // Push full [{id, name, score}, ...]
    });
  }, [gameState, players, updateState]);

  // unlock buzzer when clue opens (and it's not a daily double)
  useEffect(() => {
    if (activeClue && !activeClue.isDailyDouble && gameState === 'CLUE') {
        unlock();
    } else {
        lock();
    }
  }, [activeClue, gameState]);

  const handleScoreAdjust = (player: string, amount: number) => {
    updatePlayerScore(player, amount);
    if (amount > 0) playSound('correct');
    else playSound('wrong');
  };

  const handleSelectClue = (clue: any) => {
    playSound('click');
    selectClue(clue);
    // Buzzer unlock handled by effect above
  };

  const handleCompleteClue = (pid: string | null, correct: boolean) => {
      if (round === 'FINAL' && pid) {
          const wager = wagers[pid] || 0;
          updatePlayerScore(pid, correct ? wager : -wager);
          // Don't close clue automatically for Final Jeopardy so we can grade everyone
          if (correct) playSound('correct');
          else playSound('wrong');
          return;
      }

      completeClue(pid, correct);
      if (correct) {
          playSound('correct');
          reset(); 
      } else if (pid !== null) {
          playSound('wrong');
          reset(); 
          unlock();
      }
  };

  const handleNextRound = () => {
    playSound('boardFill');
    if (round === 'SINGLE') generateBoard('DOUBLE');
    else if (round === 'DOUBLE') generateBoard('FINAL');
    else generateBoard('SINGLE');
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        py: 4, 
        bgcolor: '#121212',
        backgroundImage: 'url("/textures/dirt_background.png"), linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8))',
        backgroundBlendMode: 'overlay',
        backgroundSize: '128px',
        backgroundRepeat: 'repeat',
        color: 'white'
      }}
    >
      <Container maxWidth={false} sx={{ px: 4 }}>
        <GameHeader round={round} roomCode={roomCode} onNextRound={handleNextRound} />

        {round !== 'FINAL' ? (
          <GameBoard 
            questions={questions}
            answeredClues={answeredClues}
            onSelectClue={handleSelectClue}
            onReplaceCategory={replaceCategory}
          />
        ) : (
          <Box sx={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '8px solid grey' }}>
            <Typography variant="h3" sx={{ fontFamily: '"Press Start 2P", cursive', color: 'secondary.main' }}>
              FINAL JEOPARDY
            </Typography>
          </Box>
        )}

        <ScoreBoard 
          players={players} 
          onAdjust={handleScoreAdjust} 
          onUpdateName={updatePlayerName}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
        />

        <ClueModal 
          open={!!activeClue || round === 'FINAL'}
          activeClue={activeClue}
          gameState={gameState}
          round={round}
          players={players}
          buzzedPlayer={buzzedName}
          wagers={wagers}
          finalAnswers={finalAnswers}
          onRevealAnswer={revealAnswer}
          onClose={closeClue}
          onCompleteClue={handleCompleteClue}
          onSubmitWager={(amount) => {
            submitWager(amount);
            playSound('click');
          }}
          onAdvanceFinal={advanceFinalJeopardy}
          onResetGame={() => generateBoard('SINGLE')}
        />
      </Container>
    </Box>
  );
}

export default function HostPage() {
  return (
    <Suspense fallback={<Box sx={{ color: 'white', p: 4 }}>Loading Host...</Box>}>
      <HostGameContent />
    </Suspense>
  );
}
