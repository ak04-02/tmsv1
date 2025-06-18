import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { amber, deepOrange, grey, blueGrey } from '@mui/material/colors';
import { alpha } from '@mui/material/styles';
const ColorModeContext = createContext({ toggleColorMode: () => {} });
export const useTheme = () => useContext(ColorModeContext);
export function CustomThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode],
  );
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
                secondary: { main: '#dc004e' },
                background: { default: grey[100], paper: '#fff' },
                text: { primary: grey[900], secondary: grey[700] },
                appBar: { main: 'rgb(205, 209, 213)' },
                sidebar: { main: 'rgb(255, 255, 255)' },
              }
            : {
                primary: { main: '#90caf9', light: '#e3f2fd', dark: '#42a5f5' },
                secondary: { main: '#f48fb1' },
                background: { default: '#0a0a0a', paper: '#1e1e1e' },
                text: { primary: '#fff', secondary: grey[400] },
                appBar: { main: '#1a1a1a' },
                sidebar: { main: '#2a2a2a' },
              }),
        },
        typography: {
          fontFamily: [
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
          h6: {
            fontWeight: 500,
          },
          body1: {
            fontSize: '1rem',
          },
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        backgroundColor: theme.palette.appBar.main,
                        color: theme.palette.mode === 'light' ? grey[900] : '#fff',
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                    }),
                },
            },
              MuiDrawer: {
              styleOverrides: {
                paper: ({ theme }) => ({
                  backgroundColor: theme.palette.sidebar.main,
                  color: theme.palette.text.primary,
                  borderRight: '1px solid',
                  borderColor: theme.palette.mode === 'light' ? grey[200] : '#3a3a3a',
                  overflowX: 'hidden', 
                }),
              },
            },
            MuiListItem: { 
              styleOverrides: {
                root: ({ theme }) => ({
                  borderRadius: theme.shape.borderRadius,
                  margin: theme.spacing(0.5, 0.5),
                  padding: theme.spacing(1.2, 1.5),
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  backgroundColor: theme.palette.mode === 'light' ? 'transparent' : 'transparent',
                  color: theme.palette.mode === 'light' ? theme.palette.text.secondary : theme.palette.text.primary,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.mode === 'light' ? theme.palette.text.secondary : theme.palette.text.primary,
                    minWidth: '40px',
                  },
                  '& .MuiListItemText-root': {
                      wordBreak: 'break-word',
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'light' ? grey[200] : blueGrey[800],
                    color: theme.palette.mode === 'light' ? theme.palette.primary.dark : theme.palette.primary.light,
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.mode === 'light' ? theme.palette.primary.dark : theme.palette.primary.light,
                    },
                  },
                  '&.active': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontWeight: theme.typography.fontWeightMedium,
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.contrastText,
                    },
                  },
                }),
              },
            },
            MuiButton: {},
            MuiCard: {},
            MuiInputBase: {},
        },
      }),
    [mode],
  );


  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}