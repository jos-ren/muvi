"use client"
import './globals.css'
import { Inter } from 'next/font/google'
import Image from "next/image";
import styled from "styled-components";
import { tabs } from "../../data.js"
// import { useRouter } from 'next/router'
import Link from 'next/link'

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

