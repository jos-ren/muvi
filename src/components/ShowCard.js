import React from 'react';
import Image from "next/image";
import styled from "styled-components";
import { Card, Avatar, List, Statistic } from 'antd';
import { formatTime } from "@/api/utils";

const Container = styled.div`
  display: flex;
  flex-direction:column;
  justify-content: center;
  align-items: center;
  width:100%;
//   border:1px solid red;
`;

const ShowCard = ({ title, time, poster_path, episodes, index }) => {
    return (

        // add ellipsis, better formatting
        <Card style={{ width: "100%", marginTop: '16px', marginRight: "16px" }}>
            <div style={{ display: "flex" }}>
                <h1>{index}</h1>
                <div style={{ marginLeft: "10px" }}>
                    <div>
                        {title}
                    </div>
                    <div>
                        {formatTime(time, "H2")} Hours
                    </div>
                    <div>
                        {episodes} Episodes
                    </div>
                </div>
                <Image
                    unoptimized
                    src={"https://image.tmdb.org/t/p/original/" + poster_path}
                    alt={title}
                    width={50}
                    height={75}
                    style={{ objectFit: "cover" }}
                />
            </div>
        </Card>
    );
};

export default ShowCard;
