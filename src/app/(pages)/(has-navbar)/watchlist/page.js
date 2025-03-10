"use client";
import { useState, useEffect, useRef } from "react";
import { message, Input, Button, Space, Dropdown } from 'antd';
import { SearchOutlined, SwapOutlined, DeleteOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import MovieTable from "@/components/MovieTable.js"
import { poster, date_added, release_date, audience_rating, type, genres, view } from "@/columns.js"
import { deleteUserMedia, moveItemList, getUserMedia } from "@/api/api.js"
import { useGlobalContext } from '@/context/store.js';
import { TbExternalLink } from "react-icons/tb";
import { HiOutlineDotsHorizontal } from "react-icons/hi";

const WatchlistPage = () => {
    const [selected, setSelected] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [disableButtons, setDisableButtons] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [loading, setLoading] = useState(true);
    const { user, data, setData } = useGlobalContext();

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

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelected(selectedRowKeys)
            selectedRows.length !== 0 ? setDisableButtons(false) : setDisableButtons(true)
        }
    };

    const onMessage = (message, type) => {
        messageApi.open({
            type: type,
            content: message,
            className: "message"
        });
    };

    useEffect(() => {
        if (user !== null) {
            setLoading(false);
        }
    }, [user]);

        // THIS SHOULD ALWAYS BE THE SAME AS THE ONES IN UPCOMING, SEEN, WATCHLIST (minus hide)
        const actions = {
            title: '',
            render: (data) => {
                const items = [
                    {
                        key: '2',
                        label: (
                            <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "start" }}
                                onClick={async () => {
                                    await moveItemList("seen", user.uid, [data.key], data);
                                    const result = await getUserMedia(user.uid);
                                    setData(result);
                                    onMessage("Moved " + data.title + " to Seen", "success");
                                }}>
                                <SwapOutlined />
                                <div>
                                    Move to Seen
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
                                onClick={async () => {
                                    await deleteUserMedia([data.key], user);
                                    const result = await getUserMedia(user.uid);
                                    setData(result);
                                    onMessage("Deleted " + data.title, "success");
                                }}>
                                <DeleteOutlined />
                                <div>
                                    Remove
                                </div>
                            </div>
                        ),
                    },
                    {
                        type: 'divider',
                    },
                    {
                        key: '4',
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
                }}>
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

    const watchlistColumns = [
        poster,
        title,
        release_date,
        date_added,
        audience_rating,
        type,
        genres,
        actions
    ];

    if (loading) {
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
            <h1>Loading...</h1>
        </div>
    } else {
        return <div>
            {contextHolder}
            <MovieTable
                pagination={{ position: ["bottomCenter"], showSizeChanger: true, }}
                header={"Watchlist | " + data.filter((item) => item.list_type === "watchlist").length + " Items"}
                // onRemove={async () => {
                //     await deleteUserMedia(selected, user);
                //     const result = await getUserMedia(user.uid);
                //     setData(result);
                //     onMessage("Deleted " + selected.length + " Items", "success");
                // }}
                // onMove={async () => {
                //     await moveItemList("seen", user.uid, selected, data);
                //     const result = await getUserMedia(user.uid);
                //     setData(result);
                //     onMessage("Moved " + selected.length + " Items to Seen", "success");
                // }}
                disableButtons={disableButtons}
                columns={watchlistColumns}
                data={data.filter((item) => item.list_type === "watchlist")}
                rowSelection={rowSelection}
                showMove={true}
                moveKeyword={"Seen"}
                showRemove={true}
            />
        </div>
    }
};

export default WatchlistPage;