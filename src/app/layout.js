import './globals.css'
import { Inter } from 'next/font/google'
import Head from 'next/head';
import Navbar from '../../comps/Navbar';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Movie Tracker',
  description: 'JOSREN ©2023',
  link: "muvi-icon.svg"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
