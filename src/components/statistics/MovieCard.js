import React from 'react';
import Image from "next/image";
import styled from "styled-components";
import { Card, Avatar, List, Statistic } from 'antd';
import { formatTime } from "@/utils/utils";

const Container = styled.div`
  display: flex;
  flex-direction:column;
  justify-content: center;
  align-items: center;
  width:100%;
//   border:1px solid red;
`;

const MovieCard = ({ title, time, poster_path, episodes, index, my_rating, media_type }) => {
    return (

        // add ellipsis, better formatting
        <Card style={{ width: "100%", marginTop: '16px', marginRight: "16px" }}>
            <div style={{ display: "flex" }}>
                <h1>{index}</h1>
                <Image
                    unoptimized
                    src={"https://image.tmdb.org/t/p/original/" + poster_path}
                    alt={title}
                    width={50}
                    height={75}
                    style={{ objectFit: "cover", marginLeft: "10px" }}
                />
                <div style={{ marginLeft: "10px", }}>
                    <div className='ellipsis'>
                        {title}
                    </div>
                    {media_type === "movie" ? <div>
                        {formatTime(time, "DHM")}
                    </div> : <div>
                        {formatTime(time, "H2")} Hours
                    </div>}
                    <div>
                        {episodes} Episodes
                    </div>
                    <div>
                        {my_rating} Rating
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default MovieCard;
