"use client"
import './globals.css'
import { Inter } from 'next/font/google'
import styled from "styled-components";
import { useState, useEffect, useRef, cloneElement } from "react";
import Image from "next/image";
import { tabs } from "../../data"
import { message, Button } from 'antd';

const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'Muvi',
//   description: 'JOSREN ©2023',
//   link: "muvi-icon.svg"
// }

const Body = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 10px;
`;

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

const Tabs = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Tab = styled.div`
padding:0px 10px 0px 5px;
display: flex;
height:60px;
align-items: center;
cursor:pointer;
// border:1px solid red;
&:hover{
  color:white;
}
> * {
  margin:5px;
}
${({ active }) => {
    return active &&
      `
    border-bottom: 2px solid white;
    opacity: 1;
    color:white;
  `
  }}
`

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <Tabbar>
          <Tabs>
            {tabs.map(o => (
              <Tab
                // active={active === o.id ? active : null}
                onClick={() => setActive(o.id)}
                key={o.id}
              >
                {o.icon}
                {o.name}
              </Tab>
            ))}
          </Tabs>
          <div style={{ display: "flex", alignItems: "center", position: "absolute", right: "0px" }}>
            {/* <Image unoptimized height={30} width={30} quality="100" src={user.photoURL ? user.photoURL : "default_avatar.jpg"} alt={"profile_pic"} style={{ borderRadius: "50%" }} /> */}
            {/* <Button style={{ margin: "0px 10px" }} onClick={logOut}>Logout</Button> */}
          </div>
        </Tabbar>
        {children}
      </body>
    </html>
  )
}

