"use client";
import Image from "next/image";
import { useState, useEffect, useRef, cloneElement } from "react";
import { message, Input, Button, InputNumber, Space, Tooltip, Progress, Select, Divider, Popover, Dropdown } from 'antd';
import { StarTwoTone, StarOutlined, SearchOutlined, CheckOutlined, EditOutlined, QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import MovieTable from "@/components/MovieTable.js"
import { capitalizeFirstLetter, getDateWeekAgo } from "../../../utils.js"
import styled from "styled-components";
import { poster, date_added, release_date, audience_rating, type, episode, upcoming_release, genres, view } from "@/columns.js"
import { getDocs, collection, getDoc, setDoc, addDoc, deleteDoc, deleteDocs, updateDoc, doc, where, query, writeBatch } from "firebase/firestore"
import useAuth from "@/hooks/useAuth.js";
import { useRouter } from 'next/navigation'

// firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/config/firebase.js"

const UpcomingPage = () => {
    const fetch = require("node-fetch");
    const [userMedia, setUserMedia] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [disableButtons, setDisableButtons] = useState(true);
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

    // NEEDS REWORK
    const refreshUpdate = () => {
        // if the current release date is less than todays, check for next episode
        // instead of todays date, it needs to be last checked date.
        let tv = upcoming.filter((o) => o.media_type === "tv" && new Date(o.upcoming_release) < new Date())
        tv.forEach((item) => {
            let details = []
            async function getDetails() {
                const response = await fetch("https://api.themoviedb.org/3/tv/" + item.key + "?language=en-US", options);
                details = await response.json();
                // if there is an upcoming episode, update the show. else ignore.
                if (details.next_episode_to_air !== null) {
                    onUpdate(item, details.next_episode_to_air.air_date)
                }
            }
            getDetails()
        })
        if (tv.length === 0) {
            console.log("no updates made")
        }
        onMessage("Refreshed List", "success")
    }

    const getUserMedia = async (uid) => {
        try {
            const userDocRef = doc(db, 'Users', uid);
            const mediaListCollectionRef = collection(userDocRef, 'MediaList');
            const mediaListSnapshot = await getDocs(mediaListCollectionRef);
            const userData = mediaListSnapshot.docs.map((doc) => ({ ...doc.data(), key: doc.id }));

            const combinedData = await processFilteredData(userData);
            setUserMedia(combinedData);
            setLoading(false)
        } catch (err) {
            onMessage(`${err.name + ": " + err.code}`, "error");
        }
    };

    async function processFilteredData(userData) {
        const fetchPromises = userData.map(async (i) => {
            const documentRef = doc(db, 'Media', i.media_uid);
            try {
                const documentSnapshot = await getDoc(documentRef);
                if (documentSnapshot.exists()) {
                    const mediaData = documentSnapshot.data();
                    return { ...mediaData, ...i };
                } else {
                    console.log('Document not found.');
                    return null;
                }
            } catch (err) {
                console.error('Error fetching document:', err);
                return null;
            }
        });

        const combinedData = await Promise.all(fetchPromises);
        return combinedData.filter((data) => data !== null);
    }

    const upcomingColumns = [
        upcoming_release,
        poster,
        title,
        episode,
        type,
        genres,
    ];

    useEffect(() => {
        // monitors login status
        onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u)
                getUserMedia(u.uid);
            } else {
                // send user to login if not logged in
                router.push('/auth')
            }
        })
    }, []);

    // const refreshUpdate = () => {
    //     // if the current release date is less than todays, check for next episode
    //     // instead of todays date, it needs to be last checked date.
    //     let tv = upcoming.filter((o) => o.media_type === "tv" && new Date(o.upcoming_release) < new Date())
    //     tv.forEach((item) => {
    //         let details = []
    //         async function getDetails() {
    //             const response = await fetch("https://api.themoviedb.org/3/tv/" + item.key + "?language=en-US", options);
    //             details = await response.json();
    //             // if there is an upcoming episode, update the show. else ignore.
    //             if (details.next_episode_to_air !== null) {
    //                 onUpdate(item, details.next_episode_to_air.air_date)
    //             }
    //         }
    //         getDetails()
    //     })
    //     if (tv.length === 0) {
    //         console.log("no updates made")
    //     }
    //     onMessage("Refreshed List", "success")
    // }

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
                onRefresh={() => { refreshUpdate() }}
                pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
                header={
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div>Your Upcoming Shows</div>
                        <Popover trigger="click" content={"Generated from items you have added to your Seen & Watchlists. Displays items which are coming out soon."} >
                            <QuestionCircleOutlined style={{ fontSize: "13px", color: "grey", margin: "6px 0px 0px 10px" }} />
                        </Popover>
                    </div>
                }
                disableButtons={disableButtons}
                columns={upcomingColumns}
                data={userMedia.filter(item => new Date(item.upcoming_release) > getDateWeekAgo())}
                rowSelection={false}
            />
        </div>
    };
}

export default UpcomingPage;