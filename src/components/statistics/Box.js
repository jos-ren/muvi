import React from 'react';
import styled from "styled-components";
import { BORDERRADIUS, PADDING, MARGIN, BOXSHADOW } from "@/utils/constants"

const Container = styled.div`
    display: flex;
    // flex-direction:column;
    justify-content: space-between;
    align-items: center;
    background:#fff;
    padding:${PADDING};
    // // margin: ${MARGIN} 0px;
    border-radius:${BORDERRADIUS};
    // box-shadow: ${BOXSHADOW};
    // width:100%;
    box-shadow: 0 20px 27px rgba(0,0,0,.05);
    width: ${({ width }) => width};
`;

const Box = ({children, width='100%'}) => {
    return (
        <Container width={width}>
            {children}
        </Container>
    );
};

export default Box;
