import React from 'react';
import styled from "styled-components";
import Image from "next/image";
import { Button, Tooltip } from 'antd';
import { StarTwoTone, StarOutlined, EyeOutlined, SearchOutlined, CheckOutlined, RiseOutlined, EditOutlined, CheckCircleTwoTone, InfoCircleOutlined, } from '@ant-design/icons';
import { FaRegBookmark } from "react-icons/fa6";

const Header = ({ }) => {
    return (
        <div style={{ position:"fixed", display: "flex", borderBottom: "1px solid red", height: "40px", width:"100vw", left:"0px", top:"0px", zIndex:1, padding:"10px", background:"#001529" }}>
            <div style={{ 
                // border: "1px solid green", 
                marginLeft:"50px",
                display: "flex", alignItems: "center", color:"white" }}>
                <h2 >Muvi</h2>
            </div>
        </div>
    );
}

export default Header;