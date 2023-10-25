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

const Tabbar = styled.div`
  background: #001529;
  color: #bbc0c4;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  font-size: 11pt;
  border-bottom: 2px solid #001529;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
`;

const Tab = styled.div`
  padding:0px 10px;
  display: flex;
  height:60px;
  align-items: center;
  cursor:pointer;
  &:hover{
    color:white;
  }
  > * {
    margin:5px;
  }

  `;
  //   ${({ active }) => active &&
  //   `
  //   border-bottom: 2px solid white;
  //   opacity: 1;
  //   color:white;
  // `}

const Footer = styled.div`
  margin-top: 60px;
  display: flex;
  height: 60px;
  justify-content: center;
  align-items: center;
  position: relative;
  background: #fafafa;
  font-size: 10pt;
  width:100%;
  position: relative;
  bottom: 0px;
`;
export default function RootLayout({ children }) {
  // const router = useRouter()

  return (
    <html lang="en">
      <body className={inter.className}>
        <Tabbar>
          {tabs.map(o => (
            <Link
              key={o.id}
              href={o.path}
              style={{ textDecoration: 'none', color: '#bbc0c4' }}
            >
              <Tab >
                {o.icon}
                {o.name}
              </Tab>
            </Link>
          ))}
        </Tabbar>
        {children}
        <Footer>
          <>JOSREN ©2023 | Created using data from</>
          <Image unoptimized height="20" width="66" quality="75" src={"tmdb.svg"} alt={"tmdb"} style={{ marginLeft: "7px" }} />
        </Footer>
      </body>
    </html>
  )
}

