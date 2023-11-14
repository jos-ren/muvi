"use client";
import { useState, useEffect, useRef } from "react";
import { message, Input, Button, InputNumber, Space, Tooltip, Progress, Select, Divider, Popover, Dropdown } from 'antd';
import { StarTwoTone, StarOutlined, SearchOutlined, CheckOutlined, EditOutlined, QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import MovieTable from "@/components/MovieTable.js"
import { poster, date_added, release_date, type, genres, view } from "@/columns.js"
import { getDocs, collection, getDoc, doc } from "firebase/firestore"
import { useRouter } from 'next/navigation'

import { deleteUserMedia, updateUserMedia, moveItemList } from "@/app/api/api.js"

// firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/config/firebase.js"

const SeenPage = () => {
    const [userMedia, setUserMedia] = useState([]);
    const [selected, setSelected] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [disableButtons, setDisableButtons] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [progressID, setProgressID] = useState();
    const [ratingID, setRatingID] = useState();
    const [epOptions, setEpOptions] = useState([]);
    const [seOptions, setSeOptions] = useState([]);
    const [seValue, setSeValue] = useState(null);
    const [epValue, setEpValue] = useState(null);
    const [ratingValue, setRatingValue] = useState(null);
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

    const onUpdate = (data) => {
        setRatingID(false);
        setProgressID(false);
        let updatedData = {};
        seValue !== null ? updatedData.my_season = seValue : null;
        epValue !== null ? updatedData.my_episode = epValue : null;
        ratingValue !== null ? updatedData.my_rating = ratingValue : null;
        console.log(Object.keys(updatedData).length, updatedData)
        // check if any changes
        if (Object.keys(updatedData).length !== 0) {
            updateUserMedia(data.key, user.uid, updatedData);
            onMessage("Updated " + data.title, "success")
            getUserMedia(user.uid);
        } else {
            onMessage("No Changes", "warning")
        }
    }

    const my_rating = {
        title: 'My Rating',
        dataIndex: 'my_rating',
        sorter: (a, b) => a.my_rating - b.my_rating,
        render: (my_rating, data) => {
            return <>
                {ratingID === data.key ?
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
                            <Button icon={<CheckOutlined />} size="small" onClick={() => { onUpdate(data) }} />
                            <Button icon={<CloseOutlined />} size="small" onClick={() => { setRatingID(false) }} />
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
                            setRatingID(data.key);
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
                    {progressID === data.key ?
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
                                <Button icon={<CheckOutlined />} size="small" onClick={() => { onUpdate(data) }} />
                                <Button icon={<CloseOutlined />} size="small" onClick={() => { setProgressID(false) }} />
                            </div>
                        </div> : <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <>
                                {data.is_anime !== true ? <> S {data.my_season}</> : null}
                                <> E {data.my_episode}</>
                            </>
                            <Button icon={<EditOutlined />} size="small" onClick={() => {
                                setNull();
                                setProgressID(data.key);
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

    const seenColumns = [
        poster,
        title,
        release_date,
        date_added,
        my_rating,
        type,
        genres,
        progress,
        view,
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
        return (
            <div>
                {contextHolder}
                <MovieTable
                    pagination={{ position: ["bottomCenter"], showSizeChanger: true, }}
                    header={"Seen | " + userMedia.filter((item) => item.list_type === "seen").length + " Items"}
                    onRemove={() => {
                        deleteUserMedia(selected, user);
                        // need to add a if successful then execute these
                        onMessage("Deleted " + selected.length + " Items", "success");
                        getUserMedia(user.uid);
                    }}
                    onMove={() => {
                        moveItemList("watchlist", user.uid, selected);
                        onMessage("Moved " + selected.length + " Items to Watchlist", "success");
                        getUserMedia(user.uid);
                    }}
                    disableButtons={disableButtons}
                    columns={seenColumns}
                    data={userMedia.filter((item) => item.list_type === "seen")}
                    rowSelection={rowSelection}
                    showMove={true}
                    moveKeyword={"Watchlist"}
                    showRemove={true}
                />
            </div>
        );
    }
};

export default SeenPage;