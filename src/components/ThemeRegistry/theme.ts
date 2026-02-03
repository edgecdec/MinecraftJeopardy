import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#060ce9', // Jeopardy Blue
    },
    secondary: {
      main: '#ffcc00', // Jeopardy Gold
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: 'inherit',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      color: '#ffcc00',
      textTransform: 'uppercase',
    },
    h4: {
      color: '#ffcc00',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '2px solid #000',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

export default theme;
