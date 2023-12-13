"use client";
import '../../globals.css';
import { useState, useEffect } from "react";
import Image from "next/image";
import { tabs } from "../../../data.js";
import { auth } from "../../../config/firebase.js";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from 'next/navigation';
import tmdb from "../../../../public/tmdb.svg";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme as muiUseTheme } from '@mui/material/styles';
import { DownOutlined, ArrowRightOutlined, ApartmentOutlined, SettingOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useGlobalContext } from '@/context/store.js';
import { useTheme } from '@/context/ThemeContext';

export default function ContentRootLayout({ children }) {
  const router = useRouter()
  const pathName = usePathname()
  const muiTheme = muiUseTheme();
  const medium = useMediaQuery(muiTheme.breakpoints.up('md'));
  const large = useMediaQuery(muiTheme.breakpoints.up('lg'));
  const { user } = useGlobalContext();
  const { theme, toggleTheme } = useTheme();

  const logOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error(err)
    }
    router.push('/auth')
  };

  console.log(pathName)

  const items = [
    // {
    //   key: '1',
    //   label: <div onClick={() => { router.push('/settings') }}>Settings</div>,
    //   icon: <SettingOutlined />,
    // },
    {
      key: '2',
      label: <div onClick={() => { router.push('/admin/dashboard') }}>Admin Dashboard</div>,
      icon: <ApartmentOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: <div onClick={logOut}>Logout</div>,
      icon: <ArrowRightOutlined />,
    },
  ];

  return (
    <div style={pathName === "/statistics" ? {minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f5f7f9"  }: 
    { minHeight: "100vh", display: "flex", flexDirection: "column", background:"white" }}
    >
      <div className='header' >
        {/* <div>
          <button onClick={toggleTheme}>Toggle Theme</button>
        </div> */}
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
        <div style={{ position: "absolute", right: "15px", display: "flex", alignItems: "center" }}>
          <div style={{ marginRight: "10px" }}>{user ? user.email : ""}</div>

          <Dropdown arrow menu={{ items }} trigger={['click']} placement="bottomRight" overlayClassName="nav-dropdown">
            <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Image unoptimized height={30} width={30} quality="100" src={user ? user.photoURL : "default_avatar.jpg"} alt={"profile_pic"} style={{ borderRadius: "50%", marginRight: "10px" }} />
              <DownOutlined />
            </div>
          </Dropdown>
        </div>
      </div>

      <div style={
        large ? { margin: "0px 12.5vw", flex: 1 } :
          medium ? { margin: "0px 50px", flex: 1 } :
            { margin: "0px 15px", flex: 1 }
      }>
        {children}
      </div>

      <div className='footer'>
        <>JOSREN ©2023 | Created using data from</>
        <Image unoptimized height="20" width="66" quality="75" src={tmdb} alt={"tmdb"} style={{ marginLeft: "7px" }} />
      </div>
    </div >
  )
}

