import React from 'react';
import styled from "styled-components";
import { PiPulseBold } from "react-icons/pi";
import { BORDERRADIUS, PADDING, MARGIN, BOXSHADOW, COLORS } from "@/utils/constants"

const Box = styled.div`
    display: flex;
    // flex-direction:column;
    justify-content: space-between;
    align-items: center;
    background: ${COLORS.BLUE};
    color: ${COLORS.WHITE};
    padding:${PADDING};
    // // margin: ${MARGIN} 0px;
    border-radius:${BORDERRADIUS};
    // box-shadow: ${BOXSHADOW};
    // width:100%;
    box-shadow: 0 20px 27px rgba(0,0,0,.05);
    width: 100%;
`;

const AddMoreMovies = ({ heading, text }) => {
    return (
        <Box>
            <div style={{ padding: '4px', display: "flex", gap: "12px", justifyContent: "center", alignItems: "center", width: '100%' }}>
                <div style={{ width: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <PiPulseBold />
                </div>
                <div>Looks like this space could use some life! Why not kickstart things by adding some more movies or shows to &quot;Seen&quot;?</div>
            </div>
        </Box>
    );
};

export default AddMoreMovies;
