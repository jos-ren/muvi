import React from 'react';
import styled from "styled-components";
import Image from "next/image";
import { Button } from 'antd';
import { StarTwoTone, StarOutlined, EyeOutlined, SearchOutlined, CheckOutlined, RiseOutlined, EditOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { FaRegBookmark } from "react-icons/fa6";
const Card = ({ addToSeen, addToWatchlist, title, src, alt, height=200, width=125 }) => {
    return (
            <div
                style={{ border: "1px solid red", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <Image height={height} width={width} quality="75" src={src} alt={alt} />
                <div>{title}</div>
                <div>
                    <Button type="default" onClick={addToSeen}>Add to Seen</Button>
                    <Button type="default" onClick={addToWatchlist} icon={<FaRegBookmark/>}></Button>
                </div>
            </div>
    );
}

export default Card;