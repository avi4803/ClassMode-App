const palette = {
  primary: '#4f46e5',
  primaryLight: '#e0e7ff', 
  white: '#ffffff',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  
  yellow500: '#eab308',
  red500: '#ef4444',
  green500: '#22c55e',
  slate300: '#cbd5e1',
  slate600: '#475569',
  slate80050: 'rgba(30, 41, 59, 0.5)', // Transparent dark bg
  slate300: '#cbd5e1', // Used for Light Mode Input Border
  slate500: '#64748b', // Used for Subtitle
  slate700: '#334155', // Used for Dark Mode Input Border
  green500: '#22c55e',
  yellow500: '#eab308',
  red500: '#ef4444',
  slate900: '#0f172a',
  white: '#ffffff',
};

export const lightTheme = {
  mode: 'light',
  inputBg: '#f1f5f9', // slate-100 for input background
  primary: palette.primary,
  background: palette.slate50,      // bg-background-light
  surface: palette.white,           // bg-card-light
  textMain: palette.slate800,       // text-slate-800
  textSecondary: palette.slate500,  // text-slate-500
  textMuted: palette.slate400,
  border: palette.slate200,         // border-slate-200
  inputBg: palette.slate50,         // bg-slate-50
  icon: palette.slate400,
  shadow: palette.primary,
  separator: palette.slate100,
  warning: palette.yellow500,
  statusbar: 'dark-content',
  inputBorder: palette.slate300,
  placeholder: palette.slate400,
  label: palette.slate600,
  borderColor: palette.slate300,
  textMuted: palette.slate500,
  success: palette.green500,
  warning: palette.yellow500,
  error: palette.red500,
  toastBg: palette.slate900,
  toastText: palette.white,
};

export const darkTheme = {
  mode: 'dark',
  primary: palette.primary,
  inputBg: '#1e293b', // slate-800 for input background
  background: palette.slate900,     // dark:bg-background-dark
  surface: palette.slate800,        // dark:bg-card-dark
  textMain: palette.slate200,       // dark:text-slate-200
  textSecondary: palette.slate400,  // dark:text-slate-400
  textMuted: palette.slate500,
  border: palette.slate700,         // dark:border-slate-700
  inputBg: palette.slate800,        // dark:bg-slate-800
  icon: palette.slate500,
  shadow: '#000000',
  separator: palette.slate700,
  warning: palette.yellow500,
  statusbar: 'light-content',
  inputBorder: palette.slate700,
  placeholder: palette.slate400,
  label: palette.slate300,
  borderColor: palette.slate700,
  textMuted: palette.slate400, // Light text for dark mode
  success: palette.green500,
  warning: palette.yellow500,
  error: palette.red500,
  toastBg: 'rgba(34, 197, 94, 0.2)', // green-status/20
  toastBorder: 'rgba(34, 197, 94, 0.5)',
  toastText: palette.white,
  
  
};