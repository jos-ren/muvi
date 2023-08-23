"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
// import Autocomplete from "react-autocomplete";

// search a movie
// display a list of results
// add the ones you wish to add to your list
// optionally rate them?

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

    // fetch top movies
    fetch("https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc", options)
      .then((res) => res.json())
      .then((json) => setList(json))
      .catch((err) => console.error("error:" + err));
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
          {search.results.map((result) => result.media_type === "movie" && result.poster_path ?
            <div
              key={result.id}
              style={{
                display: "flex",
                width: "500px",
                justifyContent: "space-between",
                paddingBottom: "5px",
              }}>
              <Image height="50" width="50" quality="100" src={"https://image.tmdb.org/t/p/original/" + result.poster_path} alt={result.title} />
              {result.title}
              <button
                onClick={() => {
                  setMovies([...movies, { id: result.id, name: result.title }]);
                  localStorage.setItem("movies", JSON.stringify([...movies, { id: result.id, name: result.title }]));
                }}
              >
                Add to List
              </button>
            </div> : (<div key={result.id}></div>)
          )
          }
        </div>
      ) : (
        <></>
      )}

      <h2>My Movies List</h2>
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
              {movie.name}{" "}
              <button
                onClick={() => {
                  // console.log(movie.id)
                  setMovies(movies.filter((a) => a.id !== movie.id));
                  localStorage.setItem("movies", JSON.stringify(movies.filter((a) => a.id !== movie.id)));
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <br />
      <h2>Current Top 20 Movies</h2>
      {list.results ? (
        <ol>
          {list.results.map((o, i) => (
            <li key={i}>{o.title}</li>
          ))}
        </ol>
      ) : (
        <></>
      )}
    </>
  );
}
