"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [movies, setMovies] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(name)
    movies.push(name)
    console.log(movies)
    // alert(`The name you entered was: ${name}`);
  };

  return (
    <main>
      <h1>Movies List</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter your name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <input type="submit" />
      </form>
      <br></br>
      <br></br>
      <div>Movies: </div>
      {name}
      <br/>
      <br/>
      {movies}
      {movies.map(function(data) {
      return (
        <div>
          - {data}
        </div>
      )
    })}
      {/* map movies here */}
    </main>
  );
}
