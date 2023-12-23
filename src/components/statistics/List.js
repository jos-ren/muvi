import React, { useState } from 'react';
import styled from 'styled-components';
import { Collapse, List as AntList, Button } from 'antd';
import Image from "next/image";

const ListContainer = styled.div`
//   width: 300px;
//   margin: 20px;
`;

const ListItem = styled.div`
    background-color: ${({ iseven }) => (iseven === 'true' ? '#fff' : '#f0f0f0')};
    padding: 10px;
    border: 1px solid #ccc;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

const AdditionalContent = styled.div`
  max-height: ${({ isopen }) => (isopen === 'true' ? 'auto' : '0')};
  overflow: hidden;
  padding: 10px;
  border-top: 1px solid #ccc;
  visibility: ${({ isopen }) => (isopen === 'true' ? 'visible' : 'hidden')};
  transition: max-height 0.3s ease-in-out, visibility 0.3s ease-in-out; /* Smooth transition animation */
`;


const List = ({ items }) => {
    // const [expandedItem, setExpandedItem] = useState(null);

    return (
        <div 
        style={{ height: '300px', overflowY: 'auto' }}
        >
            <Collapse
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
