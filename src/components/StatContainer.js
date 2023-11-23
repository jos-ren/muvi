import React from 'react';
import Image from "next/image";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fafafa;
  padding:30px;
  border:1px solid black;
  border-radius:8px;
`;
const StatContainer = ({title}) => {
    return (
        <Container>
            {title}
        </Container>
    );
};

export default StatContainer;
