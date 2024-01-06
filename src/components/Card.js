import React, { useState } from 'react'; import Image from "next/image";
import { Button } from 'antd';
import { CheckOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { FaRegBookmark } from "react-icons/fa6";
import styled from "styled-components";

const Container = styled.div`
    display:flex;
    flex-direction:column;
    align-items:center;
    text-align:center;
`;

const Hover = styled.div`
:hover{
    cursor:pointer;
    box-shadow: 3,3,0,0.3
}
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

const Card = ({ details, addToSeen, addToWatchlist, src, alt, height = 200, width = 133, onInfoClick }) => {
    const [isIconVisible, setIconVisibility] = useState(false);

    return (
        <Container>
            <div
                style={{ position: 'relative', borderRadius: '6px', width: '100%', height: 'auto', display: 'inline-block' }}
                onMouseOver={() => setIconVisibility(true)}
                onMouseOut={() => setIconVisibility(false)}
            >
                <Hover>
                    {isIconVisible && (
                        <InfoCircleOutlined onClick={onInfoClick} style={{ fontSize: '20px', position: 'absolute', top: '-1px', right: '0', zIndex: 1, padding: '10px', color: 'white' }} />
                    )}
                </Hover>
                <Image
                    unoptimized
                    height={height}
                    width={width}
                    quality="75"
                    src={src}
                    alt={alt}
                    style={{ borderRadius: '6px', width: '100%', height: 'auto', objectFit: 'contain' }}
                />
            </div>

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
        </Container>
    );
}

export default Card;