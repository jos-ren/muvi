import React from 'react';
import Image from "next/image";
import { Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { FaRegBookmark } from "react-icons/fa6";
import Tooltip from '@mui/material/Tooltip';
import { genreCodes } from "@/data"
import { formatGenres } from "@/api/utils"
import styled from "styled-components";

const Span = styled.div`
    display:flex;
`;

const Card = ({ addToSeen, addToWatchlist, cardTitle, src, alt, height = 200, width = 133, description, rating, vote_count, release_date, media_type, genre_ids }) => {

    return (
        <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <Tooltip
                placement="right-start"
                followCursor
                title={
                    <React.Fragment>
                        <div>
                            <h2>{cardTitle}</h2>
                            <p className='ellipsis-text'>{description}</p>
                            <p>{rating}</p>
                            <p>{vote_count}</p>
                            <p>{release_date}</p>
                            <p>{media_type}</p>
                            <Span>
                                <div>Genres:</div>
                                <div>{formatGenres(genre_ids, genreCodes)}</div>
                            </Span>
                        </div>
                    </React.Fragment>
                }
            >
                <Image unoptimized height={height} width={width} quality="75" src={src} alt={alt} style={{ borderRadius: "6px", width: "100%", height: "auto", objectFit: "contain" }} />
            </Tooltip>
            <div style={{
                maxWidth: "200px",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
                // textOverflow: "clip"
            }}>
                {cardTitle}
            </div>
            <div>
                <Button style={{ margin: "5px 5px 0px 0px" }} type="default" onClick={addToSeen} icon={<CheckOutlined />}>Seen</Button>
                <Button type="default" onClick={addToWatchlist} icon={<FaRegBookmark />}></Button>
            </div>
        </div>
    );
}

export default Card;