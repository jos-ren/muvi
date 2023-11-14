"use client";
import { useState, useEffect, useRef } from "react";
import { message, Input, Button,  Space } from 'antd';
import { SearchOutlined} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import MovieTable from "@/components/MovieTable.js"
import { poster, date_added, release_date, audience_rating, type, genres, view } from "@/columns.js"
import { getDocs, collection, getDoc, doc} from "firebase/firestore"
import { useRouter } from 'next/navigation'

// firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/config/firebase.js"

import { deleteUserMedia, moveItemList } from "@/api/api.js"

const SeenPage = () => {
    const [userMedia, setUserMedia] = useState([]);
    const [selected, setSelected] = useState([]);
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