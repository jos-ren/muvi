"use client";
import { useState, useEffect } from "react";
import { message, Button, Divider, } from 'antd';
import Card from "@/components/Card.js"
import Hero from "@/components/Hero.js"
import styled from "styled-components";
import { auth, db } from "@/config/firebase.js"
import { onAuthStateChanged } from "firebase/auth";
import { getDocs, collection, getDoc, setDoc, updateDoc, doc } from "firebase/firestore"
import useAuth from "@/hooks/useAuth.js";
import { useRouter } from 'next/navigation'

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

export default function Home() {
  const fetch = require("node-fetch");
  const [userMedia, setUserMedia] = useState([]);
  const [trending, setTrending] = useState([]);
  const [search, setSearch] = useState([]);
  const [disableClear, setDisableClear] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  // const [viewMoreSearch, setViewMoreSearch] = useState(false);
  const [viewMoreTrending, setViewMoreTrending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(false);
  const router = useRouter()

  // need res, and error handling for all functions
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

  const updateUser = async (user) => {
    const userRef = doc(db, 'Users', user.uid); // Reference to the specific user document
    const dataToUpdate = { lastLoginTime: new Date(), email: user.email }
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        // The document exists, so update it
        await updateDoc(userRef, dataToUpdate);
        console.log('user updated.');
      } else {
        // The document doesn't exist, so create it
        await setDoc(userRef, dataToUpdate);
        console.log('user created.');
      }
    } catch (error) {
      console.error('Error updating/creating user: ', error);
    }
  }

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
    },
  };

  async function getTrending() {
    const response = await fetch("https://api.themoviedb.org/3/trending/all/day?language=en-US", options);
    const json = await response.json();
    let temp = json.results
    temp.forEach((item, index) => {
      item.key = index + 1;
    })
    setTrending(temp)
  }

  useEffect(() => {
    // monitors login status
    onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u)
        updateUser(u)
        setLoading(false)
      } else {
        router.push('/auth/login')
      }
    })
    getTrending();
  }, []);

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
      <h1>Loading...</h1>
      {/* <ReactLoading type={'spin'} color={'blue'} height={30} width={30} /> */}
    </div>
  } else {

    return (
      <div>
        {contextHolder}
        <Body>
          <>
            <Hero
              onSearch={onSearch}
              clearSearch={clearSearch}
              disableClear={disableClear}
            />
            <br />
            {search ?
              <>
                <Grid>
                  {search.map((o) =>
                    <Card
                      key={o.id}
                      addToSeen={() => createUserMedia(o, "seen")}
                      addToWatchlist={() => createUserMedia(o, "watchlist")}
                      title={o.media_type === "movie" ? o.title : o.name}
                      src={"https://image.tmdb.org/t/p/original/" + o.poster_path}
                      alt={o.id}
                      height={300}
                      width={200}
                      url={"https://www.themoviedb.org/" + o.media_type + "/" + o.id}
                    />
                  )}
                </Grid>
                <Divider />
              </> : <></>}
            <h2 style={{}}>Trending Shows</h2>
            <Grid>
              {trending.slice(0, 10).map((o) =>
                <Card
                  key={o.id}
                  addToSeen={() => createUserMedia(o, "seen")}
                  addToWatchlist={() => createUserMedia(o, "watchlist")}
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
                  addToSeen={() => createUserMedia(o, "seen")}
                  addToWatchlist={() => createUserMedia(o, "watchlist")}
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
          </>

          {/* Stats */}

          {/* <div style={{ marginTop: "100px" }}>
                Stats
              </div > */}

        </Body>
      </div>
    )
  }
}