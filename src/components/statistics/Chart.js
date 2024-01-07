import React from 'react';
import styled from "styled-components";
import { BORDERRADIUS, PADDING, BOXSHADOW, COLORS } from "@/utils/constants"
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
    background: ${COLORS.BLUE};
    width: ${({ width }) => width};
    height: 20px;
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
`;

// const VerticalText = styled.div`
//     transform: rotate(-90deg);
//     transform-origin: left bottom; /* Optional: set the rotation origin */
//     white-space: nowrap;
// `;

const Chart = ({ data }) => {
    const highestCount = Math.max(...data.map(actor => actor.count));

    function scaleLength(count) {
        // Assuming data is available in the scope or passed as an argument
        return `${(count / highestCount) * 200}px`;
      }

    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start" }}>
            <div>Rankings</div>
            {data.map((i, index) => (
                <div key={index}>
                    <Tooltip title={i.name}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <div style={{ width: "20px", textAlign: "start" }}>{index + 1}</div>
                            <Image
                                src={i.profile_path ? `https://image.tmdb.org/t/p/original/${i.profile_path}` : 'default_avatar.jpg'}
                                alt="temp"
                                height={20}
                                width={20}
                                style={{ objectFit: "cover" }}
                                unoptimized
                            />
                            <Bar width={scaleLength(i.count)} />
                            <div style={{ marginLeft: "3px" }}>{i.count}</div>
                        </div>
                    </Tooltip>
                    <div style={{ height: "5px" }}></div>
                </div>
            ))}
        </div>
    );
};

export default Chart;
