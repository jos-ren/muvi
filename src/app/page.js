"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { message, Input, Button, Tag, Tabs, InputNumber, Space, Tooltip, Skeleton, Progress, Popover, Select } from 'antd';
const { Search } = Input;
import { StarTwoTone, StarOutlined, EyeOutlined, SearchOutlined, CheckOutlined, RiseOutlined, EditOutlined, CheckCircleTwoTone, QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { FaRegBookmark } from "react-icons/fa6";
import Highlighter from 'react-highlight-words';
import { genreCodes } from "../../genres.js"
import MovieTable from "../../comps/MovieTable.js"
import Card from "../../comps/Card.js"
import Hero from "../../comps/Hero.js"
import { getTodaysDate, checkType } from "../../functions.js"
import styled from "styled-components";

// skeleton for grid when searching
// hide poster button (will hide or show a column based on if true or not)
// make title filter inline with column name
// move tab bar to top? change color to dark blue
// sort progress by percentage complete
// have a guide for first time user that shows how upcoming works - set a const to true in localstorage if they have clicked it already (Tour comp)
// find a way to update the data for your items as next episodes dont update localstorage dynamically
// make view more, more stylish
// sticky tab bar (make your own)
// clear selection button for tables
// feedback when no results for search
// bug: if you swap an item to an empty table it will be null
// refresh button to upcoming
// screen if something goes wrong, tell them to delete their localstorage
//  a statistics tab, showing what is your prefered genres, average rating, what decade movies you like most, etc
// in the future have a view button to expand and see all the details of the show. possibly a new page or maybe just accordian

// MOST IMPORTANT
// edit rating
// edit ss && ee
// ==> only edit one at a time
// --> needs to look better while displaying
// hero section
// upcoming tab
// ✅ --> sort by release if movie, and next episode if tv 
// --> function to check daily if a tv show should be removed
// --> also track items in watchlist which have unreleased episodes
// --> maybe a refresh button in upcoming to check for more recent dates for your media

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 10px;
`;

const Footer = styled.div`
  margin-top: 75px;
  display: flex;
  height: 75px;
  justify-content: center;
  align-items: center;
  position: relative;
  bottom: -10px;
  background: #fafafa;
  font-size: 10pt;
`;

const Block = styled.div`
  margin-right: 3px;
  cursor: default;
  border: 1px solid #d9d9d9;
  width: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 5px;
`;

export default function Home() {
  const fetch = require("node-fetch");
  const [media, setMedia] = useState([]);
  const [seen, setSeen] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [trending, setTrending] = useState([]);
  const [search, setSearch] = useState([]);
  const [selected, setSelected] = useState([]);
  const [disableClear, setDisableClear] = useState(true);
  const [disableButtons, setDisableButtons] = useState(true);
  const [loaded, setLoaded] = useState(true);
  const [page, setPage] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [viewMoreSearch, setViewMoreSearch] = useState(false);
  const [viewMoreTrending, setViewMoreTrending] = useState(false);
  const [episodeEditMode, setEpisodeEditMode] = useState(37854);
  const [ratingEditMode, setRatingEditMode] = useState();
  const [epValue, setEpValue] = useState();
  const [seValue, setSeValue] = useState();

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
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
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
            onClick={() => clearFilters && handleReset(clearFilters)}
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

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setSelected(selectedRowKeys)
      selectedRows.length !== 0 ? setDisableButtons(false) : setDisableButtons(true)
    }
  };
  // console.log(rowSelection.selectedRowKeys)

  const onMessage = (message, type) => {
    messageApi.open({
      type: type,
      content: message,
    });
  };

  const onSearch = async (value) => {
    const response = await fetch("https://api.themoviedb.org/3/search/multi?&language=en-US&query=" + value + "&page=1&include_adult=false", options);
    let json = await response.json();
    // if items are people or dont include a poster, remove from search results
    let passed = json.results.filter((e) => e.poster_path !== null && e.media_type !== "person")
    setSearch(passed)
    setDisableClear(false)
  };

  const clearSearch = () => {
    setSearch([])
    setDisableClear(true)
  };

  // track tv shows that are currently airing
  // movies that are coming out in the future on watchlist
  // seperate by day of release

  const addMedia = async (o, method, lType) => {
    // first check seen, then watchlist for the movie. ELSE add the movie
    if (seen.some(e => e.key === o.id)) {
      onMessage("Already in Seen", "warning");
    } else if (watchlist.some(e => e.key === o.id)) {
      onMessage("Already in Watchlist", "warning");
    } else {
      // method 1 = creating, method 2 = swapping list_type
      let key = method === 1 ? o.id : o.key;
      let title = method === 1 ? (o.media_type === "movie" ? o.title : o.name) : o.title;
      let date_added = method === 1 ? getTodaysDate() : o.date_added;
      let release_date = method === 1 ? (o.media_type === "movie" ? o.release_date : o.first_air_date) : o.release_date;

      // determine if anime. animation genre + japanese language = true
      let animation = false
      let g_ids = method === 1 ? o.genre_ids : o.details.genres
      g_ids.forEach((id) => {
        if (id === 16) {
          animation = true
        }
      })
      let is_anime = method === 1 ? (o.original_language === "ja" && animation === true ? true : false) : o.is_anime;

      // needs change once i make edit theose possible
      let my_season = method === 1 ? 0 : o.my_season;
      let my_episode = method === 1 ? 0 : o.my_episode;
      let my_rating = method === 1 ? 0 : o.my_rating;

      let list_type = lType;

      // get details
      let details = []
      if (method === 1) {
        const response = await fetch("https://api.themoviedb.org/3/" + o.media_type + "/" + key + "?language=en-US", options);
        details = await response.json();
      } else {
        details = o.details
      }

      let upcoming_release = method === 1 ? (o.media_type === "movie" ? details.release_date : (details.next_episode_to_air !== null ? details.next_episode_to_air.air_date : details.last_air_date)) : o.upcoming_release

      let obj = {
        key: key,
        title: title,
        date_added: date_added,
        release_date: release_date,
        media_type: o.media_type,
        list_type: list_type,
        is_anime: is_anime,
        my_season: my_season,
        my_episode: my_episode,
        my_rating: my_rating,
        upcoming_release: upcoming_release,
        details: details
      }

      let localMedia = ""
      let localSeen = ""
      let localWatchlist = ""
      if (JSON.parse(localStorage.getItem("media")) !== null) {
        localMedia = JSON.parse(localStorage.getItem("media"))
        localSeen = localMedia.filter((o) => checkType(o, 1))
        localWatchlist = localMedia.filter((o) => checkType(o, 2))
      }
      if (method === 1) {
        lType === "seen" ? setSeen(localMedia !== "" ? [...localSeen, obj] : [obj]) : setWatchlist(localMedia !== "" ? [...localWatchlist, obj] : [obj])
        setMedia(localMedia !== "" ? [...localMedia, obj] : [obj])
        localStorage.setItem("media", JSON.stringify([...localMedia, obj]))
        onMessage("Added " + title + ' to ' + lType, 'success')
      } else {
        lType === "seen" ? setSeen([...localSeen, obj]) : setWatchlist([...localWatchlist, obj])
        setMedia([...localMedia, obj])
        localStorage.setItem("media", JSON.stringify([...localMedia, obj]))
      }
    }
  };

  const onMove = (lType) => {
    // lType = the list destination
    // remove item, read it with list_type changed
    selected.forEach((i) => {
      let data = media.find((e) => e.key == i)
      addMedia(data, 2, lType)
    })
    onRemove(false, lType)
    onMessage("Moved " + selected.length + ' items to ' + lType, 'success')
  };

  const onRemove = (showSuccess, lType) => {
    let filtered = JSON.parse(localStorage.getItem("media")).filter(item => !selected.includes(item.key))
    if (showSuccess === false) {
      let addition = JSON.parse(localStorage.getItem("media")).filter(item => selected.includes(item.key) && item.list_type === lType)
      filtered = filtered.concat(addition)
    }
    setSeen(filtered.filter((o) => checkType(o, 1)))
    setWatchlist(filtered.filter((o) => checkType(o, 2)))
    setMedia(filtered)
    localStorage.setItem("media", JSON.stringify(filtered));
    showSuccess === true ? onMessage('Successfully Removed ' + selected.length + ' Items', 'success') : null;
    setDisableButtons(true);
  };

  
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
    },
  };
  
  // console.log("SEEN", seen)
  // console.log("WATCHLIST", watchlist)
  // console.log("MEDIA", media)
  // console.log("up", upcoming)
  // console.log("---")

  useEffect(() => {
    const localMedia = JSON.parse(localStorage.getItem("media"));
    if (localMedia) {
      setMedia(localMedia);
      setSeen(localMedia.filter((o) => checkType(o, 1)));
      setWatchlist(localMedia.filter((o) => checkType(o, 2)));
      setUpcoming(localMedia.filter((o) => new Date(o.upcoming_release) > new Date()));
    }
    // fetch top movies
    async function fetchData() {
      const response = await fetch("https://api.themoviedb.org/3/trending/all/day?language=en-US", options);
      const json = await response.json();
      let temp = json.results
      temp.forEach((item, index) => {
        item.key = index + 1;
      })
      setTrending(temp)
    }
    fetchData();
  }, []);

  // ------------ table columns ----------------------------------------------------------------------------------------------------------
  const poster = {
    title: 'Poster',
    render: (data) => <Image
      src={"https://image.tmdb.org/t/p/original/" + data.details.poster_path}
      alt={data.title}
      width={50}
      height={75}
      style={{ objectFit: "cover" }}
    />
  }

  const title = {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    ...getColumnSearchProps('title'),
  }

  const date_added = {
    title: 'Date Added',
    dataIndex: 'date_added',
    // defaultSortOrder: 'ascend',
    sorter: (a, b) => new Date(b.date_added) - new Date(a.date_added),
    render: (date_added) => {
      const date = new Date(date_added)
      return <div>{date.toLocaleDateString('en-US', { dateStyle: "medium", })}</div>
    }
  }

  const release_date = {
    title: 'Release Date',
    dataIndex: 'release_date',
    // defaultSortOrder: 'descend',
    sorter: (a, b) => new Date(b.release_date) - new Date(a.release_date),
    render: (release_date) => {
      const date = new Date(release_date)
      return <div>{date.toLocaleDateString('en-US', { dateStyle: "medium", })}</div>
    }
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
              addonBefore={<StarTwoTone twoToneColor="#fadb14" />}
              size="small"
              defaultValue={data.my_rating}
              controls={false}
              style={{ maxWidth: "65px", marginRight: "4px" }}
              onChange={(value) => { console.log(value), setEpValue(value) }}
            />
            <div>
              <Button icon={<CheckOutlined />} size="small" onClick={() => { setRatingEditMode(false) }}></Button>
              <Button icon={<CloseOutlined />} size="small" onClick={() => { setRatingEditMode(false) }}></Button>
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
            <Button icon={<EditOutlined />} size="small" onClick={() => { setRatingEditMode(data.key), console.log("clicked", data.key) }}></Button>
          </div>
        }
      </>
    }
  }

  const audience_rating = {
    title: 'Audience Rating',
    // dataIndex: 'data.details.vote_average',
    // sorter: (a, b) => a.data.details.vote_average - b.data.details.vote_average,
    render: (data) => <>
      <StarTwoTone twoToneColor="#fadb14" />
      <> </>
      {Number.parseFloat(data.details.vote_average).toFixed(1)}
    </>
  }

  const view = {
    title: 'Details',
    // dataIndex: 'data.details.vote_average',
    // sorter: (a, b) => a.data.details.vote_average - b.data.details.vote_average,
    render: (data) => {
      let link = data.media_type === "movie" ? "https://www.imdb.com/title/" + data.details.imdb_id : "https://www.themoviedb.org/tv/" + data.details.id
      return <Button type="link" href={link} target="_blank">View</Button>
    }
  }

  const type = {
    title: 'Type',
    // dataIndex: 'media_type',
    filters: [
      {
        text: 'Movie',
        value: 'movie',
      },
      {
        text: 'TV',
        value: 'tv',
      },
      {
        text: 'Anime',
        value: 'anime',
      },
    ],
    onFilter: (value, record) => record.media_type.indexOf(value) === 0,
    // render: (media_type) => media_type.charAt(0).toUpperCase() + media_type.slice(1)
    render: (data) => {
      let color = ""
      let text = ""
      if (data.is_anime === true && data.media_type !== "movie") {
        color = "geekblue"
        text = "anime"
      } else if (data.media_type === "tv") {
        color = "green"
        text = "tv"
      } else {
        color = "volcano"
        text = "movie"
      }
      return (
        <Tag color={color}>
          {text.toUpperCase()}
        </Tag>
      )
    }
  }

  const genres = {
    title: 'Genres',
    render: (data) => {
      let nameArr = []
      let emojiArr = []
      data.details.genres.map((i) => {
        genreCodes.forEach(myFunction)
        function myFunction(i2) {
          if (i.id === i2.id) {
            nameArr.push(i2.name)
            emojiArr.push(i2.emoji)
          }
        }
      })
      return <div style={{ display: "flex" }}>
        {nameArr.map((i, index) =>
          <Block key={index}>
            <Tooltip title={i}>
              {emojiArr[index]}
            </Tooltip>
          </Block>
        )}
      </div>
    }
  }

  const next_episode = {
    title: 'Next Episode',
    // sorter: (a, b) => new Date(b.data.details.next_episode_to_air.air_date) - new Date(a.data.details.next_episode_to_air.air_date),
    render: (data) => {
      let temp = ""
      let date = ""
      if (data.media_type === "movie") {
        return "N/A"
      } else {
        if (data.details.next_episode_to_air === null || data.details.next_episode_to_air === undefined) {
          date = "Finished"
        } else {
          temp = new Date(data.details.next_episode_to_air.air_date)
          date = temp.toLocaleDateString('en-US', { dateStyle: "medium", })
        }
      }
      return <div>{date}</div>
    }
  }

  const selectChange = (value) => {
    console.log(`selected ${value}`);
  };

  const selectSearch = (value) => {
    console.log('search:', value);
  };

  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const progress = {
    title: 'Progress',
    render: (data) => {
      let percent = 0
      {/* if u want to get really technical, find how many episodes are in a specific season, and calculate the percentage by episode/episode total */ }
      // chnage inpuits to searchable dropdowns ^
      // S1 eps + S2 eps + etc...
      if (data.media_type === "movie") {
        percent = 100
      } else if (data.media_type === "tv") {
        // have a x / 128 episodes which takes total episodes and episodes youve watched to make a percentage
        if (data.details.number_of_seasons === 1) {
          percent = data.my_episode / data.details.number_of_episodes * 100
        } else {
          percent = data.my_season / data.details.number_of_seasons * 100
        }
      } else {
        {/* for status bar, if its a tv show have status be about seasons, if anime be about episodes */ }
        percent = data.my_episode / data.details.number_of_episodes * 100
      }
      return <>
        {data.media_type !== "movie" ? <div>
          {/* have an option for Completed */}
          {episodeEditMode === data.key ?
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <Select
                  showSearch
                  defaultValue="lucy"
                  placeholder="Select a person"
                  optionFilterProp="children"
                  style={{ width: 120 }}
                  onChange={selectChange}
                  onSearch={selectSearch}
                  filterOption={filterOption}
                  options={[
                    { value: 'jack', label: 'Jack', },
                    { value: 'lucy', label: 'Lucy', },
                    { value: 'Yiminghe', label: 'yiminghe', }
                  ]}
                />
                {/* {data.is_anime !== true ?
                  <InputNumber
                    min={1}
                    addonBefore="S"
                    size="small"
                    defaultValue={data.my_season}
                    controls={false}
                    style={{ maxWidth: "65px", marginRight: "4px" }}
                    onChange={() => { }}
                  /> : null} */}
                {/* <InputNumber
                  min={1}
                  addonBefore="E"
                  size="small"
                  defaultValue={data.my_episode}
                  controls={false}
                  style={{ maxWidth: "65px", marginRight: "4px" }}
                  onChange={(value) => { console.log(value), setEpValue(value) }}
                /> */}
              </div>
              <div>
                <Button icon={<CheckOutlined />} size="small" onClick={() => { setEpisodeEditMode(false), console.log(epValue, "??") }}></Button>
                <Button icon={<CloseOutlined />} size="small" onClick={() => { setEpisodeEditMode(false) }}></Button>
              </div>
            </div> : <div style={{ display: "flex", justifyContent: "space-between" }}>
              <>
                {data.is_anime !== true ? <> S {data.my_season}</> : null}
                <> E {data.my_episode}</>
              </>
              <Button icon={<EditOutlined />} size="small" onClick={() => setEpisodeEditMode(data.key)}></Button>
            </div>
          }

          <Tooltip title={Number.parseFloat(percent).toFixed(0) + "% " + data.my_episode + "/" + data.details.number_of_episodes + " Episodes"}>
            <Progress style={{ width: "100%" }} format={percent === 100 ? () => <CheckOutlined /> : () => ""} size="small" percent={percent} />
          </Tooltip>
        </div> : <CheckCircleTwoTone twoToneColor="#52c41a" />
        }
      </>
    }
  }

  // {
  //   title: 'Edit',
  //   render: (data) => {
  //     return <Button
  //       // type="link"
  //       type="primary"
  //       onClick={() => onRate(data)}
  //       style={{ marginLeft: "10px" }}
  //       icon={<EditOutlined />}
  //     />
  //   }
  // },

  const upcoming_release = {
    title: 'Date',
    dataIndex: 'upcoming_release',
    defaultSortOrder: 'descend',
    sorter: (a, b) => new Date(b.upcoming_release) - new Date(a.upcoming_release),
    render: (upcoming_release) => {
      const date = new Date(upcoming_release)
      return <div>{date.toLocaleDateString('en-US', { dateStyle: "medium", })}</div>
    }
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
    view
  ];

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

  const upcomingColumns = [
    upcoming_release,
    poster,
    title,
    // next_episode,
    type,
    genres,
  ];

  // --------- tabs ----------------------------------------------------------------------
  const tabItems = [
    {
      key: '1',
      label: (
        <span style={{ display: "flex", alignItems: "center" }}>
          <CheckOutlined style={{ marginRight: "7px" }} />
          <div>Seen</div>
        </span>
      ),
      children: <MovieTable
        pagination={{ position: ["bottomCenter"], showSizeChanger: true, }}
        header={seen.length + " Items"}
        onRemove={() => onRemove(true, "seen")}
        onMove={() => onMove("watchlist")}
        disableButtons={disableButtons}
        movieColumns={seenColumns}
        movies={seen.reverse()}
        rowSelection={rowSelection}
        showMove={true}
        moveKeyword={"Watchlist"}
        showRemove={true}
      />,
    },
    {
      key: '2',
      label: (
        <span style={{ display: "flex", alignItems: "center" }}>
          <FaRegBookmark />
          <div style={{ marginLeft: "6px" }}>Watchlist</div>
        </span>
      ),
      children: <MovieTable
        pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
        header={watchlist.length + " Items"}
        onRemove={() => onRemove(true, "watchlist")}
        onMove={() => onMove("seen")}
        disableButtons={disableButtons}
        movieColumns={watchlistColumns}
        movies={watchlist.reverse()}
        rowSelection={rowSelection}
        showMove={true}
        moveKeyword={"Seen"}
        showRemove={true}
      />,
    },
    {
      key: '3',
      label: (
        <span style={{ display: "flex", alignItems: "center" }}>
          <RiseOutlined />
          <div>Upcoming</div>
        </span>
      ),
      children:
        <div>
          {/* sort by this for movie (new Date(o.release_date) > new Date()) */}
          {/* for tv: details.next_episode_to_air !== null */}
          <MovieTable
            pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
            header={
              <div style={{ display: "flex", alignItems: "center" }}>
                <div>Your Upcoming Movies / Shows</div>
                <Popover trigger="click" content={"Generated from items you have added to your watchlist. Only displays items which haven't came out yet."} >
                  <QuestionCircleOutlined style={{ fontSize: "13px", color: "grey", margin: "6px 0px 0px 10px" }} />
                </Popover>
              </div>
            }
            onRemove={() => { }}
            disableButtons={disableButtons}
            movieColumns={upcomingColumns}
            movies={upcoming}
            rowSelection={false}
          />

          <h2>Trending Movies</h2>
          <Grid>
            {trending.slice(0, 10).map((o) =>
              <Card
                key={o.id}
                addToSeen={() => addMedia(o, 1, "seen")}
                addToWatchlist={() => addMedia(o, 1, "watchlist")}
                title={o.media_type === "movie" ? o.title : o.name}
                src={"https://image.tmdb.org/t/p/original/" + o.poster_path}
                alt={o.id}
                height={300}
                width={200}
                url={"https://www.themoviedb.org/" + o.media_type + "/" + o.id}
              />
            )}
          </Grid>
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
            {viewMoreTrending === false ? <Button style={{ marginTop: "10px" }} type="primary" onClick={() => setViewMoreTrending(true)}>Load More</Button> : null}
          </div>
          <Grid>
            {viewMoreTrending ? trending.slice(10).map((o) =>
              <Card
                key={o.id}
                addToSeen={() => addMedia(o, 1, "seen")}
                addToWatchlist={() => addMedia(o, 1, "watchlist")}
                title={o.media_type === "movie" ? o.title : o.name}
                src={"https://image.tmdb.org/t/p/original/" + o.poster_path}
                alt={o.id}
                height={300}
                width={200}
                url={"https://www.themoviedb.org/" + o.media_type + "/" + o.id}
              />)
              : null}
          </Grid>
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
            {viewMoreTrending === true ? <Button style={{ marginTop: "10px" }} type="primary" onClick={() => setViewMoreTrending(false)}>Load Less</Button> : null}
          </div>
        </div >
    },
  ];

  return (
    <>
      {contextHolder}
      <div style={{ padding: "20px 100px" }}>
        <Hero
          onSearch={onSearch}
          clearSearch={clearSearch}
          disableClear={disableClear}
        />
        <br />
        {search ?
          <>
            <Grid>
              {search.slice(0, 5).map((o) =>
                <Card
                  key={o.id}
                  addToSeen={() => addMedia(o, 1, "seen")}
                  addToWatchlist={() => addMedia(o, 1, "watchlist")}
                  title={o.media_type === "movie" ? o.title : o.name}
                  src={"https://image.tmdb.org/t/p/original/" + o.poster_path}
                  alt={o.id}
                  height={300}
                  width={200}
                  url={"https://www.themoviedb.org/" + o.media_type + "/" + o.id}
                />
              )}
            </Grid>
            <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
              {viewMoreSearch === false && disableClear === false ? <Button type="primary" style={{ marginTop: "10px" }} onClick={() => setViewMoreSearch(true)}>Load More</Button> : null}
            </div>
            <Grid>
              {viewMoreSearch ? search.slice(5).map((o) =>
                <Card
                  key={o.id}
                  addToSeen={() => addMedia(o, 1, "seen")}
                  addToWatchlist={() => addMedia(o, 1, "watchlist")}
                  title={o.media_type === "movie" ? o.title : o.name}
                  src={"https://image.tmdb.org/t/p/original/" + o.poster_path}
                  alt={o.id}
                  height={300}
                  width={200}
                  url={"https://www.themoviedb.org/" + o.media_type + "/" + o.id}
                />)
                : null}
            </Grid>
            <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
              {viewMoreSearch === true && disableClear === false ? <Button style={{ marginTop: "10px" }} type="primary" onClick={() => setViewMoreSearch(false)}>Load Less</Button> : null}
            </div>
          </> : null}
        <br />
        <br />
        <Tabs rootClassName="tabClass" defaultActiveKey="1" items={tabItems} size={"large"} centered />
      </div>

      <Footer>
        <>JOSREN ©2023 | Created using data from</>
        <Image height="20" width="66" quality="75" src={"tmdb.svg"} alt={"tmdb"} style={{ marginLeft: "7px" }} />
      </Footer>
    </>
  );
}
