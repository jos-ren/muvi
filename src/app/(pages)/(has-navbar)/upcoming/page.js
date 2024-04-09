"use client";
import { useState, useEffect, useRef } from "react";
import { message, Input, Button, Space, Popover, Dropdown, Tooltip } from 'antd';
import { SearchOutlined, QuestionCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import MovieTable from "@/components/MovieTable.js"
import { getDateWeekAgo } from "../../../../utils/utils.js"
import { poster, type, episode, upcoming_release, genres, status, episode_difference, latest_episode_date } from "@/columns.js"
import { getUserMedia, refreshUpdate } from "@/api/api.js"
import { useGlobalContext } from '@/context/store.js';
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoMdEyeOff } from "react-icons/io";
import { hideUpcomingItem, getBacklogData, deleteUserMedia } from "@/api/api.js"
import styled from "styled-components";
import { TbExternalLink } from "react-icons/tb";

const UpcomingPage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [backlogData, setBacklogData] = useState([]);
    const searchInput = useRef(null);
    const [loading, setLoading] = useState(true);
    const { user, data, setData } = useGlobalContext();
    const [showCurrentlyAiring, setShowCurrentlyAiring] = useState(true);

    const filteredBacklogData = showCurrentlyAiring
        ? backlogData.filter(item => item.is_currently_airing)
        : backlogData;

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                    position: "relative",
                    // top:"-10px"
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search Title...`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 95,
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        onClick={() => { clearFilters && handleReset(clearFilters), handleSearch(selectedKeys, confirm, dataIndex) }}
                        size="small"
                        style={{
                            width: 95,
                        }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1890ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const title = {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        ...getColumnSearchProps('title'),
    }

    // THIS SHOULD ALWAYS BE THE SAME AS THE ONES IN UPCOMING, SEEN, WATCHLIST
    const actions = {
        title: '',
        render: (data) => {
            const items = [
                {
                    key: '1',
                    label: (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "start" }}
                            onClick={async () => {
                                await hideUpcomingItem(user.uid, data.key, true);
                                const result = await getUserMedia(user.uid);
                                setData(result);
                                onMessage('Hid ' + data.title, 'success');
                            }}>
                            <IoMdEyeOff />
                            <div>
                                Hide
                            </div>
                        </div>
                    ),
                },
                {
                    type: 'divider',
                },
                {
                    key: '2',
                    label: (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "start" }}
                            onClick={async () => {
                                await deleteUserMedia([data.key], user);
                                const result = await getUserMedia(user.uid);
                                setData(result);
                                onMessage("Deleted " + data.title, "success");
                            }}>
                            <DeleteOutlined />
                            <div>
                                {/* Remove from {data.list_type === "seen" ? "Seen" : "Watchlist"} */}
                                Remove
                            </div>
                        </div>
                    ),
                },
                {
                    type: 'divider',
                },
                {
                    key: '3',
                    label: (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "start" }}
                            onClick={() => { window.open(data.media_type === "movie" ? "https://www.imdb.com/title/" + data.details.imdb_id : "https://www.themoviedb.org/tv/" + data.details.id, '_blank') }}>
                            <TbExternalLink />
                            <div>
                                More Details
                            </div>
                        </div>
                    ),
                },
            ];

            return <div style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}            >
                <Dropdown
                    menu={{
                        items,
                    }}
                    placement="bottomLeft"
                >
                    <HiOutlineDotsHorizontal size={16} />
                </Dropdown>
            </div>
        }
    }

    const onMessage = (content, type) => {
        // Generate a unique key for each message to force removal of the previous message
        const key = `${type}-${Date.now()}`;
        return messageApi[type]({
            content,
            key,
            className: 'message',
        });
    };

    const handleRefreshClick = async () => {
        // Show loading message
        onMessage('Refreshing', 'loading');

        const currentMedia = await getUserMedia(user.uid);
        const { message, type } = await refreshUpdate(currentMedia, user.uid);

        // If the message is not "List is up to date", update the data and show the message
        if (message !== 'List is up to date') {
            const updatedMedia = await getUserMedia(user.uid);
            setData(updatedMedia);
            messageApi.destroy();
            onMessage(message, type);
        } else {
            // If the message is "List is up to date", hide the loading message
            messageApi.destroy();
            onMessage(message, type);
        }
    };

    useEffect(() => {
        if (user !== null) {
            if (data.length > 0) {
                const res = getBacklogData(data);
                setBacklogData(res);
                setLoading(false);
            }

            // If there is no data, set loading to false after 2 seconds
            if (data.length === 0) {
                setTimeout(() => {
                    setLoading(false);
                }, 2000);
            }
        }
    }, [user, data]);


    const upcomingColumns = [
        upcoming_release,
        poster,
        title,
        episode,
        type,
        genres,
        status,
        actions
    ];

    // in the new table
    // add these columns:  my current episode,
    const backlogColumns = [
        latest_episode_date,
        poster,
        title,
        episode_difference,
        actions
    ];

    if (loading) {
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
            <h1>Loading...</h1>
        </div>
    } else {
        return <div>
            {contextHolder}
            {/* sort by this for movie (new Date(o.release_date) > new Date()) 
                for tv: details.next_episode_to_air !== null  */}
            <MovieTable
                showRefresh
                onRefresh={handleRefreshClick}
                pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
                header={
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div>Your Upcoming</div>
                        <Popover trigger="hover" content={"Generated from items you have added to your Seen & Watchlists. Displays items which are coming out soon."} >
                            <QuestionCircleOutlined style={{ fontSize: "13px", color: "grey", margin: "6px 0px 0px 10px" }} />
                        </Popover>
                    </div>
                }
                columns={upcomingColumns}
                // filters data to be at the most a week old and not hidden
                data={data.filter(item => new Date(item.upcoming_release) > getDateWeekAgo() && item.is_hidden !== true)}
                rowSelection={false}
            />
            <MovieTable
                pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
                header={
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div>Episode Backlog</div>
                    </div>
                }
                columns={backlogColumns}
                data={filteredBacklogData}
                showCurrentlyAiring={true}
                checkboxOnChange={(e) => setShowCurrentlyAiring(e.target.checked)}
                hasTopMargin={false}
            />
        </div>
    };
}

export default UpcomingPage;