'use client';

import { useCallback } from 'react';

const SOUNDS = {
  click: '/sounds/click.mp3',
  dailyDouble: '/sounds/dailydouble.mp3',
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  boardFill: '/sounds/board_fill.mp3',
  timesUp: '/sounds/times_up.mp3',
};

export function useSound() {
  const playSound = useCallback((type: keyof typeof SOUNDS) => {
    try {
      const audio = new Audio(SOUNDS[type]);
      audio.volume = 0.5; // Default volume 50%
      audio.play().catch(e => console.warn("Audio play failed (user interaction needed first):", e));
    } catch (e) {
      console.warn("Audio init failed:", e);
    }
  }, []);

  return { playSound };
}
