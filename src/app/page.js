"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { message, Input, Button, Tag, Tabs, InputNumber, Space, Tooltip, Skeleton, Progress } from 'antd';
const { Search } = Input;
import { StarTwoTone, StarOutlined, EyeOutlined, SearchOutlined, CheckOutlined, RiseOutlined, EditOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { FaRegBookmark } from "react-icons/fa6";
import Highlighter from 'react-highlight-words';
import { genreCodes } from "../../public/genres.js"
import MovieTable from "../../comps/MovieTable.js"
import Card from "../../comps/Card.js"

// option to rate movies in your list
// toggle for list / grid view
// *add* movie button which changes to *added* once clicked
// prevent from adding an already added
// add breakpoints for grid 
// skeleton for grid when searching
// hide poster button
// editable cells? (in table component ant design)
// make title filter inline with column name
// shopw more button for searched movies... (limit search to 10 initally and show more if clicked)
// button for move to watchlist and vice versa (beside the remove button)
// undo button when removing movies
// move tab bar to top? change color to dark blue
// sort status by percentage complete
// upcoming tab which features new seasons of shows in your lists
// tv show what episode you are on
// add a count of how many movies are in each tab 
// add a functions page to clear up this page
// open a modal for rating series?
// make trending movies a grid instead....? maybe 
// bug with search again... blanks are showing
// have aguide for first time user that shows how upcoming works - set a const to true in localstorage if they have clicked it already (Tour comp)

// bugs for tomorow :(
// when switching tabs set make selections go to null --- IMPORTANT BUG TO FIX
// only 1 item is moved when selectiong multiple

export default function Home() {
  const fetch = require("node-fetch");
  const [seen, setSeen] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [search, setSearch] = useState([]);
  const [selected, setSelected] = useState([]);
  const [disableClear, setDisableClear] = useState(true);
  const [disableButtons, setDisableButtons] = useState(true);
  const [loaded, setLoaded] = useState(true);
  const [page, setPage] = useState(1);
  const [popularMovies, setPopularMovies] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  console.log(seen, "SEEN")

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

  const onSuccess = (message) => {
    messageApi.open({
      type: 'success',
      content: message,
    });
  };

  const onSearch = (value) => {
    fetch("https://api.themoviedb.org/3/search/multi?&language=en-US&query=" + value + "&page=1&include_adult=false", options)
      .then((res) => res.json())
      .then((json) => setSearch(json))
      .catch((err) => console.error("error:" + err));
    setDisableClear(false)
  };

  const clearSearch = () => {
    setSearch([])
    setDisableClear(true)
    // onSuccess('Cleared Search Results');
  };

  const onRate = (data) => {
    console.log("RATED!", data)
    // onSuccess('Cleared Search Results');
  };

  const onRemove = (showSuccess, rmType) => {
    if (rmType === 1) {
      setSeen(seen.filter(item => !selected.includes(item.key)));
      localStorage.setItem("seen", JSON.stringify(seen.filter(item => !selected.includes(item.key))));
      { showSuccess === true ? onSuccess('Successfully Removed ' + selected.length + ' Movies') : null }
      setDisableButtons(true)
    } else {
      setWatchlist(watchlist.filter(item => !selected.includes(item.key)));
      localStorage.setItem("watchlist", JSON.stringify(watchlist.filter(item => !selected.includes(item.key))));
      { showSuccess === true ? onSuccess('Successfully Removed ' + selected.length + ' Movies') : null }
      setDisableButtons(true)
    }
  };

  const addMedia = async (o, method, listType) => {
    // method 1 = creating, method 2 = swapping to watchlist
    // type = anime, if original lang is japanese
    let key = method === 1 ? o.id : o.key;
    let title = method === 1 ? (o.media_type === "movie" ? o.title : o.name) : o.title;
    let release = method === 1 ? (o.media_type === "movie" ? o.release_date : o.first_air_date) : o.release_date;
    let type = method === 1 ? (o.original_language === "ja" ? "anime" : o.media_type) : o.media_type;
    let my_season = method === 1 ? "1" : o.my_season;
    let my_episode = method === 1 ? "1" : o.my_episode;
    let my_rating = method === 1 ? "unrated" : o.my_rating;
    let og_mtype = method === 1 ? o.media_type : o.og_mtype;

    // get details
    let details = []
    if (method === 1) {
      const response = await fetch("https://api.themoviedb.org/3/" + og_mtype + "/" + key + "?language=en-US", options);
      details = await response.json();
    } else {
      details = o.details
    }

    let obj = {
      key: key,
      title: title,
      release_date: release,
      media_type: type,
      my_season: my_season,
      my_episode: my_episode,
      my_rating: my_rating,
      og_mtype: og_mtype,
      details: details
    }

    if (listType === "seen") {
      setSeen([...seen, obj]);
      localStorage.setItem("seen", JSON.stringify([...seen, obj]));
      let verb = method === 1 ? "Added " : "Moved "
      onSuccess(verb + title + ' to Seen');
    } else if (listType === "watchlist") {
      setWatchlist([...watchlist, obj]);
      localStorage.setItem("watchlist", JSON.stringify([...watchlist, obj]));
      let verb = method === 1 ? "Added " : "Moved "
      onSuccess(verb + title + ' to Watchlist');
    }
  };

  const onMove = (num) => {
    // if already in watchlist num = 1. seen num = 0
    num === 0 ? (
      console.log("moved to watchlist", selected),
      selected.forEach((i) => {
        let data = seen.find((e) => e.key == i)
        addMedia(data, 2, "watchlist")
      }),
      onRemove(false, 1)
    ) : (
      console.log("moved to seen", selected),
      selected.forEach((i) => {
        let data = watchlist.find((e) => e.key == i)
        addMedia(data, 2, "seen")
      }),
      onRemove(false, 2)
    )
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setSelected(selectedRowKeys)
      selectedRows.length !== 0 ? setDisableButtons(false) : setDisableButtons(true)
    }
  };

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
    },
  };

  useEffect(() => {
    const localSeen = JSON.parse(localStorage.getItem("seen"));
    const localWatchlist = JSON.parse(localStorage.getItem("watchlist"));
    if (localSeen) {
      setSeen(localSeen);
    }
    if (localWatchlist) {
      setWatchlist(localWatchlist);
    }

    // fetch top movies
    async function fetchData() {
      const response = await fetch("https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc", options);
      const details = await response.json();
      let temp = details.results
      temp.forEach((item, index) => item.key = index + 1)
      setPopularMovies(temp)
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

  const release_date = {
    title: 'Release Date',
    dataIndex: 'release_date',
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
      return my_rating !== "unrated" ? <>
        <StarTwoTone twoToneColor="#fadb14" />
        <> </>
        {Number.parseFloat(my_rating).toFixed(1)}
      </> : <>
        <StarOutlined />
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

  const type = {
    title: 'Type',
    dataIndex: 'media_type',
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
    render: (media_type) => {
      let color = ""
      if (media_type === "anime") {
        color = "geekblue"
      } else if (media_type === "tv") {
        color = "green"
      } else {
        color = "volcano"
      }
      return (
        <Tag color={color}>
          {media_type.toUpperCase()}
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
          <div key={index} style={{ marginRight: "3px", cursor: "default", border: "1px solid #d9d9d9", width: "22px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", borderRadius: "5px" }}>
            <Tooltip title={i}>
              {emojiArr[index]}
            </Tooltip>
          </div>
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
      }
      if (data.details.next_episode_to_air === null) {
        date = "Finished"
      } else {
        temp = new Date(data.details.next_episode_to_air.air_date)
        date = temp.toLocaleDateString('en-US', { dateStyle: "medium", })
      }
      return <div>{date}</div>
    }
  }

  const progress = {
    title: 'Progress',
    render: (data) => {
      let percent = 0
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
          {/* if u want to get really technical, find how many episodes are in a specific season */}
          {/* include an edit buitton to edit this data */}
          {/* have an option for Completed */}
          {/* if its an ANIME dont shoiw seasons */}
          {data.media_type !== "anime" ? <>
            <InputNumber min={1} addonBefore="S" size="small" defaultValue={data.my_season} onChange={
              (test) => {
                console.log(test)
              }
            } style={{ maxWidth: "70px" }} controls={false} />
            {/* <>S</>
            <>{data.my_season + "/" + data.details.number_of_seasons}</> */}
            <> - </>
          </> : null}
          {/* <>E</> */}
          <InputNumber min={1} addonBefore="E" size="small" defaultValue={data.my_episode}
            // onChange={onChange}
            style={{ maxWidth: "60px" }} controls={false} />
          {/* <>{data.my_episode + "/" + data.details.number_of_episodes}</> */}
          <Tooltip title={Number.parseFloat(percent).toFixed(0) + "%"}>
            <Progress format={percent === 100 ? () => <CheckOutlined /> : () => ""} size="small" percent={percent} />
          </Tooltip>
        </div> : <CheckCircleTwoTone twoToneColor="#52c41a" />}
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

  const seenColumns = [
    poster,
    title,
    release_date,
    my_rating,
    type,
    genres,
    progress,
  ];

  const watchlistColumns = [
    poster,
    title,
    release_date,
    next_episode,
    audience_rating,
    type,
    genres,
  ];

  const popMovColumns = [
    {
      title: 'Popularity',
      dataIndex: 'key',
    },
    {
      title: 'Poster',
      dataIndex: 'poster_path',
      render: (poster_path, title) => <Image
        src={"https://image.tmdb.org/t/p/original/" + poster_path}
        width={133}
        height={216}
        style={{ objectFit: "cover" }}
        alt={title}
      />,
    },
    title,
    release_date,
    {
      title: 'Audience Rating',
      dataIndex: 'vote_average',
      sorter: (a, b) => a.vote_average - b.vote_average,
      render: (vote_average) => <>
        <StarTwoTone twoToneColor="#fadb14" />
        <> </>
        {Number.parseFloat(vote_average).toFixed(1)}
      </>
    },
    {
      title: 'Genres',
      dataIndex: 'genre_ids',
      render: (genre_ids) => {
        let nameArr = []
        let emojiArr = []
        genre_ids.map((i) => {
          genreCodes.forEach(myFunction)
          function myFunction(i2) {
            if (i === i2.id) {
              nameArr.push(i2.name)
              emojiArr.push(i2.emoji)
            }
          }
        })
        return <div style={{ display: "flex" }}>
          {nameArr.map((i, index) =>
            <div key={index} style={{ marginRight: "3px", cursor: "default", border: "1px solid #d9d9d9", width: "22px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", borderRadius: "5px" }}>
              <Tooltip title={i}>
                {emojiArr[index]}
              </Tooltip>
            </div>
          )}
        </div>
      },
    },
    {
      title: 'Description',
      dataIndex: 'overview',
      width: "400px",
      render: (overview) => (
        // <Tooltip placement="topLeft" title={overview}>
        <div style={{
          //  display: '-webkit-box', textOverflow: "ellipsis", overflow: "hidden", WebkitLineClamp: "3"
        }}
        >{overview}</div>
        // </Tooltip>
      ),
    },
  ];

  const upcomingColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title'),
    },
  ];

  // --------- tabs ----------------------------------------------------------------------
  const tabItems = [
    {
      key: '1',
      label: (
        <span style={{ display: "flex", alignItems: "center" }}>
          <EyeOutlined style={{ marginRight: "7px" }} />
          <div>Seen</div>
        </span>
      ),
      children: <MovieTable
        pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
        header={seen.length + " Items"}
        onRemove={() => onRemove(true, 1)}
        onMove={() => onMove(0)}
        disableButtons={disableButtons}
        movieColumns={seenColumns}
        movies={seen}
        rowSelection={rowSelection}
        showMove={true}
        moveKeyword={"Watchlist"}
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
        onRemove={() => onRemove(true, 2)}
        onMove={() => onMove(1)}
        disableButtons={disableButtons}
        movieColumns={watchlistColumns}
        movies={watchlist}
        rowSelection={rowSelection}
        showMove={true}
        moveKeyword={"Seen"}
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
          {/* upcoming movies and shows */}
          <MovieTable
            pagination={{ position: ["bottomCenter"], showSizeChanger: true }}
            header={"Upcoming Movies/Shows"}
            onRemove={() => { }}
            disableButtons={disableButtons}
            movieColumns={upcomingColumns}
            // get upcoming data
            movies={popularMovies}
            rowSelection={false}
            onChange={(page) => { setPage(page.current) }}
            showRemove={false}
          />
          <MovieTable
            pagination={{ hideOnSinglePage: true, defaultPageSize: 20 }}
            header={"Trending Movies"}
            onRemove={() => { }}
            disableButtons={disableButtons}
            movieColumns={popMovColumns}
            movies={popularMovies}
            rowSelection={false}
            onChange={(page) => { setPage(page.current) }}
            showRemove={false}
          />
        </div>
      // tv shows which have seasons or episodes coming soon
      // a tracked tv show will be one in your watchlist or seen list
    },
  ];

  return (
    <>
      {contextHolder}
      <div style={{ padding: "20px 100px" }}>
        <h1>Search</h1>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Search
            size="large"
            placeholder="movie name"
            enterButton="Search"
            onSearch={onSearch}
          />
          <Button
            type="link"
            onClick={clearSearch}
            style={{ marginLeft: "10px", height: "40px" }}
            disabled={disableClear}
          >
            Clear Results
          </Button>
        </div>

        {search.results ?
          <div style={{
            // display: "flex", flexWrap: 'wrap', gap: '20px'
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            // gridTemplateRows: "repeat(2, 1fr)",
            gridColumnGap: "10px",
            gridRowGap: "10px",
            margin: "20px 0px"
          }}>
            {/* // only show movies with posters && not an actor in search results */}
            {search.results.map((o) =>
              o.media_type !== "people" && o.poster_path ?
                <Card
                  key={o.id}
                  addToSeen={() => addMedia(o, 1, "seen")}
                  addToWatchlist={() => addMedia(o, 1, "watchlist")}
                  title={o.media_type === "movie" ? o.title : o.name}
                  src={"https://image.tmdb.org/t/p/original/" + o.poster_path}
                  alt={o.id}
                />
                : <div key={o.id}></div>)}
          </div> : null}
        <br />
        <br />
        <br />
        <Tabs defaultActiveKey="1" items={tabItems} size={"large"} centered />
      </div>

      <div
        style={{
          marginTop: "75px",
          display: "flex",
          height: "75px",
          justifyContent: "center",
          alignItems: "center",
          // border: "1px dashed gray"
          // height: "58px",
          position: "relative",
          bottom: "-10px",
          background: "#fafafa",
          fontSize: "10pt"
        }}
      >
        <>JOSREN ©2023 | Created using data from</>

        <Image height="20" width="66" quality="75" src={"tmdb.svg"} alt={"tmdb"} style={{ marginLeft: "7px" }} />
      </div>
    </>
  );
}
