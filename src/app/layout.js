const inter = Inter({ subsets: ['latin'] })
import './globals.css'
import { Inter } from 'next/font/google'
import { GlobalProvider } from '@/context/store';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata = {
  title: 'Muvi',
  description: 'Josren 2023',
}

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <GlobalProvider>
            {children}
          </GlobalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
