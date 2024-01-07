import React from 'react';
import styled from "styled-components";
import { BORDERRADIUS, PADDING, BOXSHADOW, COLORS } from "@/utils/constants"

const Container = styled.h1`

`;

const Bar = styled.div`
    background: ${COLORS.BLUE};
    width: ${({ width }) => width};
    height: 20px;
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
`;

const Rating = ({ }) => {
    return (
        <Container>
            <Bar width={'100%'}/>
        </Container>
    );
};

export default Rating;
