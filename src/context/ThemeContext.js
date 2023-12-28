'use client'
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

//   useEffect(() => {
//     document.documentElement.style.setProperty('--background-light', theme === 'light' ? '#fff' : '#333');
//     document.documentElement.style.setProperty('--text-light', theme === 'light' ? '#000' : '#fff');
//     document.documentElement.style.setProperty('--background-dark', theme === 'light' ? '#333' : '#fff');
//     document.documentElement.style.setProperty('--text-dark', theme === 'light' ? '#fff' : '#000');
//   }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
