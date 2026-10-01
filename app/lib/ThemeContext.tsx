import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type ThemeMode = 'light' | 'dark';

const lightColors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  secondaryText: '#64748B',
  border: '#E2E8F0',
  input: '#F8FAFC',
  primary: '#5064EF',
  primarySoft: '#EFF6FF',
  dangerBackground: '#FEE2E2',
  dangerText: '#DC2626',
};

const darkColors = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  secondaryText: '#CBD5E1',
  border: '#334155',
  input: '#1E293B',
  primary: '#5064EF',
  primarySoft: '#1E293B',
  dangerBackground: '#451A1A',
  dangerText: '#FCA5A5',
};

type ThemeContextType = {
  theme: ThemeMode;
  isDark: boolean;
  colors: typeof lightColors;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@fitmatch_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);

      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.log('Error cargando el tema:', error);
    }
  }

  async function setTheme(newTheme: ThemeMode) {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(STORAGE_KEY, newTheme);
    } catch (error) {
      console.log('Error guardando el tema:', error);
    }
  }

  async function toggleTheme() {
    await setTheme(theme === 'light' ? 'dark' : 'light');
  }

  const colors = theme === 'dark' ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      colors,
      setTheme,
      toggleTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme debe utilizarse dentro de ThemeProvider');
  }

  return context;
}