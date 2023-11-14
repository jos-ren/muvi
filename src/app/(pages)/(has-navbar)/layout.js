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
import { useTheme } from '@mui/material/styles';
import { DownOutlined, ArrowRightOutlined, UserOutlined, ApartmentOutlined, SettingOutlined  } from '@ant-design/icons';
import { Dropdown, Space, Button } from 'antd';
import { onAuthStateChanged } from "firebase/auth";

export default function ContentRootLayout({ children }) {
  const router = useRouter()
  const pathName = usePathname()
  const theme = useTheme();
  const medium = useMediaQuery(theme.breakpoints.up('md'));
  const large = useMediaQuery(theme.breakpoints.up('lg'));
  const [navData, setNavData] = useState()

  const logOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error(err)
    }
    router.push('/auth')
  };

  const items = [
    {
      test: <div>test</div>
    },
    {
      key: '1',
      label: <div onClick={() => { router.push('/settings') }}>Settings</div>,
      icon: <SettingOutlined />,
    },
    // dont show if not admin
    {
      key: '2',
      label: <div onClick={() => { router.push('/admin/dashboard') }}>Admin Console</div>,
      icon: <ApartmentOutlined />
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


  useEffect(() => {
    // monitors login status
    onAuthStateChanged(auth, (u) => {
      setNavData(u)
    })
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
        <div style={{ position: "absolute", right: "15px", display:"flex", alignItems:"center" }}>
          <div style={{ marginRight: "10px" }}>{navData ? navData.email : ""}</div>
          {/* <div style={{ marginRight: "10px" }}>{navData ? navData.displayName : "email"}</div> */}
          <Dropdown arrow menu={{ items }} trigger={['click']} placement="bottomRight" overlayClassName="nav-dropdown">
            <div style={{ cursor:"pointer", display:"flex", alignItems:"center"}}>
              <Image unoptimized height={30} width={30} quality="100" src={navData ? navData.photoURL : "default_avatar.jpg"} alt={"profile_pic"} style={{ borderRadius: "50%", marginRight: "10px" }} />
              <DownOutlined />
            </div>
          </Dropdown>
          {/* <Button style={{ margin: "0px 10px" }} onClick={logOut}>Logout</Button> */}
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

