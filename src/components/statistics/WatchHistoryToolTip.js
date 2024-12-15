import React, { useEffect } from 'react';
import Image from 'next/image';
import { TMDB_POSTER_URL } from '@/utils/constants';

const WatchHistoryToolTip = ({ data }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", flexDirection: "column", gap: "8px" }}>
            {data.details && <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${Math.min(data.details?.length || 0, 5)}, 1fr)`, // Dynamically set columns based on item count
                    gap: "4px",
                    justifyContent: "center",
                }}
            >
                {data.details.map((details, index) => (
                    <div
                        style={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        key={index}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: "16pt",
                                fontWeight: "600",
                                color: "white",
                                textShadow: "0 0 5px black",
                                zIndex: "200",
                            }}
                        >
                            {details.count}
                        </div>
                        <Image
                            src={
                                details.thumbnail
                                    ? `${TMDB_POSTER_URL + details.thumbnail}`
                                    : "poster_not_found.png"
                            }
                            alt="thumbnail poster"
                            height={66}
                            width={44}
                            style={{
                                objectFit: "cover",
                                borderRadius: "4px",
                            }}
                            unoptimized
                        />
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor: "rgba(0, 0, 0, 0.15)",
                                borderRadius: "4px",
                            }}
                        ></div>
                    </div>
                ))}
            </div>}
            Total Watch Count: {data.count ? data.count : 0}
        </div>
    );
};

export default WatchHistoryToolTip;