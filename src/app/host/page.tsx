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
  const gameId = searchParams.get('game') || 'minecraft';

  const { 
    gameTitle,
    allCategories,
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
  } = useGame(gameId, roomCode); 

  const { playSound } = useSound();
  const { 
    connectionError,
    buzzedName, lock, unlock, reset, clear, markCorrect, markWrong,
    updateState, updatePlayer, removePlayer: removePlayerApi,
    addPlayer: addPlayerApi,
    wagers, finalAnswers, allPlayers,
    incorrectBuzzes, // Need this to show who is locked out? Optional.
    controlPlayerId, // Need this for Daily Double?
    gameState: serverGameState 
  } = useBuzzer(roomCode);

  // Sync Game State to API only when it changes locally
  useEffect(() => {
    if (gameState !== serverGameState) {
        updateState({ gameState });
    }
  }, [gameState, serverGameState, updateState]);

  // unlock buzzer when clue opens (and it's not a daily double)
  // UPDATED LOGIC: 
  // If Daily Double, DO NOT unlock.
  // If Control Player exists, maybe show "Waiting for [Player]"?
  useEffect(() => {
    if (activeClue && !activeClue.isDailyDouble && gameState === 'CLUE') {
        unlock();
    } else {
        lock();
    }
  }, [activeClue, gameState]);

  // Play sound when someone buzzes
  useEffect(() => {
    if (buzzedName) {
        playSound('click');
    }
  }, [buzzedName, playSound]);

  const handleScoreAdjust = (playerId: string, amount: number) => {
    const player = allPlayers?.find(p => p.id === playerId);
    if (player) {
        updatePlayer(playerId, { score: player.score + amount });
        if (amount > 0) playSound('correct');
        else playSound('wrong');
    }
  };

  const handleUpdateName = (playerId: string, name: string) => {
      updatePlayer(playerId, { name });
  };

  const handleSelectClue = (clue: any) => {
    playSound('click');
    selectClue(clue);
  };

  const handleCompleteClue = (pid: string | null, correct: boolean) => {
      const clueValue = activeClue?.value || 0;

      // Final Jeopardy Logic (Wagers)
      if (round === 'FINAL' && pid) {
          const player = allPlayers?.find(p => p.id === pid);
          if (player) {
            const wager = wagers[pid] || 0;
            updatePlayer(pid, { score: player.score + (correct ? wager : -wager) });
            if (correct) playSound('correct');
            else playSound('wrong');
          }
          return;
      }

      // Regular Play
      if (pid) {
          if (correct) {
              markCorrect(pid, clueValue);
              playSound('correct');
              completeClue(pid, true); // Close local clue
          } else {
              markWrong(pid, clueValue);
              playSound('wrong');
              // DO NOT completeClue(). Keep it open for others to buzz.
              // Just clear buzzer (handled by server markWrong)
          }
      } else {
          // Skip / No one got it
          reset();
          completeClue(null, false);
      }
  };

  const handleClearBuzzer = () => {
      // Manual clear (e.g. accidental buzz)
      clear(); 
  };

  const handleNextRound = () => {
    playSound('boardFill');
    if (round === 'SINGLE') generateBoard('DOUBLE');
    else if (round === 'DOUBLE') generateBoard('FINAL');
    else endGame(); 
  };

  const handleFullReset = () => {
      allPlayers?.forEach(p => updatePlayer(p.id, { score: 0 }));
      generateBoard('SINGLE');
  };

  if (connectionError) {
      return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#121212', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h4" sx={{ fontFamily: '"Press Start 2P", cursive', color: 'error.main', textAlign: 'center' }}>
                ACCESS DENIED<br/>
                <span style={{ fontSize: '1rem', color: 'white' }}>{connectionError}</span>
            </Typography>
        </Box>
      );
  }

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
        <GameHeader title={gameTitle} round={round} roomCode={roomCode} onNextRound={handleNextRound} />

        {round !== 'FINAL' ? (
          <GameBoard 
            questions={questions}
            allCategories={allCategories} 
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
          onAddPlayer={addPlayerApi} 
          onRemovePlayer={removePlayerApi} 
        />

        <ClueModal 
          open={!!activeClue || round === 'FINAL'}
          activeClue={activeClue}
          gameState={gameState}
          round={round}
          players={allPlayers || []}
          buzzedPlayer={buzzedName}
          controlPlayerId={controlPlayerId} // Pass Control
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
          onContinue={handleClearBuzzer}
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
