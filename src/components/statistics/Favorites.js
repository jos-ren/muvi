import { React, useState, useEffect } from 'react';
import styled from "styled-components";
import Box from "@/components/statistics/Box"
import { RightOutlined, LeftOutlined, DownOutlined, CheckOutlined, HourglassOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space, Tooltip, Skeleton } from 'antd';
import Image from "next/image"
import { IoMdEye } from 'react-icons/io';
import { formatTime } from "@/utils/utils";
import { COLORS } from "@/utils/constants";

const Title = styled.div`
    font-weight: 600;
    font-size: 16px;
    margin-bottom:10px;
`;


const Favorites = ({ title, data }) => {
    const [loading, setLoading] = useState(true);
    const [selectedName, setSelectedName] = useState('Genres');
    const [selectedData, setSelectedData] = useState(data.genres);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleItems, setVisibleItems] = useState(getVisibleItems());

    function getVisibleItems() {
        const breakpoints = [
            { max: 370, value: 2 },
            { max: 445, value: 3 },
            { max: 520, value: 4 },
            { max: 580, value: 5 },
            { max: 670, value: 6 },
            { max: 760, value: 7 },
            { max: 850, value: 8 },
            { max: 980, value: 9 },
        ];

        const width = window.innerWidth;
        const breakpoint = breakpoints.find(b => width <= b.max);

        return breakpoint ? breakpoint.value : 10;
    }

    useEffect(() => {
        const handleResize = () => {
            setVisibleItems(getVisibleItems());
        };

        window.addEventListener('resize', handleResize);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (data.genres.length !== 0) {
            setSelectedData(data.genres);
            setLoading(false);
        }
    }, [data]);

    const handleNext = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % selectedData.length);
    };

    const handlePrevious = () => {
        setCurrentIndex(prevIndex => (prevIndex - 1 + selectedData.length) % selectedData.length);
    };

    const handleMenuClick = (e) => {
        const clickedItem = items.find(item => item.key === e.key);
        if (clickedItem) {
            setSelectedName(clickedItem.label);
            setSelectedData(clickedItem.category === "principal_members" ? data[clickedItem.category][clickedItem.key] : data[clickedItem.category]);

            //handle non existant data
            if ((clickedItem.category === "principal_members" ? data[clickedItem.category][clickedItem.key] : data[clickedItem.category]).length === 0) {
                setLoading(true);
            } else {
                setLoading(false);
            }
        }
    };

    const items = [
        {
            label: 'Genres',
            key: 'genres',
            category: 'genres'
        },
        {
            label: 'TV Shows',
            key: 'shows',
            category: 'longest_tv'
        },
        // {
        //     label: 'Movies',
        //     key: 'shows',
        //     category: 'longest_tv'
        // },
        //people
        {
            label: 'Actors',
            key: 'actors',
            category: 'principal_members'
        },
        {
            label: 'Directors',
            key: 'directors',
            category: 'principal_members'
        },
        {
            label: 'Cinematographers',
            key: 'dop',
            category: 'principal_members'
        },
        {
            label: 'Composers',
            key: 'sound',
            category: 'principal_members'
        },
        {
            label: 'Producers',
            key: 'producers',
            category: 'principal_members'
        },
        {
            label: 'Editors',
            key: 'editor',
            category: 'principal_members'
        },
    ];

    const menuProps = {
        items,
        onClick: handleMenuClick,
        selectable: true,
        defaultSelectedKeys: ['genres'],
    };

    return (
        <Box>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <Title style={{ margin: "0px" }}>{title}</Title>
                    {/* //dropdown */}
                    <Dropdown menu={menuProps}>
                        <Button size='small'>
                            <Space>
                                <div>{selectedName}</div>
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>
                </div>
                {/* carousel */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "space-between", width: "100%" }}>
                    <Button shape="circle" icon={<LeftOutlined />} onClick={handlePrevious} disabled={currentIndex === 0} />
                    {loading ? <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", flex: '1' }}>
                        {Array.from({ length: visibleItems }).map((_, index) => (
                            <div key={index} style={{ display: "flex", flexDirection: "column", gap: "4px", width: "72px" }}>
                                <Skeleton.Image style={{ width: "100%" }} />
                                <Skeleton.Input style={{ width: "100%", minWidth: "20px" }} size='small' />
                            </div>
                        ))}
                    </div>
                        : <div style={{ display: "flex", justifyContent: "space-between", gap: "6px" }}>
                            {selectedData.slice(currentIndex, currentIndex + visibleItems).map((data, index) => (
                                selectedName === 'Genres' ?
                                    <div key={index} style={{ width: "72px" }}>
                                        <div style={{ background: "#fafafa", width: "67px", height: "67px", borderRadius: "50%" }}>
                                            <div style={{ fontSize: "30px", textAlign: "center", lineHeight: "67px" }}>{data.emoji}</div>
                                        </div>
                                        <Tooltip title={data.name} >
                                            <div style={{ fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{data.name}</div>
                                        </Tooltip>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <IoMdEye />
                                            {data.count}
                                            {/* <div style={{ fontSize: "12px", marginLeft: "2px" }}>films</div> */}
                                        </div>

                                    </div> :
                                    selectedName === 'TV Shows' ?
                                        <div key={index} style={{ width: "72px" }}>
                                            <Image
                                                src={data.image ? `https://image.tmdb.org/t/p/original${data.image}` : 'default_avatar.jpg'}
                                                alt="temp"
                                                height={100}
                                                width={67}
                                                style={{ objectFit: "cover", borderRadius: "4px" }}
                                                unoptimized
                                            />
                                            <Tooltip title={data.title} >
                                                <div style={{ fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{data.title}</div>
                                            </Tooltip>
                                            <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                                                <div style={{ display: "flex", alignItems: "center", left: "-2px", position: "relative", width: "100%" }}>
                                                    <HourglassOutlined />
                                                    {formatTime(data.time, "H2")}
                                                    <div style={{ fontSize: "12px", marginLeft: "2px" }}>hrs</div>
                                                </div>
                                                {/* <div style={{ fontSize: "12px", display: "flex", width: "100%" }}>{data.total_watched_eps}  eps</div> */}
                                            </div>
                                        </div> :
                                        //principal members
                                        <div key={index} style={{ width: "72px" }}>
                                            <Image
                                                src={data.profile_path ? `https://image.tmdb.org/t/p/original/${data.profile_path}` : 'default_avatar.jpg'}
                                                alt="temp"
                                                height={100}
                                                width={67}
                                                style={{ objectFit: "cover", borderRadius: "4px" }}
                                                unoptimized
                                            />
                                            <Tooltip title={data.name} >
                                                <div style={{ fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{data.name}</div>
                                            </Tooltip>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <IoMdEye />
                                                {data.count}
                                                {/* <div style={{ fontSize: "12px", marginLeft: "2px" }}>films</div> */}
                                            </div>
                                        </div>
                            ))}
                        </div>}
                    <Button shape="circle" icon={<RightOutlined />} onClick={handleNext} disabled={currentIndex >= selectedData.length - visibleItems} />
                </div>
            </div>
        </Box>
    );
};

export default Favorites;
