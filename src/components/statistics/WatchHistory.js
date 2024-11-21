import React, { useState, useEffect } from 'react';
import HeatMap from '@uiw/react-heat-map';
import styled from 'styled-components';
import { Button, Spin, Dropdown, Space, Tooltip, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { getWatchHistoryEarliestYear } from '@/api/api.js';

const Title = styled.div`
    font-weight: 600;
    font-size: 16px;
    margin-bottom:10px;
`;

const Box = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background:#fff;
    padding: 16px;
    border-radius: 10px;
    box-shadow: 0 20px 27px rgba(0,0,0,.05);
    width: 100%;
    overflow-x: auto;
    overflow: visible;
`;

const WatchHistory = ({ data, userId }) => {
    const [year, setYear] = useState('2024');
    const [startDate, setStartDate] = useState(new Date('2024/01/01'));
    const [dropdownYears, setDropdownYears] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getWatchHistoryEarliestYear(userId).then(response => {
            const minYear = response;
            const maxYear = new Date().getFullYear();

            const dropdownYears = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
                const year = maxYear - i;
                return {
                    label: year.toString(),
                    key: year.toString()
                };
            });

            setDropdownYears(dropdownYears);
            const currentYear = new Date().getFullYear();
            setYear(currentYear.toString());
            setStartDate(new Date(`${currentYear}/01/01`));
        })
    }, []);

    useEffect(() => {
        if (data.length !== 0) {
            setLoading(false);
        }
    }, [data]);

    const placeholderData = [
        { date: '2024/01/01', value: 0 },
    ];

    //rectangle radius
    const range = 3;

    const handleMenuClick = (e) => {
        const clickedItem = dropdownYears.find(item => item.key === e.key);
        if (clickedItem) {
            setYear(clickedItem.label);
            setStartDate(new Date(`${clickedItem.label}/01/01`));
        }
    };

    const menu = (
        <Menu onClick={handleMenuClick} selectable defaultSelectedKeys={['2024']}>
            {dropdownYears.map(item => (
                <Menu.Item key={item.key}>{item.label}</Menu.Item>
            ))}
        </Menu>
    );

    return (
        <Box>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
                {loading ? <div style={{ height: "226px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Spin size="large" />
                </div> :
                    <>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Title style={{ margin: "0px" }}>Watch History</Title>
                            <Dropdown overlay={menu}>
                                <Button size='small'>
                                    <Space>
                                        <div>{year}</div>
                                        <DownOutlined />
                                    </Space>
                                </Button>
                            </Dropdown>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: 'center' }}>
                            <HeatMap
                                value={data.length !== 0 ? data : placeholderData}
                                width="800px"
                                style={{ '--rhm-rect': '#ebedf0' }}
                                panelColors={['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']}
                                startDate={startDate}
                                legendRender={(props) => <rect {...props} y={props.y + 10} rx={range} />}
                                rectProps={{ rx: range }}
                                rectSize={12}
                                rectRender={(props, data) => {
                                    return (
                                        <Tooltip title={`Content Watched: ${data.count || 0}`}>
                                            <rect {...props} />
                                        </Tooltip>
                                    );
                                }}
                            />
                        </div>
                    </>
                }
            </div>
        </Box>
    );
};

export default WatchHistory;