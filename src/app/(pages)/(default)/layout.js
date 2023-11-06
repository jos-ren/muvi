"use client"
import '../../globals.css'
import { Inter } from 'next/font/google'
import styled from "styled-components";
import { useState, useEffect } from "react";
import Image from "next/image";
import { tabs } from "../../../../data"
import { Button } from 'antd';
import { auth } from "../../../config/firebase.js"
import { onAuthStateChanged, signOut } from "firebase/auth";
const inter = Inter({ subsets: ['latin'] })

const Tabbar = styled.div`

`;

const Tabs = styled.div`

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
`
// ${({ active }) => {
//     return active &&
//       `
//     border-bottom: 2px solid white;
//     opacity: 1;
//     color:white;
//   `
//   }}

export default function ContentRootLayout({ children }) {
  const logOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error(err)
      // onMessage(`${err.name + ": " + err.code}`, "error")
    }
  };
  // console.log(user)

  return (
    <div>
      {/* inline styles so it renders right away */}
      <div style={{
        background: '#001529',
        color: '#bbc0c4',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60px',
        fontSize: '11pt',
        borderBottom: '2px solid #001529',
        position: 'fixed',
        top: '0',
        width: '100%',
        zIndex: '100'
      }} >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {tabs.map(o => (
            <div
              key={o.id}
              style={{
                padding: '0px 10px 0px 5px',
                display: 'flex',
                height: '60px',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{margin:"5px"}}>{o.icon}</div>
              {o.name}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", position: "absolute", right: "0px" }}>
          {/* <Image unoptimized height={30} width={30} quality="100" src={user.photoURL ? user.photoURL : "default_avatar.jpg"} alt={"profile_pic"} style={{ borderRadius: "50%" }} /> */}
          <Button style={{ margin: "0px 10px" }} onClick={logOut}>Logout</Button>
        </div>
      </div>
      {children}
    </div >
  )
}

