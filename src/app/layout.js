"use client"
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'Muvi',
//   description: 'JOSREN ©2023',
//   link: "muvi-icon.svg"
// }


export default function RootLayout({ children }) {
  // const router = useRouter()

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

