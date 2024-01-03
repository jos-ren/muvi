import React, { useState } from 'react';
import styled from "styled-components";
import { BORDERRADIUS, PADDING, MARGIN, BOXSHADOW } from "@/utils/constants"
import { FaPlus, FaMinus } from "react-icons/fa";

const Box = styled.div`
    display: flex;
    flex-direction:column;
    justify-content: space-between;
    align-items: center;
    background:#fff;
    padding:${PADDING};
    // // margin: ${MARGIN} 0px;
    border-radius:${BORDERRADIUS};
    // box-shadow: ${BOXSHADOW};
    // width:100%;
    box-shadow: 0 20px 27px rgba(0,0,0,.05);
    // width: 100%;
    &:hover {
        cursor:pointer;
    }
`;
const ColorBox = styled.div`
    border-radius:8px;
    display: flex;
    flex-direction:column;
    justify-content: center;
    align-items: center;
    background:${({ color }) => (color)};
    // width:100%;
    padding:16px 22px;
    box-shadow: 0 4px 6px rgba(0,0,0,.12);
`;

const Title = styled.div`
    font-weight: 600;
    // color: #8c8c8c;
    font-size: 16px;
    margin-right:10px;
`;

const Date = styled.div`
    font-weight: 600;
    color: #8c8c8c;
    font-size: 12px;
`;

const Statistic = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 700;
    margin-top: 5px;
    color: inherit;
    font-size: 30px;
    // line-height: 30px;
    width:250px;
`;


const Widget = ({ title, statistic, icon, color = '#2389ff', date, content }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    return (
        <Box onClick={() => { setIsClicked(!isClicked) }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ display: "flex", width: "100%", justifyContent:"space-between" }}>
                <div style={{ display: "flex" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Title>{title}</Title>
                            <Date>{date}</Date>
                        </div>
                        <Statistic>{statistic}</Statistic>
                    </div>
                </div>

                <ColorBox color={color}>
                    {isHovered ? isClicked ? <FaMinus style={{ color: 'white' }} /> : <FaPlus style={{ color: 'white' }} /> : icon}
                </ColorBox>
            </div>

            {isClicked ? <div>
                {content}
            </div> : null}
        </Box>
    );
};

export default Widget;
