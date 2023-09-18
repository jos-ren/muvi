import React from 'react';
import styled from "styled-components";
import Image from "next/image";
import { Button,Tooltip} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { FaRegBookmark } from "react-icons/fa6";

const Header = ({ onDownload, onLogo}) => {
    return (
        <div style={{
            color: "white", position: "fixed", display: "flex", height: "40px", width: "calc(100vw - 20px)", left: "0px", top: "0px", zIndex: 1, padding: "10px", background: "#001529",
            justifyContent: "space-between"
        }}>
            <div 
            onClick={onLogo}
            style={{
                // border: "1px solid green",
                fontFamily:"Atyp",
                marginLeft: "50px",
                cursor: "pointer",
                display: "flex", alignItems: "center"
            }}>
                {/* <h1>M</h1> */}
                <Image height="24" width="24" quality="75" src={"muvi-logo.svg"} alt={"logo"}/>
            </div>
            <Tooltip title={"Download Data"}>
            <div style={{  marginRight: "50px", display: "flex", alignItems: "center", cursor: "pointer" }} 
            onClick={onDownload}>
                <DownloadOutlined />
            </div>
                </Tooltip>
        </div>
    );
}

export default Header;