import React from 'react';
import styled from "styled-components";
import { BORDERRADIUS, PADDING, MARGIN, BOXSHADOW } from "@/utils/constants"

const Container = styled.div`
    // width: 100%;
    // max-width: 100%; 
    font-size: 6.5vh; 
    font-weight: 600;
    // white-space: normal; 
    // word-wrap: break-word;
`;

const BigNums = ({content}) => {
    return (
        <Container>
            {content}
        </Container>
    );
};

export default BigNums;