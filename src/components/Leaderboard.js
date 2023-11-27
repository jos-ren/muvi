import React from 'react';
import Image from "next/image";
import styled from "styled-components";
import { Card, Avatar, List, Statistic } from 'antd';
import { formatTime } from "@/api/utils";

const Container = styled.div`
  display: flex;
  flex-direction:column;
  justify-content: center;
  align-items: center;
  width:100%;
//   border:1px solid red;
`;

const Top = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
//   border:1px solid red;
`;

const Leaderboard = ({ data }) => {
    if (data.length > 3) {
        return (
            <Container>
                <div style={{ display: "flex", width: "100%" }}>
                    <Card style={{ width: "100%", margin: '10px' }}>
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
                    </Card>
                </div>
                <div style={{ display: "flex", width: "100%" }}>
                    <Card style={{ width: "100%", margin: '10px' }}>
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
                    </Card>
                    <Card style={{ width: "100%", margin: '10px' }}>
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
                    </Card>
                </div>
                {data.slice(3, 10).map((item, index) => <div key={index} >
                    <Card className="no-padding-card">{item.name}</Card>
                </div>)}
            </Container>
        );
    }
};

export default Leaderboard;
