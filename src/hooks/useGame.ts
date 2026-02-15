'use client';

import { useState, useCallback, useEffect } from 'react';
import { minecraftGame } from '@/data/games/minecraft';

export type Clue = {
  id: string;
  value: number;
  clue: string;
  answer: string;
  category: string;
  isDailyDouble?: boolean;
};

export type Category = {
  category: string;
  description?: string;
  clues: Clue[];
};

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type GameState = 'BOARD' | 'CLUE' | 'ANSWER' | 'DAILY_DOUBLE_WAGER' | 'FINAL_CATEGORY' | 'FINAL_WAGER' | 'FINAL_CLUE' | 'FINAL_SCORING' | 'GAME_OVER';
export type Round = 'SINGLE' | 'DOUBLE' | 'FINAL';

const STORAGE_KEY = 'minecraft-jeopardy-save-v2';

export function useGame() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 'p1', name: 'Player 1', score: 0 },
    { id: 'p2', name: 'Player 2', score: 0 },
    { id: 'p3', name: 'Player 3', score: 0 },
  ]);
  
  const [questions, setQuestions] = useState<Category[]>([]);
  const [answeredClues, setAnsweredClues] = useState<Set<string>>(new Set());
  const [activeClue, setActiveClue] = useState<Clue | null>(null);
  const [gameState, setGameState] = useState<GameState>('BOARD');
  const [round, setRound] = useState<Round>('SINGLE');
  const [dailyDoubleIds, setDailyDoubleIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  const generateBoard = useCallback((targetRound: Round = 'SINGLE') => {
    if (targetRound === 'FINAL') {
      setupFinalJeopardy();
      return;
    }

    const shuffledCats = [...minecraftGame.categories].sort(() => 0.5 - Math.random());
    const selectedCats = shuffledCats.slice(0, 6);
    const multiplier = targetRound === 'DOUBLE' ? 400 : 200;

    const newBoard: Category[] = selectedCats.map(cat => {
      const selectedClues: Clue[] = [];
      for (let diff = 1; diff <= 5; diff++) {
        const potentialClues = cat.pool.filter(q => q.difficulty === diff);
        const poolClue = potentialClues.length > 0 
          ? potentialClues[Math.floor(Math.random() * potentialClues.length)]
          : cat.pool[0];

        selectedClues.push({
          id: `${cat.name}-${diff}-${Math.random().toString(36).substr(2, 5)}`,
          category: cat.name,
          value: diff * multiplier,
          clue: poolClue.clue,
          answer: poolClue.answer
        });
      }
      return {
        category: cat.name,
        description: cat.description,
        clues: selectedClues
      };
    });

    setQuestions(newBoard);
    setAnsweredClues(new Set());
    setActiveClue(null);
    setGameState('BOARD');
    setRound(targetRound);

    // Pick Daily Doubles (1 for Single, 2 for Double)
    const allClues = newBoard.flatMap(c => c.clues);
    const count = targetRound === 'DOUBLE' ? 2 : 1;
    const dds = new Set<string>();
    
    while (dds.size < count && allClues.length > 0) {
      const randomClue = allClues[Math.floor(Math.random() * allClues.length)];
      dds.add(randomClue.id);
    }
    setDailyDoubleIds(dds);
  }, []);

  const setupFinalJeopardy = () => {
    const finalQ = minecraftGame.finalJeopardy[Math.floor(Math.random() * minecraftGame.finalJeopardy.length)];
    setActiveClue({
      id: 'final-jeopardy',
      value: 0, // Wagered later
      category: finalQ.category,
      clue: finalQ.clue,
      answer: finalQ.answer
    });
    setRound('FINAL');
    setGameState('FINAL_CATEGORY');
    setQuestions([]); // Clear board
  };

  // 1. Load from Storage on Mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlayers(parsed.players);
        setQuestions(parsed.questions);
        setAnsweredClues(new Set(parsed.answeredClues));
        setActiveClue(parsed.activeClue);
        setGameState(parsed.gameState);
        setRound(parsed.round || 'SINGLE');
        setDailyDoubleIds(new Set(parsed.dailyDoubleIds));
        setIsLoaded(true);
        return;
      } catch (e) {
        console.error("Failed to load save:", e);
      }
    }
    generateBoard('SINGLE');
    setIsLoaded(true);
  }, [generateBoard]);

  // 2. Save to Storage on Change
  useEffect(() => {
    if (!isLoaded) return;
    
    const stateToSave = {
      players,
      questions,
      answeredClues: Array.from(answeredClues),
      activeClue,
      gameState,
      round,
      dailyDoubleIds: Array.from(dailyDoubleIds)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [players, questions, answeredClues, activeClue, gameState, round, dailyDoubleIds, isLoaded]);

  const advanceFinalJeopardy = useCallback(() => {
    if (gameState === 'FINAL_CATEGORY') setGameState('FINAL_WAGER');
    else if (gameState === 'FINAL_WAGER') setGameState('FINAL_CLUE');
    else if (gameState === 'FINAL_CLUE') setGameState('FINAL_SCORING');
  }, [gameState]);
  
  // Re-implement replaceCategory fully to rely on current state multiplier
  const replaceCategory = useCallback((categoryName: string) => {
     setQuestions(prevQuestions => {
      const currentNames = new Set(prevQuestions.map(q => q.category));
      const availableCats = minecraftGame.categories.filter(c => !currentNames.has(c.name));
      if (availableCats.length === 0) return prevQuestions;

      const newCatData = availableCats[Math.floor(Math.random() * availableCats.length)];
      const multiplier = round === 'DOUBLE' ? 400 : 200;
      
      const selectedClues: Clue[] = [];
      for (let diff = 1; diff <= 5; diff++) {
        const potentialClues = newCatData.pool.filter(q => q.difficulty === diff);
        const poolClue = potentialClues.length > 0 
          ? potentialClues[Math.floor(Math.random() * potentialClues.length)]
          : newCatData.pool[0];

        selectedClues.push({
          id: `${newCatData.name}-${diff}-${Math.random().toString(36).substr(2, 5)}`,
          category: newCatData.name,
          value: diff * multiplier,
          clue: poolClue.clue,
          answer: poolClue.answer
        });
      }
      
      const newCategoryBoard = { 
        category: newCatData.name, 
        description: newCatData.description,
        clues: selectedClues 
      };
      const newQuestions = prevQuestions.map(q => q.category === categoryName ? newCategoryBoard : q);
      
      return newQuestions;
    });
  }, [round]);

  const endGame = useCallback(() => {
    setGameState('GAME_OVER');
  }, []);

  const closeClue = useCallback(() => {
    if (activeClue) { setAnsweredClues(prev => new Set(prev).add(activeClue.id)); }
    setGameState('BOARD');
    setActiveClue(null);
  }, [activeClue]);

  return {
    players,
    addPlayer,
    removePlayer,
    updatePlayerName,
    updatePlayerScore,
    questions,
    answeredClues,
    activeClue,
    gameState,
    round,
    selectClue,
    submitWager,
    revealAnswer,
    completeClue,
    closeClue,
    generateBoard,
    replaceCategory,
    advanceFinalJeopardy,
    endGame
  };
}
