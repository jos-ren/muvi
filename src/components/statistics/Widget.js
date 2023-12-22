import React from 'react';
import styled from "styled-components";
import Box from './Box'

const ColorBox = styled.div`
    border-radius:8px;
    display: flex;
    flex-direction:column;
    justify-content: center;
    align-items: center;
    background:${({ color }) => (color)};
    // width:100%;
    padding:16px;
    box-shadow: 0 4px 6px rgba(0,0,0,.12);
`;

const Title = styled.div`
    font-weight: 600;
    color: #8c8c8c;
    font-size: 14px;
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


const Widget = ({ title, statistic, icon, color = '#2389ff' }) => {
    return (
        <Box>
            <div>
                <Title>{title}</Title>
                <Statistic>{statistic}</Statistic>
            </div>
            <ColorBox color={color}>
                {icon}
            </ColorBox>
        </Box>
    );
};

export default Widget;
