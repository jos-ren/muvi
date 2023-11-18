"use client";
import { useState, useEffect, useRef } from "react";
import { message, Input, Button, Space, Popover } from 'antd';
import { SearchOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import MovieTable from "@/components/MovieTable.js"
import { getDateWeekAgo } from "../../../../api/utils.js"
import { poster, type, episode, upcoming_release, genres, status } from "@/columns.js"
import { getDocs, collection, getDoc, doc } from "firebase/firestore"
import { useRouter } from 'next/navigation'
import { getUserMedia, updateUser, refreshUpdate } from "@/api/api.js"

// firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/config/firebase.js"

const UpcomingPage = () => {
    const fetch = require("node-fetch");
    const [userMedia, setUserMedia] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(false);
    const router = useRouter()

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

    const onMessage = (message, type) => {
        messageApi.open({
            type: type,
            content: message,
            className: "message"
        });
    };

    const fetchUserData = async (uid) => {
        const result = await getUserMedia(uid);
        setUserMedia(result);
        setLoading(false);
    }

    useEffect(() => {
        // monitors login status
        onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u)
                fetchUserData(u.uid);
            } else {
                // send user to login if not logged in
                router.push('/auth')
            }
        })
    }, []);

    const upcomingColumns = [
        upcoming_release,
        poster,
        title,
        episode,
        type,
        genres,
        status
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
                onRefresh={() => { 
                    refreshUpdate(userMedia);
                    fetchUserData(user.uid)
                    onMessage("Refreshed List", "success")
                 }}
                pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
                header={
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div>Your Upcoming Shows</div>
                        <Popover trigger="click" content={"Generated from items you have added to your Seen & Watchlists. Displays items which are coming out soon."} >
                            <QuestionCircleOutlined style={{ fontSize: "13px", color: "grey", margin: "6px 0px 0px 10px" }} />
                        </Popover>
                    </div>
                }
                columns={upcomingColumns}
                data={userMedia.filter(item => new Date(item.upcoming_release) > getDateWeekAgo())}
                rowSelection={false}
            />
        </div>
    };
}

export default UpcomingPage;