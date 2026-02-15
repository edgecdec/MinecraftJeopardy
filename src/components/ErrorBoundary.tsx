'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, color: 'error.main', bgcolor: '#121212', minHeight: '100vh', textAlign: 'center' }}>
          <Typography variant="h4">SOMETHING WENT WRONG</Typography>
          <Typography variant="body1" sx={{ mt: 2, fontFamily: 'monospace', color: 'white' }}>
            {this.state.error?.toString()}
          </Typography>
          <Button variant="contained" color="secondary" onClick={() => window.location.reload()} sx={{ mt: 4 }}>
            RELOAD
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
