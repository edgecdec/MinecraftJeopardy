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
import ResultsView from '@/components/Game/ResultsView';

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
    advanceFinalJeopardy,
    endGame
  } = useGame();

  const { playSound } = useSound();
  const { 
    buzzedName, lock, unlock, reset, clear, 
    updateState, updatePlayer, 
    wagers, finalAnswers, allPlayers 
  } = useBuzzer(roomCode);

  // Sync Game State to API
  useEffect(() => {
    updateState({ 
        gameState, 
        players: players 
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

  // ... (handlers stay same) ...

  const handleCompleteClue = (pid: string | null, correct: boolean) => {
      // Find the player object to get current score if needed, or just send delta
      const player = allPlayers?.find(p => p.id === pid);
      if (!player && pid) return; // Should not happen

      if (round === 'FINAL' && pid) {
          const wager = wagers[pid] || 0;
          updatePlayer(pid, { score: player.score + (correct ? wager : -wager) });
          
          if (correct) playSound('correct');
          else playSound('wrong');
          return;
      }

      completeClue(pid, correct); // Advances game state locally (close clue)
      
      if (pid && player) {
         // Apply score to API
         const clueValue = activeClue?.value || 0;
         updatePlayer(pid, { score: player.score + (correct ? clueValue : -clueValue) });
      }

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
    else endGame(); // Was generateBoard('SINGLE') reset logic
  };

  const handleFullReset = () => {
      // Optional: Reset all scores to 0 here if desired
      allPlayers?.forEach(p => updatePlayer(p.id, { score: 0 }));
      generateBoard('SINGLE');
  };

  if (gameState === 'GAME_OVER') {
      return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#121212', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResultsView 
                players={allPlayers || []} 
                onReset={handleFullReset} 
                isHost={true} 
            />
        </Box>
      );
  }

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
          players={allPlayers || []} 
          onAdjust={handleScoreAdjust} 
          onUpdateName={handleUpdateName}
          onAddPlayer={addPlayer} // Keep local add? No, should be removed or adapted.
          // Actually, Host can still add "Bot" players locally if needed, but for now let's just pass empty or adapt
          // The ScoreBoard expects onAddPlayer. 
          // Since we are moving to "Players Join", we might want to hide the "Add" button or make it generate a dummy player via API.
          // Let's implement a dummy add via API.
          onRemovePlayer={(id) => { /* Implement remove via API if needed */ }} 
        />

        <ClueModal 
          open={!!activeClue || round === 'FINAL'}
          activeClue={activeClue}
          gameState={gameState}
          round={round}
          players={allPlayers || []}
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