import React from 'react';
import styled from "styled-components";
import Image from "next/image";
import { Button, Tooltip } from 'antd';
import { StarTwoTone, StarOutlined, EyeOutlined, SearchOutlined, CheckOutlined, RiseOutlined, EditOutlined, CheckCircleTwoTone, InfoCircleOutlined, } from '@ant-design/icons';
import { FaRegBookmark } from "react-icons/fa6";
const Card = ({ addToSeen, addToWatchlist, title, src, alt, height = 200, width = 125, url }) => {
    return (
        <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <Image unoptimized height={height} width={width} quality="75" src={src} alt={alt} style={{borderRadius:"6px"}}/>
                <Tooltip title={title}>
                <div style={{
                    maxWidth: "200px",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    // textOverflow: "clip"
                }}>
                    {title}
                </div>
            </Tooltip>
            <div>
                <Button style={{ margin: "5px 5px 0px 0px" }} type="default" onClick={addToSeen} icon={<CheckOutlined />}>Seen</Button>
                <Button type="default" onClick={addToWatchlist} icon={<FaRegBookmark />}></Button>
                {/* <Button type="link" href={url} target="_blank" icon={<InfoCircleOutlined />}></Button> */}
            </div>
        </div>
    );
}

export default Card;