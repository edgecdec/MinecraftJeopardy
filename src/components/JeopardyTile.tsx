import React from 'react';
import { Card, Typography, CardActionArea } from '@mui/material';
import { Clue } from '@/hooks/useGame';

interface JeopardyTileProps {
  clue: Clue;
  isAnswered: boolean;
  onClick: () => void;
}

export default function JeopardyTile({ clue, isAnswered, onClick }: JeopardyTileProps) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        bgcolor: 'transparent',
        boxShadow: 'none',
        borderRadius: 0,
        position: 'relative',
        display: 'flex',
      }}
    >
      <CardActionArea
        onClick={onClick}
        disabled={isAnswered}
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isAnswered ? 'grey.900' : 'primary.main',
          border: '4px solid',
          borderColor: isAnswered ? 'grey.800' : 'white',
          borderRightColor: isAnswered ? 'grey.800' : '#aaa', // 3D Effect
          borderBottomColor: isAnswered ? 'grey.800' : '#aaa',
          transition: 'transform 0.1s, background-color 0.2s',
          
          // Texture / Placeholder
          backgroundImage: isAnswered 
             ? 'repeating-linear-gradient(45deg, #111 0, #111 10px, #1a1a1a 10px, #1a1a1a 20px)' 
             : 'none',
          
          '&:hover': {
            bgcolor: isAnswered ? 'grey.900' : 'primary.dark',
            transform: isAnswered ? 'none' : 'scale(1.02)',
            zIndex: 10,
            borderColor: 'white'
          },
        }}
      >
        {!isAnswered && (
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontFamily: '"Press Start 2P", cursive', 
              color: 'secondary.main', // Gold
              textShadow: '3px 3px #000',
              fontWeight: 'bold',
              fontSize: { xs: '1rem', md: '1.5rem', lg: '2rem' }
            }}
          >
            ${clue.value}
          </Typography>
        )}
      </CardActionArea>
    </Card>
  );
}
