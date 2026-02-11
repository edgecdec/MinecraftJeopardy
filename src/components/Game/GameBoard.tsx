'use client';

import React from 'react';
import { Box, Grid, Stack, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import JeopardyTile from '@/components/JeopardyTile';
import { Category, Clue } from '@/hooks/useGame';

interface GameBoardProps {
  questions: Category[];
  answeredClues: Set<string>;
  onSelectClue: (clue: Clue) => void;
  onReplaceCategory: (category: string) => void;
}

export default function GameBoard({ 
  questions, 
  answeredClues, 
  onSelectClue, 
  onReplaceCategory 
}: GameBoardProps) {
  
  if (!questions || questions.length === 0) {
    return (
      <Box sx={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5" color="error" sx={{ fontFamily: '"Press Start 2P", cursive' }}>
          GENERATING WORLD...
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        height: '60vh', 
        minHeight: 400,
        border: '8px solid',
        borderColor: 'grey.900',
        bgcolor: 'black', 
        p: 1, 
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Grid 
        container 
        spacing={1} 
        sx={{ 
          height: '100%',
          width: '100%',
          m: 0,
          alignItems: 'stretch',
          justifyContent: 'center'
        }}
      >
        {questions.map((cat, colIndex) => (
          <Grid 
            item 
            key={cat.category} 
            sx={{ 
              height: '100%', 
              flexBasis: 0, 
              flexGrow: 1, 
              maxWidth: `${100 / questions.length}%` 
            }}
          >
            <Stack spacing={1} sx={{ height: '100%' }}>
              {/* Category Header with Tooltip */}
              <Tooltip title={cat.description || "No description available."} arrow placement="top">
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 1, 
                    textAlign: 'center', 
                    bgcolor: 'grey.700',
                    backgroundImage: 'url("/textures/stone.png")',
                    backgroundSize: '64px',
                    color: 'white',
                    border: '4px solid white',
                    borderRadius: 0,
                    height: '15%', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'help',
                    animation: 'popIn 0.5s ease-out backwards',
                    animationDelay: `${colIndex * 100}ms`,
                    '&:hover .refresh-btn': { opacity: 1 }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: '"Press Start 2P", cursive', 
                      fontSize: { xs: '0.4rem', md: '0.6rem', lg: '0.8rem' }, 
                      lineHeight: 1.2,
                      textShadow: '2px 2px #000',
                      wordBreak: 'break-word',
                      px: 2
                    }}
                  >
                    {cat.category.toUpperCase()}
                  </Typography>
                  <IconButton
                    className="refresh-btn"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onReplaceCategory(cat.category);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      color: 'rgba(255,255,255,0.7)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      padding: 0.5,
                      '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Paper>
              </Tooltip>
              
              {cat.clues.map((clue, rowIndex) => (
                <Box 
                  key={clue.id} 
                  sx={{ 
                    flex: 1,
                    animation: 'popIn 0.4s ease-out backwards',
                    animationDelay: `${(colIndex * 100) + ((rowIndex + 1) * 50)}ms` 
                  }}
                >
                  <JeopardyTile
                    clue={clue}
                    isAnswered={answeredClues.has(clue.id)}
                    onClick={() => onSelectClue(clue)}
                  />
                </Box>
              ))}
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}