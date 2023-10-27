"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { message, Input, Button, InputNumber, Space, Tooltip, Progress, Popover, Select, Divider } from 'antd';
import { StarTwoTone, StarOutlined, SearchOutlined, CheckOutlined, EditOutlined, QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { tabs } from "../../data.js"
import MovieTable from "../../comps/MovieTable.js"
import Card from "../../comps/Card.js"
import Hero from "../../comps/Hero.js"
import { getTodaysDate, checkType } from "../../functions.js"
import styled from "styled-components";
import { useMediaQuery } from 'react-responsive'
import Footer from "../../comps/Footer.js"
import { poster, date_added, release_date, audience_rating, type, episode, upcoming_release, genres, view } from "../../columns.js"
import app from "./firebase.js"
import { collection, getDocs } from "firebase/firestore";
import {firestore, firebaseApp} from './firebase.js'

// --- NOTES --- 
// find a way to update the data for your items as next episodes dont update localstorage dynamically
// make view more, more stylish
// clear selection button for tables
// feedback when no results for search
// refresh button to upcoming
// screen if something goes wrong, tell them to delete their localstorage
// a statistics tab, showing what is your prefered genres, average rating, what decade movies you like most, etc
// in the future have a view button to expand and see all the details of the show. possibly a new page or maybe just accordian
// columns, tabs, and functions should each be in their own files
// make progress look better displaying
// hide edit button unless hoivered
// hide hero when search.
// maybe add the acordian to see more details in taABle
// download button for data
// upload button for restoring data
// upcoming could include shows which are in a group like marvel with upcoming shows also in it
// perhaps we could follow "interests" (which will actually be the groups) and any group with shows coming up can be included as well. could also be actors that you can follow.
// add more details when hovering on cards
// add a filter to only show shows with incomplete progress (not s1 e1 tho)
// movie favorites. heart icon to indicate.\
// toggle a setting to allow anime to hvae seasons
// add a s block to upcoming shows
// if an upcomings episode title starts with episode, hide it
// hide certain upcoming items
// ability to share your watchlist with friends

// export / import movie data
// allow audience rating sort (watchlist)
// add a "times seen" column with plus and minuses
// if on mobile display:"please use on a device with bigger display (ipad, or computer)"
// hover over search item to view details
// upcoming episode title not updating whenm clicking refrsesh button
// use (redux) to organize your calls / functions outside of this main page
// make components
// make a view all details mode where it scrolls horizontally with all columns

const Body = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 10px;
`;

const Tabbar = styled.div`
  background: #001529;
  color: #bbc0c4;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  font-size: 11pt;
  border-bottom: 2px solid #001529;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
`;

const Tab = styled.div`
  padding:0px 10px;
  display: flex;
  height:60px;
  align-items: center;
  cursor:pointer;
  &:hover{
    color:white;
  }
  > * {
    margin:5px;
  }
    ${({ active }) => active &&
    `
    border-bottom: 2px solid white;
    opacity: 1;
    color:white;
  `}
  `

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
  const [page, setPage] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const [viewMoreSearch, setViewMoreSearch] = useState(false);
  const [viewMoreTrending, setViewMoreTrending] = useState(false);
  const [progressEditMode, setProgressEditMode] = useState();
  const [ratingEditMode, setRatingEditMode] = useState();
  const [epOptions, setEpOptions] = useState([]);
  const [seOptions, setSeOptions] = useState([]);
  const [seValue, setSeValue] = useState(null);
  const [epValue, setEpValue] = useState(null);
  const [ratingValue, setRatingValue] = useState(null);
  const isWide = useMediaQuery({ query: '(max-width: 1300px)' })
  const isVeryWide = useMediaQuery({ query: '(max-width: 1600px)' })
  const [active, setActive] = useState(0);

  const [loading, setLoading] = useState(true);
  const [testMedia, setTestMedia] = useState([]);






  console.log(active)
  console.log("MEDIA", media)
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

  const onAdd = async (o, method, lType, changes) => {
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

      let list_type = lType;

      // get details
      let details = []
      if (method === 1) {
        const response = await fetch("https://api.themoviedb.org/3/" + o.media_type + "/" + key + "?language=en-US", options);
        details = await response.json();
      } else {
        details = o.details
      }

      // these values change when editing
      let my_season = 1;
      let my_episode = 1;
      let my_rating = 0;
      let upcoming_release = (o.media_type === "movie" ? details.release_date : (details.next_episode_to_air !== null ? details.next_episode_to_air.air_date : details.last_air_date))
      if (method === 2) {
        my_season = o.my_season;
        my_episode = o.my_episode;
        my_rating = o.my_rating;
        upcoming_release = o.upcoming_release;
      } else if (method === 3) {
        my_season = changes.my_season !== null ? changes.my_season : o.my_season;
        my_episode = changes.my_episode !== null ? changes.my_episode : o.my_episode;
        my_rating = changes.my_rating !== null ? changes.my_rating : o.my_rating;
        upcoming_release = changes.upcoming_release !== undefined ? changes.upcoming_release : o.upcoming_release;
      }

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
      let localUpcoming = ""
      if (JSON.parse(localStorage.getItem("media")) !== null) {
        localMedia = JSON.parse(localStorage.getItem("media"))
        localSeen = localMedia.filter((o) => checkType(o, 1))
        localWatchlist = localMedia.filter((o) => checkType(o, 2))
        localUpcoming = localMedia.filter((o) => new Date(o.upcoming_release) > new Date(new Date().setDate(new Date().getDate() - 7)))
      }
      if (method === 1) {
        lType === "seen" ? setSeen(localMedia !== "" ? [...localSeen, obj] : [obj]) : setWatchlist(localMedia !== "" ? [...localWatchlist, obj] : [obj])
        setMedia(localMedia !== "" ? [...localMedia, obj] : [obj])
        localStorage.setItem("media", JSON.stringify([...localMedia, obj]))
        if (new Date(upcoming_release) > new Date(new Date().setDate(new Date().getDate() - 7))) {
          setUpcoming(localUpcoming !== "" ? [...localUpcoming, obj] : [obj]);
        }
        onMessage("Added " + title + ' to ' + lType, 'success')
      } else {
        lType === "seen" ? setSeen([...localSeen, obj]) : setWatchlist([...localWatchlist, obj])
        setMedia([...localMedia, obj]);
        localStorage.setItem("media", JSON.stringify([...localMedia, obj]))
        if (changes) {
          if (changes.new_upcoming !== undefined) {
            setUpcoming([localUpcoming, obj]);
          }
        }
      }
    }
  };

  const onMove = (lType) => {
    // lType = the list destination
    // remove item, read it with list_type changed
    selected.forEach((i) => {
      let data = media.find((e) => e.key == i)
      onAdd(data, 2, lType)
    })
    onRemove(lType, 2)
    onMessage("Moved " + selected.length + ' items to ' + lType, 'success')
  };

  const onUpdate = (data, new_upcoming) => {
    let changes = {
      my_season: seValue,
      my_episode: epValue,
      my_rating: ratingValue,
      upcoming_release: new_upcoming
    }
    // if at least one value is changed, update items data
    if (seValue !== null || epValue !== null || ratingValue !== null || new_upcoming !== undefined) {
      onAdd(data, 3, data.list_type, changes)
      onRemove(data.list_type, 3, data.key)
    } else {
      console.log("no changes")
    }
    setNull()
  }

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

  const onRemove = (lType, method, key) => {
    // method 1 = pressing remove button directly. method 2 = onMove. method 3 = onUpdate.
    let filtered = ""
    if (method !== 3) {
      // filter out all "selected" items
      filtered = JSON.parse(localStorage.getItem("media")).filter(item => !selected.includes(item.key))
    } else {
      filtered = JSON.parse(localStorage.getItem("media")).filter(item => item.key !== key)
    }
    if (method === 2) {
      let addition = JSON.parse(localStorage.getItem("media")).filter(item => selected.includes(item.key) && item.list_type === lType)
      filtered = filtered.concat(addition)
    } else if (method === 3) {
      let addition = JSON.parse(localStorage.getItem("media")).filter(item => item.key === key)
      filtered = filtered.concat(addition[1])
    }
    setSeen(filtered.filter((o) => checkType(o, 1)))
    setWatchlist(filtered.filter((o) => checkType(o, 2)))
    setUpcoming(filtered.filter((o) => new Date(o.upcoming_release) > new Date(new Date().setDate(new Date().getDate() - 7))));
    setMedia(filtered)
    localStorage.setItem("media", JSON.stringify(filtered));
    method === 1 ? onMessage('Successfully Removed ' + selected.length + ' Items', 'success') : null;
    setDisableButtons(true);
  };

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
              <Button icon={<CheckOutlined />} size="small" onClick={() => { setRatingEditMode(false); onUpdate(data); }} />
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

  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

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
                <Button icon={<CheckOutlined />} size="small" onClick={() => { setProgressEditMode(false); onUpdate(data); }}></Button>
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

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
    },
  };

  async function getFirebaseData() {
    setLoading(false)
    const usersCollection = collection(firestore, "media");
    const querySnapshot = await getDocs(usersCollection);
    const usersArray = [];

    querySnapshot.forEach((doc) => {
      // Access the document data and add it to the array
      usersArray.push(doc.data());
    });
  
    setTestMedia(usersArray)
  }
  

  useEffect(() => {
    getFirebaseData();
    // const localMedia = JSON.parse(localStorage.getItem("media"));
    // if (localMedia) {
    //   setMedia(localMedia);
    //   setSeen(localMedia.filter((o) => checkType(o, 1)));
    //   setWatchlist(localMedia.filter((o) => checkType(o, 2)));
    //   // get shows whcih are coming out starting from the last week -> future
    //   setUpcoming(localMedia.filter((o) => new Date(o.upcoming_release) > new Date(new Date().setDate(new Date().getDate() - 7))));
    // }
    // // fetch top movies
    // async function fetchData() {
    //   const response = await fetch("https://api.themoviedb.org/3/trending/all/day?language=en-US", options);
    //   const json = await response.json();
    //   let temp = json.results
    //   temp.forEach((item, index) => {
    //     item.key = index + 1;
    //   })
    //   setTrending(temp)
    // }
    // fetchData();
  }, []);
  
  console.log(loading)
  console.log(testMedia)

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
    episode,
    type,
    genres,
  ];

  // if loading
  if (loading) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      margin: 0,
    }}>
      <h1 style={{
        textAlign: 'center',
        fontSize: '36px',
        color: 'blue',
      }}>Loading</h1>
    </div>
  }

  return (
    <div>
      {testMedia.map((item) => {console.log(item.title),
        <div key={item.title}>
          
            <div>{item.title} 1</div>
            <div>2</div>
        </div>
      })
      }
      <div>hello</div>
    </div>
    // <Body>
    //   {contextHolder}
    //   <Tabbar>
    //     {tabs.map(o => (
    //       <Tab
    //         onClick={() => setActive(o.id)}
    //         key={o.id}
    //       >
    //         {o.icon}
    //         {o.name}
    //       </Tab>
    //     ))}
    //   </Tabbar>
    //   <div style={isWide ? { margin: "0px 50px", flex: 1 } : isVeryWide ? { margin: "0px 10vw", flex: 1 } : { margin: "0px 15vw", flex: 1 }}>

    //     {/* 0 */}
    //     {active === 0 ?
    //       <>
    //         <Hero
    //           onSearch={onSearch}
    //           clearSearch={clearSearch}
    //           disableClear={disableClear}
    //         />
    //         <br />
    //         {search ?
    //           <>
    //             <Grid>
    //               {search.map((o) =>
    //                 <Card
    //                   key={o.id}
    //                   addToSeen={() => onAdd(o, 1, "seen")}
    //                   addToWatchlist={() => onAdd(o, 1, "watchlist")}
    //                   title={o.media_type === "movie" ? o.title : o.name}
    //                   src={"https://image.tmdb.org/t/p/original/" + o.poster_path}
    //                   alt={o.id}
    //                   height={300}
    //                   width={200}
    //                   url={"https://www.themoviedb.org/" + o.media_type + "/" + o.id}
    //                 />
    //               )}
    //             </Grid>
    //             <Divider />
    //           </> : <></>}
    //         <h2 style={{}}>Trending Shows</h2>
    //         <Grid>
    //           {trending.slice(0, 10).map((o) =>
    //             <Card
    //               key={o.id}
    //               addToSeen={() => onAdd(o, 1, "seen")}
    //               addToWatchlist={() => onAdd(o, 1, "watchlist")}
    //               title={o.media_type === "movie" ? o.title : o.name}
    //               src={"https://image.tmdb.org/t/p/original/" + o.poster_path}
    //               alt={o.id}
    //               height={300}
    //               width={200}
    //               url={"https://www.themoviedb.org/" + o.media_type + "/" + o.id}
    //             />
    //           )}
    //         </Grid>
    //         <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
    //           {viewMoreTrending === false ? <Button style={{ marginTop: "10px" }} type="primary" onClick={() => setViewMoreTrending(true)}>Load More</Button> : null}
    //         </div>
    //         <Grid>
    //           {viewMoreTrending ? trending.slice(10).map((o) =>
    //             <Card
    //               key={o.id}
    //               addToSeen={() => onAdd(o, 1, "seen")}
    //               addToWatchlist={() => onAdd(o, 1, "watchlist")}
    //               title={o.media_type === "movie" ? o.title : o.name}
    //               src={"https://image.tmdb.org/t/p/original/" + o.poster_path}
    //               alt={o.id}
    //               height={300}
    //               width={200}
    //               url={"https://www.themoviedb.org/" + o.media_type + "/" + o.id}
    //             />)
    //             : null}
    //         </Grid>
    //         <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
    //           {viewMoreTrending === true ? <Button style={{ marginTop: "10px" }} type="primary" onClick={() => setViewMoreTrending(false)}>Load Less</Button> : null}
    //         </div>
    //       </>
    //       : <></>}

    //     {active === 1 ?
    //       <MovieTable
    //         pagination={{ position: ["bottomCenter"], showSizeChanger: true, }}
    //         header={"Seen | " + seen.length + " Items"}
    //         onRemove={() => onRemove("seen", 1)}
    //         onMove={() => onMove("watchlist")}
    //         disableButtons={disableButtons}
    //         movieColumns={seenColumns}
    //         movies={seen.reverse()}
    //         rowSelection={rowSelection}
    //         showMove={true}
    //         moveKeyword={"Watchlist"}
    //         showRemove={true}
    //       />
    //       : <></>}

    //     {active === 2 ?
    //       <MovieTable
    //         pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
    //         header={"Watchlist | " + watchlist.length + " Items"}
    //         onRemove={() => onRemove("watchlist", 1)}
    //         onMove={() => onMove("seen")}
    //         disableButtons={disableButtons}
    //         movieColumns={watchlistColumns}
    //         movies={watchlist.reverse()}
    //         rowSelection={rowSelection}
    //         showMove={true}
    //         moveKeyword={"Seen"}
    //         showRemove={true}
    //       />
    //       : <></>}
    //     {active === 3 ?
    //       <div>
    //         {/* sort by this for movie (new Date(o.release_date) > new Date()) */}
    //         {/* for tv: details.next_episode_to_air !== null */}
    //         <MovieTable
    //           showRefresh
    //           onRefresh={() => {
    //             refreshUpdate();
    //           }}
    //           pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
    //           header={
    //             <div style={{ display: "flex", alignItems: "center" }}>
    //               <div>Your Upcoming Shows</div>
    //               <Popover trigger="click" content={"Generated from items you have added to your Seen & Watchlists. Displays items which are coming out soon."} >
    //                 <QuestionCircleOutlined style={{ fontSize: "13px", color: "grey", margin: "6px 0px 0px 10px" }} />
    //               </Popover>
    //             </div>
    //           }
    //           disableButtons={disableButtons}
    //           movieColumns={upcomingColumns}
    //           movies={upcoming}
    //           rowSelection={false}
    //         />
    //       </div >
    //       : <></>}
    //     {active === 4 ?
    //       <div style={{ marginTop: "100px" }}>
    //         Stats
    //       </div >
    //       : <></>}
    //   </div>
    //   <Footer />
    // </Body >
  );
}
