import React, { useState } from 'react';
import styled from 'styled-components';
import { Collapse, List as AntList, Button } from 'antd';
import Image from "next/image";

const List = ({ items }) => {
    return (
        <div
            style={{ height: '100%', overflowY: 'auto' }}
        >
            <Collapse
                size="small"
                accordion
                expandIconPosition='end'
                items={items.map((item, index) => ({
                    key: index,
                    label: (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span>
                                <strong>#{index + 1} </strong> {item.name}
                            </span>
                            {/* <Image
                                src={item.profile_path ? `https://image.tmdb.org/t/p/original/${item.profile_path}` : 'default_avatar.jpg'}
                                alt="temp"
                                height={20}
                                width={20}
                                style={{ objectFit: "cover" }}
                                unoptimized
                            /> */}
                        </div>
                    ),
                    children: <AntList
                        size="small"
                        dataSource={item.media}
                        renderItem={(i2) => (
                            <AntList.Item>
                                {/* <Image
                                    src={i2.poster_path ? `https://image.tmdb.org/t/p/original/${i2.poster_path}` : 'default_avatar.jpg'}
                                    alt={i2.title}
                                    height={60}
                                    width={40}
                                    style={{ objectFit: "cover" }}
                                    unoptimized
                                /> */}
                                <div>{i2.title}</div>
                                <Button type="link" target="_blank" href={i2.media_type === "movie" ? "https://www.imdb.com/title/" + i2.link : "https://www.themoviedb.org/tv/" + i2.link}>View</Button>
                            </AntList.Item>
                        )}
                    />
                }))}
            />
        </div>

        // <ListContainer>
        //     {items.map((item, index) => (
        //         console.log(item, "item"),
        //         <div key={index}>
        //             <ListItem iseven={(index % 2 === 0).toString()} onClick={() => toggleItem(index)}>
        //                 <div>
        //                     <span>#{index + 1}</span>
        //                     <span>{item.name}</span>
        //                 </div>
        //                 {expandedItem === index ? <CaretUpFilled /> : <CaretDownFilled />}
        //             </ListItem>

        //             {expandedItem === index && (
        //                 <AdditionalContent isopen={(expandedItem === index).toString()}>
        //                     
        //                 </AdditionalContent>
        //             )}
        //         </div>
        //     ))}
        // </ListContainer>
    );
};

export default List;
