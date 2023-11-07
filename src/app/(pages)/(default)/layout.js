"use client";
import '../../globals.css';
import styled from "styled-components";
import Image from "next/image";
import { tabs } from "../../../data";
import { Button } from 'antd';
import { auth } from "../../../config/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from 'next/navigation';
import tmdb from "../../../../public/tmdb.svg";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function ContentRootLayout({ children }) {
  const router = useRouter()
  const pathName = usePathname()
  const theme = useTheme();
  const medium = useMediaQuery(theme.breakpoints.up('md'));
  const large = useMediaQuery(theme.breakpoints.up('lg'));

  console.log(large, medium)

  const logOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error(err)
      // onMessage(`${err.name + ": " + err.code}`, "error")
    }
    router.push('/auth/login')
  };

  return (
    <div style={{minHeight:"100vh", display:"flex", flexDirection:"column"}}>
      <div className='header' >
        <div className='tab-container'>
          {tabs.map(o => (
            <div
              key={o.id}
              onClick={() => { router.push(o.route) }}
              className='tab-item'
              style={pathName === o.route ? { borderBottom: '2px solid white', opacity: '1', color: 'white' } : {}}
            >
              <div style={{ margin: "5px" }}>{o.icon}</div>
              {o.name}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", position: "absolute", right: "0px" }}>
          <Image unoptimized height={30} width={30} quality="100" src={"default_avatar.jpg"} alt={"profile_pic"} style={{ borderRadius: "50%" }} />
          <Button style={{ margin: "0px 10px" }} onClick={logOut}>Logout</Button>
        </div>
      </div>

      <div style={large ? { margin: "0px 15vw", flex: 1 } : medium ? { margin: "0px 10vw", flex: 1 } : { margin: "0px 50px", flex: 1 }}>
        {children}
      </div>

      <div className='footer'>
        <>JOSREN ©2023 | Created using data from</>
        <Image unoptimized height="20" width="66" quality="75" src={tmdb} alt={"tmdb"} style={{ marginLeft: "7px" }} />
      </div>
    </div >
  )
}
