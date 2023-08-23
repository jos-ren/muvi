"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { MoviesData, renderMovieTitle } from "./movies_data.js";
import Autocomplete from "react-autocomplete";

// add autocomplete
// delete
// connect to database
// connect to movie api

export default function Home() {
  const [name, setName] = useState("");
  const [movies, setMovies] = useState([]);
  const [number, setNumber] = useState(0);

  useEffect(() => {
    const localMovies = JSON.parse(localStorage.getItem("movies"));
    const localNumber = JSON.parse(localStorage.getItem("number"));
    if (localMovies) {
      setMovies(localMovies);
    }
    if (localNumber) {
      setNumber(localNumber);
    }
  }, []);

  return (
    <>
      <h2>Movie List</h2>
      <p>movie data is stored in local storage</p>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button
        onClick={() => {
          
          setMovies([...movies, { id: number, name: name }]);
          localStorage.setItem("movies", JSON.stringify([...movies, { id: number, name: name }]));
          
          // add 1 to global id
          let newNum = number + 1
          setNumber(newNum);
          localStorage.setItem("number", JSON.stringify(newNum));
        }}
      >
        Add Movie
      </button>
      {/* <Autocomplete
        // value={this.state.val}
        items={MoviesData()}
        // getItemValue={item => item.title}
        // shouldItemRender={renderMovieTitle}
        // renderMenu={item => (
        //   <div className="dropdown">
        //     {item}
        //   </div>
        // )}
        // renderItem={(item, isHighlighted) =>
        //   <div className={`item ${isHighlighted ? 'selected-item' : ''}`}>
        //     {item.title}
        //   </div>
        // }
        // onChange={(event, val) => this.setState({ val })}
        // onSelect={val => this.setState({ val })}
      /> */}
      <ul>
        {movies.map((movie) => (
          <li key={movie.id}>
            <div style={{display:"flex", width:"200px", justifyContent:"space-between", paddingBottom:"5px"}}>

            {movie.name}{" "}
            <button
              onClick={() => {
                // console.log(movie.id)
                setMovies(movies.filter((a) => a.id !== movie.id));
                localStorage.setItem('movies', JSON.stringify(movies.filter((a) => a.id !== movie.id)));
              }}
              >
              Delete
            </button>
              </div>
          </li>
        ))}
      </ul>
    </>
  );
}
