import React from 'react';
import styled from "styled-components";
import Image from "next/image";
import { Button } from 'antd';

const Container = styled.div`

`;

const Card = ({ addMovie, key, title, src, alt }) => {
    return (
        <Container>
            <div
                key={key}
                style={{ border: "1px solid red", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <Image height="200" width="125" quality="75" src={src} alt={alt} />
                <div>{title}</div>
                <div>
                    <Button type="default" onClick={addMovie}>Add to List</Button>
                </div>
            </div>

        </Container>
    );
}

export default Card;