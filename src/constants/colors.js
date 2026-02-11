
// 1. Define the Raw Palette (The specific hex codes)
const palette = {
  // Primary Indigo shades
  primary: "#6366f1", // Dashboard Primary
  indigo500: "#4f46e5", // Login/Launch Primary
  indigo600: "#4338ca",
  indigo100: "#e0e7ff",
  indigo900: "#312e81",
  indigo50: "#eef2ff",
  indigo900_30: "rgba(49, 46, 129, 0.3)",
  
  
  // Slate / Neutral palette
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1e293b",
  slate900: "#0f172a",
  backgroundDark: "#020617", // Deepest background for Dashboard Dark Mode

  // Status and Accent Colors
  green500: "#22c55e",
  yellow500: "#eab308",
  red500: "#ef4444",
  
  teal: "#14b8a6",
  teal50: "#f0fdfa",
  teal900_20: "rgba(20, 184, 166, 0.2)",
  
  lime: "#84cc16",
  lime50: "#f7fee7",
  lime900_20: "rgba(132, 204, 22, 0.2)",

  // UI Specific Hexes
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",

  // Card Background Tints (Dashboard specific)
  purpleTintLight: "#f5f3ff",
  purpleTintDark: "#1a0e38",
  orangeTintLight: "#fff7ed",
  orangeTintDark: "#220c00",
  blueTintLight: "#eff6ff",
  blueTintDark: "#001026",

  bgDarkTimetable: "#121121",
  blue500: "#3b82f6",
  orange500: "#f97316",
  green500: "#22c55e",

  indigo400: '#818cf8',
  indigo700: '#4338ca',
  verifiedGreen: '#22c55e',

  red600: "#dc2626", // Specific red for delete button
  red50: "#fef2f2",  // Light mode red bg
  red900_30: "rgba(127, 29, 29, 0.4)", // Dark mode red bg

  slate100: '#f1f5f9',
  slate800: '#1e293b',
  overlay: 'rgba(0, 0, 0, 0.5)',

  slate200: "#e2e8f0",
  slate700: "#334155",

  teal500: "#14b8a6",
  teal50: "#f0fdfa",
  teal900_20: "rgba(20, 184, 166, 0.2)",

  indigo100: "#e0e7ff",
  indigo900_40: "rgba(49, 46, 129, 0.4)",
  green100: "#dcfce7",
  green900_40: "rgba(20, 83, 45, 0.4)",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate700: "#334155",

  red500: "#ef4444",
  slate100: "#f1f5f9",
  slate800_60: "rgba(30, 41, 59, 0.6)",
  indigo100: "#e0e7ff",
  indigo900: "#312e81",
  overlayBlack: "rgba(0,0,0,0.7)",

  yellow50: "#fefce8",
  yellow200: "#fef08a",
  yellow800: "#854d0e",
  yellow900_20: "rgba(133, 77, 14, 0.2)",
  overlayBlack: "rgba(0, 0, 0, 0.6)",

  green500: "#22c55e",
  yellow500: "#eab308",
  red500: "#ef4444",


  

};

// 2. Export Semantic Names (Usage across components)
export const THEME = {
  fonts: {
    regular: 'Urbanist_400Regular',
    medium: 'Urbanist_500Medium',
    semiBold: 'Urbanist_600SemiBold',
    bold: 'Urbanist_700Bold',
    extraBold: 'Urbanist_800ExtraBold',
    black: 'Urbanist_900Black',
  },
  light: {
    background: palette.white,
    headerBg: "rgba(255, 255, 255, 0.9)",
    card: palette.white,
    textPrimary: palette.slate900,
    textSecondary: palette.slate600,
    border: palette.slate200,
    primary: palette.indigo500,
    iconBg: palette.indigo100,
    inputBg: palette.transparent,
    placeholder: palette.slate400,

    toggleTrackOff: palette.slate200,
    toggleTrackOn: palette.primary, // Indigo-500
    toggleKnob: "#ffffff",

    // Component-Specific Tints
    cardPurple: palette.purpleTintLight,
    cardOrange: palette.orangeTintLight,
    cardBlue: palette.blueTintLight,
    cardSlate: palette.slate50,
    
    // Accent colors for Launch/Dashboard icons
    accentTeal: palette.teal,
    bgTeal: palette.teal50,
    accentLime: palette.lime,
    bgLime: palette.lime50,
    accentIndigo: palette.indigo500,
    bgIndigo: palette.indigo50,
    
    // Header/UpNext accents
    accentPurple: "#7c3aed",
    accentOrange: "#ea580c",
    accentBlue: "#1d4ed8",


    timetableBg: "#f8fafc",
    cardBg: "#ffffff",
    statusCompletedBg: "rgba(34, 197, 94, 0.1)",
    statusOngoingBg: "rgba(59, 130, 246, 0.1)",
    statusUpcomingBg: "rgba(249, 115, 22, 0.1)",

    profileGradient: ['#6366f1', '#4f46e5'],
    avatarBg: '#818cf8',
    verified: palette.verifiedGreen,

    danger: palette.red500,
    dangerBg: palette.red50,
    settingIcon: palette.slate500,

    inputLocked: '#f1f5f9',
    inputLockedText: '#64748b',
    dropdownIcon: '#94a3b8',

    iconTealBg: palette.teal50,
    iconTeal: palette.teal500,
    iconRedBg: palette.red50, 
    iconYellowBg: palette.yellow50, 
    yellow: palette.yellow500,
    orange: palette.orange500,

    timelineLine: palette.slate200,
    timelineDot: palette.primary,
    timelineDotFree: palette.slate300,
    statusUpcomingBg: palette.indigo100,
    statusUpcomingText: palette.indigo700,
    statusOngoingBg: palette.green100,
    statusOngoingText: palette.green700,
    statusCompletedBg: palette.slate200,
    statusCompletedText: palette.slate600,

    editCardBorder: palette.primary,
    addClassBg: palette.slate50,
    addClassBorder: palette.slate300,
    deleteIcon: palette.slate400,
    deleteIconActive: palette.red500,

    infoBannerBg: palette.indigo100,
    infoBannerText: palette.indigo900,
    overlay: palette.overlayBlack,

    warningBg: palette.yellow50,
    warningBorder: palette.yellow200,
    warningText: palette.yellow800,
    overlay: palette.overlayBlack,

    inputBg: '#ffffff',
    inputBorder: '#e2e8f0',
    inputFocused: '#4f46e5',
    placeholder: '#94a3b8',
    dangerText: '#ef4444',
    dangerBorder: '#fecaca',
    typeBtnBg: '#ffffff',
    typeBtnText: '#475569',
    success: palette.green500,
    toggle: palette.white,

    statusPerfect: palette.green500,
    statusWarning: palette.yellow500,
    statusCritical: palette.red500,
    badgeGreen: "rgba(34, 197, 94, 0.1)",
    badgeYellow: "rgba(234, 179, 8, 0.1)",
    badgeRed: "rgba(239, 68, 68, 0.1)",

    
  },
  dark: {
    success: palette.green500,
    background: palette.backgroundDark,
    headerBg: "rgba(2, 6, 23, 0.9)",
    card: palette.slate800,
    textPrimary: palette.white,
    textSecondary: palette.slate400,
    border: palette.slate700,
    primary: palette.indigo500,
    iconBg: "rgba(49, 46, 129, 0.4)", 
    inputBg: palette.transparent,
    placeholder: palette.slate500,

    // Component-Specific Tints
    cardPurple: palette.purpleTintDark,
    cardOrange: palette.orangeTintDark,
    cardBlue: palette.blueTintDark,
    cardSlate: palette.slate800,

    // Accent colors for Launch/Dashboard icons
    accentTeal: palette.teal,
    bgTeal: palette.teal900_20,
    accentLime: palette.lime,
    bgLime: palette.lime900_20,
    accentIndigo: palette.indigo500,
    bgIndigo: palette.indigo900_30,
    
    // Header/UpNext accents
    accentPurple: "#a78bfa",
    accentOrange: "#fdba74",
    accentBlue: "#93c5fd",


    timetableBg: "#121121",
    cardBg: "#1e293b",
    statusCompletedBg: "rgba(34, 197, 94, 0.2)",
    statusOngoingBg: "rgba(59, 130, 246, 0.2)",
    statusUpcomingBg: "rgba(249, 115, 22, 0.2)",

    profileGradient: ['#312e81', '#1e1b4b'],
    avatarBg: '#1e1b4b',
    verified: palette.verifiedGreen,

    danger: palette.red500,
    dangerBg: palette.red900_30,
    settingIcon: palette.slate400,

    inputLocked: '#1e293b',
    inputLockedText: '#94a3b8',
    dropdownIcon: '#475569',

    toggleTrackOff: palette.slate700,
    toggleTrackOn: palette.primary,
    toggleKnob: "#ffffff",

    iconTealBg: palette.teal900_20,
    iconTeal: palette.teal500,
    iconRedBg: palette.red900_30,
    iconYellowBg: "rgba(234, 179, 8, 0.2)",
    yellow: palette.yellow500,
    orange: palette.orange500,

    timelineLine: palette.slate700,
    timelineDot: palette.primary,
    timelineDotFree: palette.slate600,
    statusUpcomingBg: palette.indigo900_40,
    statusUpcomingText: palette.indigo400,
    statusOngoingBg: palette.green900_40,
    statusOngoingText: palette.green400,
    statusCompletedBg: palette.slate700,
    statusCompletedText: palette.slate400,

    editCardBorder: palette.primary,
    addClassBg: palette.slate800_60,
    addClassBorder: palette.slate700,
    deleteIcon: palette.slate500,
    deleteIconActive: palette.red500,

    infoBannerBg: "rgba(49, 46, 129, 0.4)", // indigo-900/40
    infoBannerText: palette.indigo100,
    overlay: palette.overlayBlack,

    warningBg: palette.yellow900_20,
    warningBorder: "#422006",
    warningText: "#fde047",
    overlay: palette.overlayBlack,


    inputBg: '#1e293b',
    inputBorder: '#334155',
    inputFocused: '#4f46e5',
    placeholder: '#475569',
    dangerText: '#f87171',
    dangerBorder: 'rgba(127, 29, 29, 0.4)',
    typeBtnBg: '#1e293b',
    typeBtnText: '#94a3b8',
    toggle: palette.indigo500,


    statusPerfect: palette.green500,
    statusWarning: palette.yellow500,
    statusCritical: palette.red500,
    badgeGreen: "rgba(34, 197, 94, 0.2)",
    badgeYellow: "rgba(234, 179, 8, 0.2)",
    badgeRed: "rgba(239, 68, 68, 0.2)",

    
  },
};

// 3. Export raw palette for manual overrides
export const COLORS = palette;