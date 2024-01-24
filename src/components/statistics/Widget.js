import React, { useState } from 'react';
import styled from "styled-components";
import { BORDERRADIUS, PADDING, MARGIN, BOXSHADOW } from "@/utils/constants"
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

const Box = styled.div`
    display: flex;
    flex-direction:column;
    justify-content: space-between;
    align-items: center;
    background:#fff;
    padding:${PADDING};
    border-radius:${BORDERRADIUS};
    box-shadow: 0 20px 27px rgba(0,0,0,.05);
    user-select:none;
`;
const ColorBox = styled.div`
    border-radius:8px;
    display: flex;
    flex-direction:column;
    justify-content: center;
    align-items: center;
    background:${({ color }) => (color)};
    padding:16px 22px;
    box-shadow: 0 4px 6px rgba(0,0,0,.12);
`;

const Title = styled.div`
    font-weight: 600;
    font-size: 16px;
    margin-right:10px;
`;

const Date = styled.div`
    font-weight: 600;
    color: #8c8c8c;
    font-size: 12px;
`;

const Label = styled.div`
    display:flex;
    width:100%;
    justify-content:space-between;
    &:hover {
        cursor:pointer;
    }
`;

const Statistic = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 700;
    margin-top: 5px;
    color: inherit;
    font-size: 30px;
    width:250px;
`;


const Widget = ({ title, statistic, icon, color = '#2389ff', date, content }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(true);

    return (
        <Box>
            <Label
                onClick={() => { setIsClicked(!isClicked) }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div style={{ display: "flex" }}>
                    <div>
                        <Title>{title}</Title>
                        <Statistic>{statistic}</Statistic>
                    </div>
                </div>

                <ColorBox color={color}>
                    {isHovered ? isClicked ? <FaAngleUp style={{ color: 'white' }} /> : <FaAngleDown style={{ color: 'white' }} /> : icon}
                </ColorBox>
            </Label>

            {isClicked ? <div>
                {content}
            </div> : null}
        </Box>
    );
};

export default Widget;
