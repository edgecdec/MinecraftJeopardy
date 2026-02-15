'use client';

import { useCallback, useState, useEffect } from 'react';

const SOUNDS = {
  click: '/sounds/click.mp3',
  dailyDouble: '/sounds/dailydouble.mp3',
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  boardFill: '/sounds/board_fill.mp3',
  timesUp: '/sounds/times_up.mp3',
};

export function useSound() {
  // Initialize from localStorage if possible, default true
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const playSound = useCallback((type: keyof typeof SOUNDS) => {
    try {
      const audio = new Audio(SOUNDS[type]);
      audio.volume = 0.5; 
      audio.play().catch(e => console.warn("Audio play failed:", e));
    } catch (e) {
      console.warn("Audio init failed:", e);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    // Prefer English voices
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha'))) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
  }, []);

  // Ensure voices are loaded (Chrome needs this event)
  useEffect(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = () => {
              window.speechSynthesis.getVoices();
          };
      }
  }, []);

  return { playSound, speak, cancelSpeech, ttsEnabled, setTtsEnabled };
}
