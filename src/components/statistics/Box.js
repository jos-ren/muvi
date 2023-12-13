import React from 'react';
import styled from "styled-components";
import { BORDERRADIUS, PADDING, MARGIN, BOXSHADOW } from "@/utils/constants"

const Container = styled.div`
    display: flex;
    flex-direction:column;
    justify-content: center;
    align-items: center;
    background:#fff;
    padding:${PADDING};
    // margin: ${MARGIN} 0px;
    border-radius:${BORDERRADIUS};
    box-shadow: ${BOXSHADOW};
    width:100%;
`;

const Box = ({children}) => {
    return (
        <Container>
            {children}
        </Container>
    );
};

export default Box;
