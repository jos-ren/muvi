import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

import { Breadcrumb, Layout, Menu, theme } from 'antd';
const { Header, Content, Footer } = Layout;

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <Layout className="layout"> */}

      {/* <Header
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
        >
      </Header> */}
      <body className={inter.className} style={{ padding: "20px 100px" }}>{children}</body>
        {/* </Layout> */}
    </html>
  )
}
