import React, { useState } from 'react';
import styled from "styled-components";
import { BORDERRADIUS, PADDING, MARGIN, BOXSHADOW } from "@/utils/constants"
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

const Box = styled.div`
    display: flex;
    flex-direction:column;
    // justify-content: space-between;
    align-items: center;
    background:#fff;
    padding:${PADDING};
    border-radius:${BORDERRADIUS};
    box-shadow: 0 20px 27px rgba(0,0,0,.05);
    user-select:none;
    width:50%;
`;

const Title = styled.div`
    font-weight: 600;
    font-size: 16px;
    margin-bottom:10px;
`;

const SmallWidget = ({ title, content }) => {

    return (
        <Box>
            <Title>{title}</Title>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
                // border: "1px solid red"
            }}>
                {content}
            </div>
        </Box>
    );
};

export default SmallWidget;
