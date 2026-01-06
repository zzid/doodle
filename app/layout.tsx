'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import '../src/styles/index.css';
import weekday from 'dayjs/plugin/weekday';
import isSmaeOfAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import dayjs from 'dayjs';

dayjs.extend(weekday);
dayjs.extend(isSmaeOfAfter);
dayjs.extend(isSameOrBefore);

const theme = {
  colors: {
    primary: '#2563eb',
    secondary: '#60a5fa',
    tertiary: '#93c5fd',
    quaternary: '#bfdbfe',
    quinary: '#dbeafe',
    senary: '#eff6ff',
    septenary: '#f3f4f6',
    octonary: '#f9fafb',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const currentTheme = isDark
    ? {
        ...theme,
        colors: {
          ...theme.colors,
          primary: '#60a5fa',
          secondary: '#2563eb',
          tertiary: '#1e293b',
          quaternary: '#334155',
          quinary: '#475569',
          senary: '#64748b',
          septenary: '#94a3b8',
          octonary: '#f1f5f9',
          background: '#0f172a',
          text: '#f1f5f9',
        },
      }
    : theme;

  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={currentTheme}>
          <div
            style={{
              margin: 0,
              padding: 0,
              minHeight: '100vh',
              minWidth: '100vw',
              backgroundColor: '#181a20',
              backgroundImage: `
                repeating-linear-gradient(
                  to right,
                  rgba(255,255,255,0.0) 0,
                  rgba(255,255,255,0.1) 1px, 
                  transparent 2px,
                  transparent 20px
                ),
                repeating-linear-gradient(
                  to right,
                  rgba(255,255,255,0.0) 0,
                  rgba(255,255,255,0.25) 1px,
                  transparent 1px,
                  transparent 100px
                ),
                repeating-linear-gradient(
                  to bottom,
                  rgba(255,255,255,0.0) 0,
                  rgba(255,255,255,0.1) 1px,
                  transparent 2px,
                  transparent 20px
                ),
                repeating-linear-gradient(
                  to bottom,
                  rgba(255,255,255,0.0) 0,
                  rgba(255,255,255,0.25) 1px,
                  transparent 1px,
                  transparent 100px
                )
              `,
              backgroundSize: '40px 40px',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {mounted ? children : null}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

