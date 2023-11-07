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

    const setNull = () => {
        setSeValue(null);
        setEpValue(null);
        setRatingValue(null);
    }

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



    const my_rating = {
        title: 'My Rating',
        dataIndex: 'my_rating',
        sorter: (a, b) => a.my_rating - b.my_rating,
        render: (my_rating, data) => {
            return <>
                {ratingEditMode === data.key ?
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <InputNumber
                            min={1}
                            max={10}
                            // addonBefore={<StarTwoTone twoToneColor="#fadb14" />}
                            size="small"
                            defaultValue={data.my_rating}
                            // controls={false}
                            style={{ maxWidth: "60px", marginRight: "4px" }}
                            onChange={(value) => { setRatingValue(value) }}
                        />
                        <div>
                            <Button icon={<CheckOutlined />} size="small" onClick={() => { setRatingEditMode(false); updateUserMedia(data); }} />
                            <Button icon={<CloseOutlined />} size="small" onClick={() => { setRatingEditMode(false) }} />
                        </div>
                    </div>
                    :
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        {my_rating !== 0 ?
                            <div>
                                <StarTwoTone twoToneColor="#fadb14" />
                                <> </>
                                {Number.parseFloat(my_rating).toFixed(1)}
                            </div> : <>
                                <StarOutlined />
                            </>}
                        <Button icon={<EditOutlined />} size="small" onClick={() => {
                            setRatingEditMode(data.key);
                            setNull();
                        }} />
                    </div>
                }
            </>
        }
    }

    const filterOption = (input, option) => {
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
    }

    const episodeChange = (value) => {
        console.log(`selected ${value} episode`);
        setEpValue(value)
    };

    const seasonChange = (value, o) => {
        console.log(`selected ${value} season`);
        setSeValue(value)
        setEpOptions(getEpOptions({}, value, o.count))
    };

    const getSeOptions = (data) => {
        let temp = []
        // remove specials
        let seasons = data.details.seasons.filter((o) => { return o.season_number !== 0 })
        seasons.forEach((o) => { temp.push({ "value": o.season_number, "label": "" + o.season_number, "count": o.episode_count }) })
        return temp
    }

    const getEpOptions = (data, season_value, count) => {
        let temp = []
        let num = ""
        if (data.is_anime) {
            num = data.details.number_of_episodes
        } else {
            if (count) {
                num = count
            } else {
                num = data.details.seasons.filter((o) => { return o.season_number === season_value })[0].episode_count
            }
        }
        for (let i = 1; i < num + 1; i++) {
            temp.push({ "value": i, "label": "" + i })
        }
        return temp
    }

    const getTotalEpisodes = (data) => {
        let total = 0
        for (let i = 1; i < data.my_season; i++) {
            total = total + data.details.seasons[i].episode_count
        }
        // past seasons + current episode of current season
        return total + data.my_episode
    }

    const progress = {
        title: 'Progress',
        // dataIndex: 'my_rating',
        // sorter: (a, b) => a.my_rating - b.my_rating,
        render: (data) => {
            let percent = 0
            let total_watched = data.my_episode
            if (data.media_type === "movie") {
                percent = 100
            } else {
                if (data.is_anime === true) {
                    percent = total_watched / data.details.number_of_episodes * 100
                } else {
                    total_watched = getTotalEpisodes(data)
                    percent = total_watched / data.details.number_of_episodes * 100
                }
            }
            return <>
                {data.media_type !== "movie" ? <div>
                    {/* have an option for Completed */}
                    {progressEditMode === data.key ?
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                                {data.is_anime !== true ? <Select
                                    showSearch
                                    defaultValue={data.my_season}
                                    placeholder="Select a person"
                                    optionFilterProp="children"
                                    style={{ width: 70 }}
                                    onChange={seasonChange}
                                    // onSearch={seasonSearch}
                                    options={seOptions}
                                    filterOption={filterOption}
                                /> : null}
                                <Select
                                    showSearch
                                    defaultValue={data.my_episode}
                                    placeholder="Select a person"
                                    optionFilterProp="children"
                                    style={{ width: 80 }}
                                    onChange={episodeChange}
                                    // onSearch={episodeSearch}
                                    options={epOptions}
                                    filterOption={filterOption}
                                />
                            </div>
                            <div>
                                <Button icon={<CheckOutlined />} size="small" onClick={() => { setProgressEditMode(false); updateUserMedia(data); }}></Button>
                                <Button icon={<CloseOutlined />} size="small" onClick={() => { setProgressEditMode(false) }}></Button>
                            </div>
                        </div> : <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <>
                                {data.is_anime !== true ? <> S {data.my_season}</> : null}
                                <> E {data.my_episode}</>
                            </>
                            <Button icon={<EditOutlined />} size="small" onClick={() => {
                                setNull();
                                setProgressEditMode(data.key);
                                setSeOptions(getSeOptions(data));
                                setEpOptions(getEpOptions(data, data.my_season));
                            }} />
                        </div>
                    }
                </div> : null}
                <Tooltip title={data.media_type === "movie" ? "Watched" : total_watched + "/" + data.details.number_of_episodes + " Episodes"}>
                    <Progress
                        format={percent === 100 ? () => <CheckOutlined /> : () => Number.parseFloat(percent).toFixed(0) + "%"}
                        size="small" percent={percent}
                    />
                </Tooltip>
            </>
        }
    }

    // ==================== REFACTORED FUNCS =====================

    const getUserMedia = async (uid) => {
        try {
            const userDocRef = doc(db, 'Users', uid);
            const mediaListCollectionRef = collection(userDocRef, 'MediaList');
            const mediaListSnapshot = await getDocs(mediaListCollectionRef);
            const userData = mediaListSnapshot.docs.map((doc) => ({ ...doc.data(), key: doc.id }));

            const combinedData = await processFilteredData(userData);
            setUserMedia(combinedData);
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

    // to change list type
    const moveItemList = async (location) => {
        const userID = user.uid;
        const updatedData = {
            list_type: location,
        };
        const batch = writeBatch(db);

        for (const docId of selected) {
            const docRef = doc(db, 'Users', userID, 'MediaList', docId);
            batch.update(docRef, updatedData);
        }

        try {
            await batch.commit();
            onMessage("Moved " + selected.length + " Items to " + capitalizeFirstLetter(location), "success");
            getUserMedia(userID);
        } catch (err) {
            console.error(err);
        }
    };

    // to change rating, progress, etc
    const updateUserMedia = async (data) => {
        // console.log(data.key, ratingValue)
        let userID = user.uid
        let updatedData = {};

        if (ratingEditMode) {
            updatedData.my_rating = ratingValue;
        } else if (progressEditMode) {
            updatedData.my_season = seValue;
            updatedData.my_episode = epValue;
        }
        // console.log(updatedData)

        try {
            await updateDoc(doc(db, 'Users', userID, 'MediaList', data.key), updatedData)
        } catch (err) {
            console.error(err);
        }

        onMessage("Updated " + data.title, "success")
        getUserMedia(userID);
    }

    const deleteUserMedia = async () => {
        const userID = user.uid;
        const batch = writeBatch(db);

        for (const docId of selected) {
            const docRef = doc(db, 'Users', userID, 'MediaList', docId);
            batch.delete(docRef);
        }

        try {
            await batch.commit();
            onMessage("Deleted " + selected.length + " Items", "success");
            // After the data is deleted, get media again
            getUserMedia(userID);
        } catch (err) {
            console.error(err);
        }
    };

    // ======================= ^^ NEW REFACTORED STUFF ^^ =============

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
                setLoading(false)
            } else {
                // send user to login if not logged in
                router.push('/auth/login')
            }
        })
    }, []);

    return (
        <div>
            {contextHolder}
            <MovieTable
                pagination={{ position: ["bottomCenter"], showSizeChanger: true, }}
                header={"Watchlist | " + userMedia.filter((item) => item.list_type === "watchlist").length + " Items"}
                onRemove={() => deleteUserMedia()}
                onMove={() => moveItemList("seen")}
                disableButtons={disableButtons}
                columns={watchlistColumns}
                data={userMedia.filter((item) => item.list_type === "watchlist")}
                rowSelection={rowSelection}
                showMove={true}
                moveKeyword={"Seen"}
                showRemove={true}
            />
        </div>
    );
};

export default SeenPage;