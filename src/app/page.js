"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Layout, Table, message, Input, Button, Tag, Carousel } from 'antd';
const { Search } = Input;
import { StarTwoTone, HeartOutlined, PlusOutlined } from '@ant-design/icons';
const { Header, Content, Footer } = Layout;

// option to rate movies in your list
// toggle for list / grid view
// tab for (watched, to watch, favs)
// *add* movie button which changes to *added* once clicked
// prevent from adding an already added
// tv show what episode you are on
// top tab bar
// search titles from my movies
// suycces message when adding movies
// add breakpoints for grid 
// skeleton for grid when searching



const onChange = (pagination, filters, sorter, extra) => {
  console.log('params', pagination, filters, sorter, extra);
};
const ImageLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`
}

const movieColumns = [
  {
    title: 'Poster',
    dataIndex: 'poster',
    render: (poster, title) => <Image
      loader={ImageLoader}
      src={poster}
      width={50}
      height={75}
      style={{ objectFit: "cover" }}
      alt={title}
    />,
  },
  {
    title: 'Title',
    dataIndex: 'title',
  },
  {
    title: 'Audience Rating',
    dataIndex: 'audience_rating',
    sorter: (a, b) => a.audience_rating - b.audience_rating,
    // render: (audience_rating) => <Rate disabled defaultValue={audience_rating} count={10}/>
    render: (audience_rating) => <>
      <StarTwoTone twoToneColor="#fadb14" />
      <> </>
      {Number.parseFloat(audience_rating).toFixed(1)}
    </>
  },
  {
    title: 'Release Date',
    dataIndex: 'release_date',
    sorter: (a, b) => new Date(b.release_date) - new Date(a.release_date),
    render: (release_date) => {
      const date = new Date(release_date)
      return <>{date.toLocaleDateString('en-US', { dateStyle: "medium", })}</>
    },
  },
  {
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
      let color = "green"
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
  },
  // {
  //   title: 'Status',
  //   dataIndex: 'status',
  // },
  // {
  //   title: 'Current Progress',
  //   dataIndex: 'current_progress',
  // }
];

export default function Home() {
  const fetch = require("node-fetch");
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showClear, setShowClear] = useState(true);
  const [popularMovies, setPopularMovies] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  console.log(popularMovies)

  const onSuccess = (message) => {
    messageApi.open({
      type: 'success',
      content: message,
    });
  };

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
    },
  };

  const onSearch = (value) => {
    fetch("https://api.themoviedb.org/3/search/multi?&language=en-US&query=" + value + "&page=1&include_adult=false", options)
      .then((res) => res.json())
      .then((json) => setSearch(json))
      .catch((err) => console.error("error:" + err));
    setShowClear(false)
  };

  const clearSearch = () => {
    setSearch([])
    setShowClear(true)
    // onSuccess('Cleared Search Results');
  };

  const onRemove = () => {
    setMovies(movies.filter(item => !selected.includes(item.key)));
    localStorage.setItem("movies", JSON.stringify(movies.filter(item => !selected.includes(item.key))));
    onSuccess('Successfully Removed ' + selected.length + ' Movies');
  };

  // const url = "https://api.themoviedb.org/3/find/tt14998742?external_source=imdb_id";

  const contentStyle = {
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
  };

  useEffect(() => {
    const localMovies = JSON.parse(localStorage.getItem("movies"));
    if (localMovies) {
      setMovies(localMovies);
    }

    // fetch top movies
    fetch("https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc", options)
      .then((res) => res.json())
      .then((json) => setPopularMovies(json))
      .catch((err) => console.error("error:" + err));
  }, []);

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setSelected(selectedRowKeys)
    }
  };

  return (
    <>
      {contextHolder}
      {popularMovies.results ? <Carousel 
      // autoplay
      >
        {popularMovies.results.map((o) =>
          <div style={{position:"relative", objectFit: 'cover'}}>
            {/* <Image quality="100" 
            // fill={true} 
            height={200}
            width={900}
            style={{objectFit:"cover"}}
            src={"https://image.tmdb.org/t/p/original" + o.backdrop_path} alt={o.title} /> */}
            <h3 style={contentStyle}>{o.title}</h3>
          </div>
        )}
      </Carousel> : <></>}
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
          disabled={showClear}
        >
          Clear Results
        </Button>
      </div>

      {search.results ? (

        <div style={{
          // display: "flex", flexWrap: 'wrap', gap: '20px'
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          // gridTemplateRows: "repeat(2, 1fr)",
          gridColumnGap: "10px",
          gridRowGap: "10px",
          margin: "20px 0px"
        }}>
          {/* only show movies with posters && not an actor in search results */}
          {search.results.map((o) => o.media_type !== "people" && o.poster_path ?
            <div style={{ border: "1px solid red", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <Image height="200" width="125" quality="100" src={"https://image.tmdb.org/t/p/original/" + o.poster_path} alt={o.title} />
              <div >{o.media_type === "movie" ? o.title : o.name}</div>
              <div>
                <Button type="default"
                  onClick={() => {
                    // make anime type if original lang is japanese
                    let type = o.original_language === "ja" ? "anime" : o.media_type;
                    // if tv or movie some fields will be different (title, release date)
                    let release = o.media_type === "movie" ? o.release_date : o.first_air_date;
                    let title = o.media_type === "movie" ? o.title : o.name;

                    setMovies([...movies, { key: o.id, title: title, poster: "https://image.tmdb.org/t/p/original/" + o.poster_path, audience_rating: o.vote_average, release_date: release, media_type: type }]);
                    localStorage.setItem("movies", JSON.stringify([...movies, { key: o.id, title: title, poster: "https://image.tmdb.org/t/p/original/" + o.poster_path, audience_rating: o.vote_average, release_date: release, media_type: type }]));
                    onSuccess('Added ' + title + ' to My Movies');
                  }}
                >Add to List</Button>
                <Button type="default" shape="circle" icon={<HeartOutlined />} />
                {/* <Button type="primary" shape="circle" icon={<HeartOutlined />} /> */}
              </div>
            </div>
            : <div key={o.id}></div>)}
        </div >
      ) : (
        <></>
      )
      }
      <br />
      <br />
      <br />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2>My Movies List</h2>
        <Button
          type="primary"
          danger
          onClick={onRemove}
        // disabled
        >
          Remove Selected
        </Button>
      </div>

      <Table
        style={{ border: '1px solid #ede9e8', borderRadius: "6px" }}
        // bordered
        columns={movieColumns}
        dataSource={movies}
        // onChange={onChange}
        pagination={{ position: ["bottomCenter"], showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100] }}
        rowSelection={rowSelection}
        tableLayout={"auto"}
      />
    </>
  );
}
