import React from 'react';
import styled from "styled-components";
import { BORDERRADIUS, PADDING, BOXSHADOW } from "@/utils/constants"
import Image from "next/image"
import { Tooltip } from 'antd';

const Container = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: ${PADDING};
    border-radius: ${BORDERRADIUS};
    box-shadow: 0 20px 27px rgba(0,0,0,.05);
`;

const Bar = styled.div`
    background: #2389ff;
    height: ${({ height }) => height};
    width: 20px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
`;

const VerticalText = styled.div`
    transform: rotate(-90deg);
    transform-origin: left bottom; /* Optional: set the rotation origin */
    white-space: nowrap;
`;

const Chart = ({ data }) => {
    // Constants for min and max heights
    const minHeight = 10;
    const maxHeight = 100;

    // Function to scale the height based on the data
    function scaleHeight(value) {
        // Calculate the percentage based on the range of values
        const percentage = (value - Math.min(...data.map(item => item.count))) / (Math.max(...data.map(item => item.count)) - Math.min(...data.map(item => item.count)));
        // Scale the height based on the percentage within the range
        const scaledHeight = minHeight + percentage * (maxHeight - minHeight);
        return `${scaledHeight}px`;
    }

    return (
        <Container>
            {/* <VerticalText>Count</VerticalText> */}
            <div style={{ width: '100%'}}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", width: '100%' }}>
                    {data.map((i, index) => (
                        <div key={index}>
                            <Tooltip title={i.name}>
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                    <div>{i.count}</div>
                                    <Bar height={scaleHeight(i.count)} />
                                    <Image
                                        src={i.profile_path ? `https://image.tmdb.org/t/p/original/${i.profile_path}` : 'default_avatar.jpg'}
                                        alt="temp"
                                        height={20}
                                        width={20}
                                        style={{ objectFit: "cover" }}
                                        unoptimized
                                    />
                                    <div>{index + 1}</div>
                                </div>
                            </Tooltip>
                        </div>
                    ))}
                </div>
                {/* <div>Ranking</div> */}
            </div>
        </Container>
    );
};

export default Chart;
