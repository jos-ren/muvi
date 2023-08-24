"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Button, Table, Tag } from 'antd';
import { StarTwoTone } from '@ant-design/icons';


// option to rate movies in your list
// component for displaying movies: one for list another more of a grid...
// toggle for list / grid view
// add skeleton while data loads
// have different options: watchlist, watched, (maybe tabs at top to switch between?)
// list column with (watched, to watch, favs)

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
    key: 'poster',
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
    key: 'title',
  },
  {
    title: 'Audience Rating',
    dataIndex: 'audience_rating',
    key: 'audience_rating',
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
    key: 'release_date',
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
];


export default function Home() {
  const [name, setName] = useState("");
  const [movies, setMovies] = useState([]);
  const [list, setList] = useState([]);
  const [search, setSearch] = useState([]);
  const fetch = require("node-fetch");

  // const url = "https://api.themoviedb.org/3/find/tt14998742?external_source=imdb_id";
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
    },
  };

  useEffect(() => {
    const localMovies = JSON.parse(localStorage.getItem("movies"));
    if (localMovies) {
      setMovies(localMovies);
    }

    // // fetch top movies
    // fetch("https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc", options)
    //   .then((res) => res.json())
    //   .then((json) => setList(json))
    //   .catch((err) => console.error("error:" + err));
  }, []);

  return (
    <>
      <h1>Search</h1>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button
        onClick={() => {
          fetch("https://api.themoviedb.org/3/search/multi?&language=en-US&query=" + name + "&page=1&include_adult=false", options)
            .then((res) => res.json())
            .then((json) => setSearch(json))
            .catch((err) => console.error("error:" + err));
        }}
      >
        Search Movies
      </button>
      {search.results ? (
        <div>
          {/* only show movies with images in search results */}
          {search.results.map((o) => o.media_type !== "people" && o.poster_path ?
            <div
              key={o.id}
              style={{
                display: "flex",
                width: "500px",
                justifyContent: "space-between",
                paddingBottom: "5px",
              }}>
              <Image height="100" width="66" quality="100" src={"https://image.tmdb.org/t/p/original/" + o.poster_path} alt={o.title} />
              {o.media_type === "movie" ? o.title : o.name}
              <button
                onClick={() => {
                  // make anime type if og lang is japanese
                  let type = o.original_language === "ja" ? "anime" : o.media_type;
                  // if tv or movie some fields will be different (title, release date)
                  let release = o.media_type === "movie" ? o.release_date : o.first_air_date;
                  let title = o.media_type === "movie" ? o.title : o.name;

                  setMovies([...movies, { id: o.id, title: title, poster: "https://image.tmdb.org/t/p/original/" + o.poster_path, audience_rating: o.vote_average, release_date: release, media_type: type }]);
                  localStorage.setItem("movies", JSON.stringify([...movies, { id: o.id, title: title, poster: "https://image.tmdb.org/t/p/original/" + o.poster_path, audience_rating: o.vote_average, release_date: release, media_type: type }]));
                }}
              >
                Add to List
              </button>
            </div> : (<div key={o.id}></div>)
          )
          }
        </div>
      ) : (
        <></>
      )}

      <h2>My Movies List</h2>
      <Table
        columns={movieColumns}
        dataSource={movies}
        onChange={onChange}
        pagination={{ position: ["bottomCenter"] }}
      />

      <ul>
        {movies.map((movie) => (
          <li key={movie.id}>
            <div
              style={{
                display: "flex",
                width: "500px",
                justifyContent: "space-between",
                paddingBottom: "5px",
              }}
            >
              {movie.title}{" "}
              <button
                onClick={() => {
                  console.log(movies)
                  setMovies(movies.filter((a) => a.id !== movie.id));
                  localStorage.setItem("movies", JSON.stringify(movies.filter((a) => a.id !== movie.id)));
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
