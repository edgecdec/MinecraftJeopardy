'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Stack, TextField, IconButton } from '@mui/material';
import { Player } from '@/hooks/useGame';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

interface ScoreBoardProps {
  players: Player[];
  maxPlayers: number;
  onAdjust: (playerId: string, amount: number) => void;
  onUpdateName: (playerId: string, name: string) => void;
  onUpdateScore: (playerId: string, newScore: number) => void;
  onUpdateMaxPlayers: (n: number) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
}

export default function ScoreBoard({ 
  players, 
  maxPlayers,
  onAdjust, 
  onUpdateName, 
  onUpdateScore, 
  onUpdateMaxPlayers,
  onAddPlayer, 
  onRemovePlayer 
}: ScoreBoardProps) {
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState('');

  const startNameEdit = (player: Player) => {
    setEditingNameId(player.id);
    setEditName(player.name);
  };

  const saveNameEdit = () => {
    if (editingNameId) {
      onUpdateName(editingNameId, editName);
      setEditingNameId(null);
    }
  };

  const startScoreEdit = (player: Player) => {
    setEditingScoreId(player.id);
    setEditScore(player.score.toString());
  };

  const saveScoreEdit = () => {
    if (editingScoreId) {
      const val = parseInt(editScore);
      if (!isNaN(val)) {
        onUpdateScore(editingScoreId, val);
      }
      setEditingScoreId(null);
    }
  };

  return (
    <Box 
      sx={{ 
        mt: 4, 
        p: 2, 
        bgcolor: 'rgba(0,0,0,0.5)', 
        borderTop: '4px solid',
        borderColor: 'grey.700',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        {players.map((player) => (
          <Paper 
            key={player.id} 
            elevation={0}
            sx={{ 
              position: 'relative',
              width: 200,
              bgcolor: '#c6c6c6', 
              border: '4px solid',
              borderColor: 'white',
              borderRightColor: '#555',
              borderBottomColor: '#555',
              p: 1,
              borderRadius: 0
            }}
          >
            <IconButton 
              size="small"
              onClick={() => onRemovePlayer(player.id)}
              sx={{ 
                position: 'absolute', top: -10, right: -10, bgcolor: '#aa0000', color: 'white',
                border: '2px solid white', borderRadius: 0, width: 24, height: 24,
                '&:hover': { bgcolor: '#ff5555' }, zIndex: 2
              }}
            >
              <CloseIcon sx={{ fontSize: '1rem' }} />
            </IconButton>

            {editingNameId === player.id ? (
              <TextField
                variant="standard" value={editName} onChange={(e) => setEditName(e.target.value)}
                onBlur={saveNameEdit} onKeyDown={(e) => e.key === 'Enter' && saveNameEdit()} autoFocus
                inputProps={{ style: { textAlign: 'center', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8rem' } }}
                fullWidth sx={{ mb: 1 }}
              />
            ) : (
              <Typography align="center" onClick={() => startNameEdit(player)}
                sx={{ color: '#3f3f3f', fontSize: '0.8rem', mb: 1, fontWeight: 'bold', fontFamily: '"Press Start 2P", cursive', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                {player.name}
              </Typography>
            )}
            
            <Box 
              sx={{ bgcolor: '#000', border: '2px solid #8b8b8b', borderRightColor: '#fff', borderBottomColor: '#fff', p: 1, mb: 1, cursor: 'pointer' }}
              onClick={() => startScoreEdit(player)}
            >
              {editingScoreId === player.id ? (
                  <TextField
                    variant="standard" value={editScore} onChange={(e) => setEditScore(e.target.value)}
                    onBlur={saveScoreEdit} onKeyDown={(e) => e.key === 'Enter' && saveScoreEdit()} autoFocus
                    inputProps={{ style: { textAlign: 'center', fontFamily: '"Press Start 2P", cursive', color: '#55ff55', fontSize: '1.2rem' }, type: 'number' }}
                    sx={{ '& .MuiInput-underline:before': { borderBottomColor: 'white' }, '& .MuiInput-underline:after': { borderBottomColor: '#55ff55' } }}
                  />
              ) : (
                  <Typography variant="h5" align="center" sx={{ fontFamily: '"Press Start 2P", cursive', color: player.score >= 0 ? '#55ff55' : '#ff5555', textShadow: '2px 2px #000' }}>
                     ${player.score}
                  </Typography>
              )}
            </Box>

            <Stack direction="row" spacing={1} justifyContent="center">
              <Button size="small" variant="contained" onClick={() => onAdjust(player.id, -200)} sx={{ minWidth: 30, p: 0.5, bgcolor: '#aa0000', color: 'white', borderRadius: 0, border: '2px solid white', borderRightColor: '#555', borderBottomColor: '#555', fontFamily: '"Press Start 2P", cursive', '&:hover': { bgcolor: '#ff5555' } }}>-</Button>
              <Button size="small" variant="contained" onClick={() => onAdjust(player.id, 200)} sx={{ minWidth: 30, p: 0.5, bgcolor: '#00aa00', color: 'white', borderRadius: 0, border: '2px solid white', borderRightColor: '#555', borderBottomColor: '#555', fontFamily: '"Press Start 2P", cursive', '&:hover': { bgcolor: '#55ff55' } }}>+</Button>
            </Stack>
          </Paper>
        ))}

        <IconButton onClick={onAddPlayer} sx={{ bgcolor: '#c6c6c6', border: '4px solid white', borderRadius: 0, '&:hover': { bgcolor: '#fff' } }}>
          <AddIcon />
        </IconButton>
      </Box>

      {/* Max Players Control */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2, color: 'grey.500' }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>MAX PLAYERS:</Typography>
          <TextField
            variant="standard"
            type="number"
            value={maxPlayers || 3}
            onChange={(e) => onUpdateMaxPlayers(parseInt(e.target.value) || 3)}
            inputProps={{ min: 1, max: 100, style: { color: 'white', textAlign: 'center', width: '50px', fontFamily: 'monospace' } }}
            sx={{ '& .MuiInput-underline:before': { borderBottomColor: 'grey.700' } }}
          />
      </Stack>
    </Box>
  );
}
