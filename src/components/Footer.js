import React from 'react';
import Image from "next/image";
import styled from "styled-components";

const Container = styled.div`
  margin-top: 60px;
  display: flex;
  height: 60px;
  justify-content: center;
  align-items: center;
  position: relative;
  background: #fafafa;
  font-size: 10pt;
  width:100%;
  position: relative;
  bottom: 0px;
`;
const Footer = () => {
    return (
        <Container>
            <>JOSREN ©2023 | Created using data from</>
            <Image unoptimized height="20" width="66" quality="75" src={"tmdb.svg"} alt={"tmdb"} style={{ marginLeft: "7px" }} />
        </Container>
    );
};

export default Footer;
