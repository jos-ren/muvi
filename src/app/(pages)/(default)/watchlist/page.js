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

import { deleteUserMedia, updateUserMedia, moveItemList } from "@/functions/functions.js"

const SeenPage = () => {
    const fetch = require("node-fetch");
    const [userMedia, setUserMedia] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [trending, setTrending] = useState([]);
    const [search, setSearch] = useState([]);
    const [selected, setSelected] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [disableButtons, setDisableButtons] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [progressEditMode, setProgressEditMode] = useState();
    const [ratingEditMode, setRatingEditMode] = useState();
    const [epOptions, setEpOptions] = useState([]);
    const [seOptions, setSeOptions] = useState([]);
    const [seValue, setSeValue] = useState(null);
    const [epValue, setEpValue] = useState(null);
    const [ratingValue, setRatingValue] = useState(null);
    const [active, setActive] = useState(1);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(false);
    const mediaCollectionRef = collection(db, "Media")
    const isAuthenticated = useAuth()
    const router = useRouter()

    console.log(userMedia)
    // console.log(user.uid)
    // console.log(active, "AC")
    // console.log("MEDIA", media)
    // console.log("SEEN", seen)
    // console.log("WATCHLIST", watchlist)
    // console.log("up", upcoming)
    // console.log("---")

    // --------------------------------- Functions -----------------------------------------------------------------------------------------


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

    // adds to a Users/uid/MediaList
    const createUserMedia = async (o, list_type) => {
        // o = movie object data
        const userRef = doc(db, 'Users', user.uid);
        const subCollectionRef = collection(userRef, 'MediaList');

        // check if already in Users' subcollection
        const querySnapshot = await getDocs(query(subCollectionRef, where('tmdb_id', '==', o.id)));
        const notAdded = querySnapshot.empty
        if (notAdded) {
            try {
                const { media_uid, title } = await createMedia(o);

                let obj = {
                    media_uid: media_uid,
                    tmdb_id: o.id,
                    date_added: new Date(),
                    list_type: list_type,
                    my_season: 1,
                    my_episode: 1,
                    my_rating: 0,
                };

                await addDoc(subCollectionRef, obj);
                // after the data is added, get media again
                getUserMedia(user.uid)
                onMessage("Added " + title + " to " + capitalizeFirstLetter(list_type), "success")
            } catch (err) {
                console.error(err)
            }
        } else {
            // warning if already added to your list
            onMessage("Already Added", "warning")
        }
    }

    const createMedia = async (o) => {
        // check if already in media collection 
        const querySnapshot = await getDocs(query(mediaCollectionRef, where('key', '==', o.id)));
        let title = o.media_type === "movie" ? o.title : o.name;
        //  if movie does not exists in you Media collection yet
        if (querySnapshot.empty) {
            let release_date = o.media_type === "movie" ? o.release_date : o.first_air_date;
            // determine if anime. animation genre + japanese language = true
            let animation = false
            let g_ids = o.genre_ids
            g_ids.forEach((id) => {
                if (id === 16) {
                    animation = true
                }
            })
            let is_anime = o.original_language === "ja" && animation === true ? true : false;
            // get details
            const response = await fetch("https://api.themoviedb.org/3/" + o.media_type + "/" + o.id + "?language=en-US", options);
            let details = await response.json();
            let upcoming_release = o.media_type === "movie" ? details.release_date : (details.next_episode_to_air !== null ? details.next_episode_to_air.air_date : details.last_air_date)

            // need to seperate what need to be added to subcollection vs main media collection
            // basically anything unique to the user will go in the sub
            let obj = {
                title: title,
                release_date: release_date,
                media_type: o.media_type,
                is_anime: is_anime,
                upcoming_release: upcoming_release,
                // these details could change: (new episodes etc, is it better to just use a get everytime and not store these? or have a refresh button to get more current data)
                details: details
            }
            try {
                const docRef = await addDoc(mediaCollectionRef, obj)
                const newDocId = docRef.id;
                if (newDocId) {
                    return { media_uid: newDocId, title };
                } else {
                    throw new Error('Failed to create media.');
                }
            } catch (err) {
                console.error(err)
            }
        } else {
            const oldDocId = querySnapshot.docs[0].id;
            if (oldDocId) {
                return { media_uid: oldDocId, title };
            } else {
                throw new Error('Failed to create media.');
            }
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
        view
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

    if (loading) {
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
            <h1>Loading...</h1>
        </div>
    } else {
        return <div>
            {contextHolder}
            <MovieTable
                pagination={{ position: ["bottomCenter"], showSizeChanger: true, }}
                header={"Watchlist | " + userMedia.filter((item) => item.list_type === "watchlist").length + " Items"}
                onRemove={() => {
                    deleteUserMedia(selected, user);
                    // need to add a if successful then execute these
                    onMessage("Deleted " + selected.length + " Items", "success");
                    getUserMedia(user.uid);
                }}
                onMove={() => moveItemList("seen", user.uid, selected)}
                disableButtons={disableButtons}
                columns={watchlistColumns}
                data={userMedia.filter((item) => item.list_type === "watchlist")}
                rowSelection={rowSelection}
                showMove={true}
                moveKeyword={"Seen"}
                showRemove={true}
            />
        </div>
    }
};

export default SeenPage;