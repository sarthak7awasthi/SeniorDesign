import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { red } from '@mui/material/colors';
import 'typeface-lato';

const theme = createTheme({
  palette: {
    primary: {
      main: '#096add', // Primary color
    },
    secondary: {
      main: '#cc004c', // Secondary color
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#f0f0f0',
    },
  },
  typography: {
    fontFamily: 'Lato, Arial, sans-serif',
    h1: {
      fontFamily: 'Lato',
    },
    h2: {
      fontFamily: 'Lato',
    }
  },

});

export default theme;


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <App />
   </ThemeProvider>
  </React.StrictMode>,

)
