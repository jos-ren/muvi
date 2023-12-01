import React from 'react';
import styled from "styled-components";
import Box from "@/components/statistics/Box"

const Heading = styled.h1`
    margin:0px;
`;

const Text = styled.div`
    margin:0px;
`;

const SmallStat = ({ heading, text }) => {
    return (
        <Box>
            <Text>{text}</Text>
            <Heading>{heading}</Heading>
        </Box>
    );
};

export default SmallStat;
