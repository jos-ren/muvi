import React from 'react';
import styled from "styled-components";
import Image from "next/image";
import { Button } from 'antd';

const Card = ({ addToSeen, addToWatchlist, title, src, alt }) => {
    return (
            <div
                style={{ border: "1px solid red", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <Image height="200" width="125" quality="75" src={src} alt={alt} />
                <div>{title}</div>
                <div>
                    <Button type="default" onClick={addToSeen}>Add to Seen</Button>
                    <Button type="default" onClick={addToWatchlist}>Add to Watchlist</Button>
                </div>
            </div>
    );
}

export default Card;