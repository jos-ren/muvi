import React from 'react';
import Image from "next/image";
import styled from "styled-components";
import { Card, Avatar, List, Statistic } from 'antd';
import { formatTime } from "@/utils/utils";
import { BORDERRADIUS } from "@/utils/constants"
import Box from "@/components/statistics/Box"

const Container = styled.div`
  display: flex;
  flex-direction:column;
  justify-content: center;
  align-items: center;
  width:100%;
  background:#ffffff;
  border-radius:${BORDERRADIUS};
`;

const Top = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom:1px solid #000;
`;

const TopTen = ({ data }) => {
    if (data.length > 3) {
        return (
            <Box>
                <div style={{ display: "flex", width: "100%" }}>
                    <Top>
                        <h1 style={{ marginRight: "20px" }}>#1</h1>
                        <div>
                            <div style={{ display: "flex", fontSize: "14pt" }}>
                                <div>{data[0].emoji}</div>
                                <div>{data[0].name}</div>
                            </div>
                            <div>{formatTime(data[0].watchtime, "H2")} hours</div>
                        </div>
                    </Top>
                </div>
                <div style={{ display: "flex", width: "100%" }}>

                    <Top>
                        <h1 style={{ marginRight: "20px" }}>#2</h1>
                        <div>
                            <div style={{ display: "flex", fontSize: "12pt" }}>
                                <div>{data[1].emoji}</div>
                                <div>{data[1].name}</div>
                            </div>
                            <div>{formatTime(data[1].watchtime, "H2")} hours</div>
                        </div>
                    </Top>


                    <Top>
                        <h1 style={{ marginRight: "20px" }}>#3</h1>
                        <div>
                            <div style={{ display: "flex", fontSize: "12pt" }}>
                                <div>{data[2].emoji}</div>
                                <div>{data[2].name}</div>
                            </div>
                            <div>{formatTime(data[2].watchtime, "H2")} hours</div>
                        </div>
                    </Top>

                </div>
                {data.slice(3, 10).map((item, index) => <div key={index} >
                    {item.name}
                </div>)}
            </Box>
        );
    }
};

export default TopTen;
