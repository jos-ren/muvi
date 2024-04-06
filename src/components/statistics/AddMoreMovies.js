import React from 'react';
import styled from "styled-components";
import Box from "@/components/statistics/Box"
import { PiPulseBold } from "react-icons/pi";

const Text = styled.div`
    margin:0px;
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
