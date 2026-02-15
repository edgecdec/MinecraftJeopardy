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
  } = useGame(gameId);

  const { playSound } = useSound();
  const { 
    buzzedName, lock, unlock, reset, clear, 
    updateState, updatePlayer, removePlayer: removePlayerApi,
    addPlayer: addPlayerApi,
    wagers, finalAnswers, allPlayers,
    gameState: serverGameState 
  } = useBuzzer(roomCode);

  // Sync Game State to API only when it changes locally
  useEffect(() => {
    if (gameState !== serverGameState) {
        updateState({ gameState });
    }
  }, [gameState, serverGameState, updateState]);

  // unlock buzzer when clue opens (and it's not a daily double)
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
      const player = allPlayers?.find(p => p.id === pid);
      const clueValue = activeClue?.value || 0;

      if (round === 'FINAL' && pid && player) {
          const wager = wagers[pid] || 0;
          updatePlayer(pid, { score: player.score + (correct ? wager : -wager) });
          
          if (correct) playSound('correct');
          else playSound('wrong');
          return;
      }

      completeClue(pid, correct); 
      
      if (pid && player) {
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

  const handleClearBuzzer = () => {
      reset();
      unlock();
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
