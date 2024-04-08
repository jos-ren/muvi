"use client";
import { useState, useEffect, useRef } from "react";
import { message, Input, Button, Space, Tooltip, Progress, Dropdown } from 'antd';
import { SearchOutlined, CheckOutlined, EditOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import MovieTable from "@/components/MovieTable.js"
import { poster, date_added, release_date, type, genres, my_rating, currently_airing } from "@/columns.js"
import { deleteUserMedia, updateUserMedia, moveItemList, getUserMedia } from "@/api/api.js"
import { useGlobalContext } from '@/context/store.js';
import styled from "styled-components";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { TbExternalLink } from "react-icons/tb";
import EditModal from "@/components/EditModal";

const Block = styled.div`
    margin-right: 3px;
    cursor: default;
    border: 1px solid #d9d9d9;
    height: 22px;
    min-width: 22px; 
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    border-radius: 5px;
`;

const SeenPage = () => {
    const [selected, setSelected] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [disableButtons, setDisableButtons] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [loading, setLoading] = useState(true);
    const { user, data, setData } = useGlobalContext();
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);


    const [epOptions, setEpOptions] = useState([]);
    const [seOptions, setSeOptions] = useState([]);

    const [modalTitle, setModalTitle] = useState("");
    const [modalRating, setModalRating] = useState(null);
    const [modalEpisode, setModalEpisode] = useState(null);
    const [modalSeason, setModalSeason] = useState(null);
    const [modalIsAnime, setModalIsAnime] = useState(false);
    const [modalMediaType, setModalMediaType] = useState("");
    const [modalReview, setModalReview] = useState("");
    const [modalIsSeasonalAnime, setModalIsSeasonalAnime] = useState(false);
    const [modalData, setModalData] = useState({});


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

    const filterOption = (input, option) => {
        const label = option?.label || '';
        const optionValue = String(option.value);

        return (
            label.toLowerCase().startsWith(input.toLowerCase()) ||
            optionValue.toLowerCase().startsWith(input.toLowerCase())
        );
    };

    const progress = {
        title: 'Progress',
        render: (data) => {
            let percent = 0
            let total_watched = data.my_episode
            if (data.media_type === "movie") {
                percent = 100
            } else {
                if (data.is_anime === true && data.is_seasonal_anime === false) {
                    percent = total_watched / data.details.number_of_episodes * 100
                } else {
                    total_watched = getTotalEpisodes(data)
                    percent = total_watched / data.details.number_of_episodes * 100
                }
            }
            return <>
                {data.media_type !== "movie" ? <div>
                    {/* have an option for Completed */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ display: "flex" }}>
                            {!data.is_anime || (data.is_seasonal_anime && data.is_anime) ?
                                <Block style={{
                                    padding: "0px 5px",
                                    fontSize: "9pt",
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>S : {data.my_season}</Block> :
                                <></>}
                            <Block style={{
                                padding: "0px 5px",
                                fontSize: "9pt",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>E : {data.my_episode}</Block>
                        </div>
                    </div>
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

    // THIS SHOULD ALWAYS BE THE SAME AS THE ONES IN UPCOMING, SEEN, WATCHLIST (minus hide)
    const actions = {
        title: '',
        render: (data) => {
            const items = [
                {
                    key: '1',
                    label: (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "start" }}
                            onClick={() => { showModal(data) }}>
                            <EditOutlined />
                            <div>
                                Edit
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
                                await moveItemList("watchlist", user.uid, [data.key]);
                                const result = await getUserMedia(user.uid);
                                setData(result);
                                onMessage("Moved " + data.title + " Watchlist", "success");
                            }}>
                            <SwapOutlined />
                            <div>
                                Move to Watchlist
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

    const showModal = (data) => {
        setModalTitle("Edit " + data.title);
        setModalRating(data.my_rating);
        setModalEpisode(data.my_episode);
        setModalSeason(data.my_season);
        setModalReview(data.my_review);
        setModalIsAnime(data.is_anime);
        setModalMediaType(data.media_type);
        setModalIsSeasonalAnime(data.is_seasonal_anime);
        setModalData(data)

        if (data.media_type !== "movie") {
            console.log(data.is_anime, data.is_seasonal_anime)
            if (data.is_anime === true && data.is_seasonal_anime === false) {
                setEpOptions(getEpOptions(data, 1, null, false));
            } else {
                setSeOptions(getSeOptions(data));
                setEpOptions(getEpOptions(data, data.my_season, null, true));
            }
        }
        setOpen(true);
    };

    const resetModalValues = () => {
        setModalTitle(null);
        setModalRating(null);
        setModalEpisode(null);
        setModalSeason(null);
        setModalIsAnime(null);
        setModalMediaType(null);
        setModalReview(null);
        setModalIsSeasonalAnime(null);
    }

    const episodeChange = (value) => {
        console.log(`selected ${value} episode`);
        setModalEpisode(value)
    };

    const seasonChange = (value, o) => {
        console.log(`selected ${value} season`);
        setModalSeason(value)
        setEpOptions(getEpOptions(modalData, value, o.count, modalIsSeasonalAnime))
    };

    const getSeOptions = (data) => {
        let temp = []
        // remove specials
        let seasons = data.details.seasons.filter((o) => { return o.season_number !== 0 })
        seasons.forEach((o) => { temp.push({ "value": o.season_number, "label": "" + o.season_number, "count": o.episode_count }) })
        return temp
    }

    const getEpOptions = (data, season_value, count, is_seasonal_value) => {
        let temp = []
        let num = ""
        // this works because i think the modalIsSeasonalAnime lags behind a bit, it works so i wont question it lol
        if ((modalIsAnime || data.is_anime) && is_seasonal_value !== true) {
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

    const onSeasonalClick = (is_checked) => {
        setModalIsSeasonalAnime(is_checked);
        if (is_checked) {
            setSeOptions(getSeOptions(modalData));
            setEpOptions(getEpOptions(modalData, modalData.my_season, null, true));
            //resets the values to one when changing to seasonal
            setModalEpisode(1);
            setModalSeason(1);
        } else {
            setEpOptions(getEpOptions(modalData, modalData.my_season, null, false));
            //resets the values to one when changing to non seasonal
            setModalEpisode(1);
            setModalSeason(1);
        }
    }

    const onUpdate = async () => {
        let updatedData = {
            ...(modalSeason !== modalData.my_season && { my_season: modalSeason }),
            ...(modalEpisode !== modalData.my_episode && { my_episode: modalEpisode }),
            ...(modalRating !== modalData.my_rating && { my_rating: modalRating }),
            ...(modalReview !== modalData.my_review && modalReview !== undefined && { my_review: modalReview }),
            ...(modalIsSeasonalAnime !== modalData.is_seasonal_anime && modalIsSeasonalAnime !== undefined && { is_seasonal_anime: modalIsSeasonalAnime }),
            last_edited: new Date()
        };

        // // check if any changes
        if (Object.keys(updatedData).length > 1) {
            await updateUserMedia(modalData.key, user.uid, updatedData);
            onMessage("Updated " + modalData.title, "success")
            const result = await getUserMedia(user.uid);
            setData(result);
        } else {
            onMessage("No Changes", "warning")
        }
    }

    const handleOk = () => {
        setConfirmLoading(true);
        onUpdate();
        setOpen(false);
        setConfirmLoading(false);
        resetModalValues();
    };

    const handleCancel = () => {
        setOpen(false);
        resetModalValues();
    };

    const seenColumns = [
        currently_airing,
        poster,
        title,
        release_date,
        date_added,
        my_rating,
        type,
        genres,
        progress,
        actions,
    ];

    useEffect(() => {
        if (user !== null) {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
            <h1>Loading...</h1>
        </div>
    } else {
        return (
            <div>
                {contextHolder}
                <EditModal
                    modalTitle={modalTitle}
                    open={open}
                    handleOk={handleOk}
                    confirmLoading={confirmLoading}
                    handleCancel={handleCancel}
                    modalRating={modalRating}
                    setModalRating={setModalRating}
                    modalMediaType={modalMediaType}
                    modalIsAnime={modalIsAnime}
                    modalIsSeasonalAnime={modalIsSeasonalAnime}
                    modalSeason={modalSeason}
                    seasonChange={seasonChange}
                    seOptions={seOptions}
                    filterOption={filterOption}
                    modalEpisode={modalEpisode}
                    episodeChange={episodeChange}
                    epOptions={epOptions}
                    onSeasonalClick={onSeasonalClick}
                    modalReview={modalReview}
                    setModalReview={setModalReview}
                />
                <MovieTable
                    pagination={{ position: ["bottomCenter"], showSizeChanger: true, }}
                    header={"Seen | " + data.filter((item) => item.list_type === "seen").length + " Items"}
                    onRemove={async () => {
                        await deleteUserMedia(selected, user);
                        const result = await getUserMedia(user.uid);
                        setSelected([])
                        setData(result);
                        onMessage("Deleted " + selected.length + " Items", "success");
                    }}
                    onMove={async () => {
                        await moveItemList("watchlist", user.uid, selected);
                        const result = await getUserMedia(user.uid);
                        setSelected([])
                        setData(result);
                        onMessage("Moved " + selected.length + " Items to Watchlist", "success");
                    }}
                    disableButtons={disableButtons}
                    columns={seenColumns}
                    data={data.filter((item) => item.list_type === "seen")}
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