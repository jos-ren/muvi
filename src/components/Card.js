import React from 'react';
import Image from "next/image";
import { Button, Divider } from 'antd';
import { CheckOutlined, StarTwoTone } from '@ant-design/icons';
import { FaRegBookmark } from "react-icons/fa6";
import { genreCodes } from "@/data"
import { formatGenres } from "@/api/utils"
import styled from "styled-components";
import { styled as muiStyled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { TiStar } from "react-icons/ti";

const Span = styled.div`
    display:flex;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 4px);
  background-color: rgba(0, 0, 0, 1);
  display: flex;
  flex-direction:column;
  border:1px solid red;

  opacity: 1;
  transition: opacity 0.3s ease;
  border-radius:6px;
  color:white;
`;

const ImageWithOverlay = styled.div`
  position: relative;
  display: inline-block;

  &:hover {
    ${Overlay} {
      opacity: 1;
    }
  }
`;

const Card = ({ details, addToSeen, addToWatchlist, src, alt, height = 200, width = 133 }) => {

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            {/* overlay WIP */}
            
            {/* <ImageWithOverlay>
                <Image unoptimized height={height} width={width} quality="75" src={src} alt={alt} style={{ borderRadius: "6px", width: "100%", height: "auto", objectFit: "contain" }} />
                <Overlay>
                    <h3>{details.cardTitle}</h3>
                    <div style={{display:"flex"}}>
                    {Number.parseFloat(details.rating).toFixed(1)}
                    <div>{details.release_date}</div>
                    <div>{details.vote_count}</div>
                    </div>
                    <Divider />
                    <div>{details.media_type}</div>
                    <div>{formatGenres(details.genre_ids, genreCodes)}</div>
                    <div className='ellipsis-text'>{details.description}</div>
                    <div>View More</div>
                </Overlay>
            </ImageWithOverlay> */}
            <Image unoptimized height={height} width={width} quality="75" src={src} alt={alt} style={{ borderRadius: "6px", width: "100%", height: "auto", objectFit: "contain" }} />

            <div style={{
                maxWidth: "200px",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden"
            }}>
                {details.cardTitle}
            </div>
            <div>
                <Button style={{ margin: "5px 5px 0px 0px" }} type="default" onClick={addToSeen} icon={<CheckOutlined />}>Seen</Button>
                <Button type="default" onClick={addToWatchlist} icon={<FaRegBookmark />}></Button>
            </div>
        </div>
    );
}

export default Card;