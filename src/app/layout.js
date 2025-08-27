const inter = Inter({ subsets: ['latin'] })
import './globals.css'
import { Inter } from 'next/font/google'
import { GlobalProvider } from '@/context/store';
import { ThemeProvider } from '@/context/ThemeContext';
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'Muvi',
  description: 'Josren 2025',
}

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <Analytics>
          <ThemeProvider>
            <GlobalProvider>
              {children}
            </GlobalProvider>
          </ThemeProvider>
        </Analytics>
      </body>
    </html>
  )
}
