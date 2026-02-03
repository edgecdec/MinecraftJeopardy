'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Stack, TextField, IconButton } from '@mui/material';
import { Player } from '@/hooks/useGame';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

interface ScoreBoardProps {
  players: Player[];
  onAdjust: (playerId: string, amount: number) => void;
  onUpdateName: (playerId: string, name: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
}

export default function ScoreBoard({ players, onAdjust, onUpdateName, onAddPlayer, onRemovePlayer }: ScoreBoardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
  };

  const saveEditing = () => {
    if (editingId) {
      onUpdateName(editingId, editName);
      setEditingId(null);
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
        justifyContent: 'center',
        gap: 4,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}
    >
      {players.map((player) => (
        <Paper 
          key={player.id} 
          elevation={0}
          sx={{ 
            position: 'relative',
            width: 200,
            bgcolor: '#c6c6c6', // Standard MC GUI Light Grey
            border: '4px solid',
            borderColor: 'white',
            borderRightColor: '#555',
            borderBottomColor: '#555',
            p: 1,
            borderRadius: 0
          }}
        >
          {/* Delete Button */}
          <IconButton 
            size="small"
            onClick={() => onRemovePlayer(player.id)}
            sx={{ 
              position: 'absolute', 
              top: -10, 
              right: -10, 
              bgcolor: '#aa0000', 
              color: 'white',
              border: '2px solid white',
              borderRadius: 0,
              width: 24,
              height: 24,
              '&:hover': { bgcolor: '#ff5555' },
              zIndex: 2
            }}
          >
            <CloseIcon sx={{ fontSize: '1rem' }} />
          </IconButton>

          {/* Player Name Tag (Editable) */}
          {editingId === player.id ? (
            <TextField
              variant="standard"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={saveEditing}
              onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
              autoFocus
              inputProps={{ 
                style: { 
                  textAlign: 'center', 
                  fontFamily: '"Press Start 2P", cursive', 
                  fontSize: '0.8rem' 
                } 
              }}
              fullWidth
              sx={{ mb: 1 }}
            />
          ) : (
            <Typography 
              align="center" 
              onClick={() => startEditing(player)}
              sx={{ 
                color: '#3f3f3f', 
                fontSize: '0.8rem', 
                mb: 1,
                fontWeight: 'bold',
                fontFamily: '"Press Start 2P", cursive',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {player.name}
            </Typography>
          )}
          
          {/* Score Display (Dark inset) */}
          <Box sx={{ 
            bgcolor: '#000', 
            border: '2px solid #8b8b8b', 
            borderRightColor: '#fff', 
            borderBottomColor: '#fff',
            p: 1,
            mb: 1
          }}>
            <Typography 
              variant="h5" 
              align="center" 
              sx={{ 
                fontFamily: '"Press Start 2P", cursive',
                color: player.score >= 0 ? '#55ff55' : '#ff5555',
                textShadow: '2px 2px #000'
              }}
            >
               ${player.score}
            </Typography>
          </Box>

          {/* Controls */}
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button 
              size="small" 
              variant="contained"
              sx={{ 
                minWidth: 30, 
                p: 0.5, 
                bgcolor: '#aa0000', 
                color: 'white', 
                borderRadius: 0,
                border: '2px solid white',
                borderRightColor: '#555',
                borderBottomColor: '#555',
                fontFamily: '"Press Start 2P", cursive',
                '&:hover': { bgcolor: '#ff5555' } 
              }}
              onClick={() => onAdjust(player.id, -200)}
            >
              -
            </Button>
            <Button 
              size="small" 
              variant="contained"
              sx={{ 
                minWidth: 30, 
                p: 0.5, 
                bgcolor: '#00aa00', 
                color: 'white', 
                borderRadius: 0,
                border: '2px solid white',
                borderRightColor: '#555',
                borderBottomColor: '#555',
                fontFamily: '"Press Start 2P", cursive',
                '&:hover': { bgcolor: '#55ff55' } 
              }}
              onClick={() => onAdjust(player.id, 200)}
            >
              +
            </Button>
          </Stack>
        </Paper>
      ))}

      {/* Add Player Button */}
      <IconButton 
        onClick={onAddPlayer}
        sx={{ 
          bgcolor: '#c6c6c6', 
          border: '4px solid white', 
          borderRadius: 0,
          '&:hover': { bgcolor: '#fff' } 
        }}
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
}
