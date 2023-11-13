"use client";
import { useState, useEffect, use } from "react";
import { message, Button, Divider, } from 'antd';
import Card from "@/components/Card.js"
import Hero from "@/components/Hero.js"
import styled from "styled-components";
import { auth, db } from "@/config/firebase.js"
import { onAuthStateChanged } from "firebase/auth";
import { getDocs, collection, getDoc, setDoc, addDoc, deleteDoc, deleteDocs, updateDoc, doc, where, query, writeBatch } from "firebase/firestore"
import useAuth from "@/hooks/useAuth.js";
import { useRouter } from 'next/navigation'
import { capitalizeFirstLetter, getDateWeekAgo } from "../../../utils.js"

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
  const [trending, setTrending] = useState([]);
  const [search, setSearch] = useState([]);
  const [disableClear, setDisableClear] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  // const [viewMoreSearch, setViewMoreSearch] = useState(false);
  const [viewMoreTrending, setViewMoreTrending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(false);
  const router = useRouter()
  const mediaCollectionRef = collection(db, "Media")

  const onMessage = (message, type) => {
    messageApi.open({
      type: type,
      content: message,
      className: "message"
    });
  };

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

  // adds to a Users/uid/MediaList
  const createUserMedia = async (o, list_type) => {
    // o = movie object data
    const userRef = doc(db, 'Users', user.uid);
    const subCollectionRef = collection(userRef, 'MediaList');

    // check if already in Users' subcollection
    const querySnapshot = await getDocs(query(subCollectionRef, where('tmdb_id', '==', o.id)));
    const notAdded = querySnapshot.empty
    if (notAdded) {
      try {
        const { media_uid, title } = await createMedia(o);

        let obj = {
          media_uid: media_uid,
          tmdb_id: o.id,
          date_added: new Date(),
          list_type: list_type,
          my_season: 1,
          my_episode: 1,
          my_rating: 0,
        };

        await addDoc(subCollectionRef, obj);
        onMessage("Added " + title + " to " + capitalizeFirstLetter(list_type), "success")
      } catch (err) {
        console.error(err)
      }
    } else {
      // warning if already added to your list
      onMessage("Already Added", "warning")
    }
  }

  const createMedia = async (o) => {
    // check if already in media collection 
    const querySnapshot = await getDocs(query(mediaCollectionRef, where('key', '==', o.id)));
    let title = o.media_type === "movie" ? o.title : o.name;
    //  if movie does not exists in you Media collection yet
    if (querySnapshot.empty) {
      let release_date = o.media_type === "movie" ? o.release_date : o.first_air_date;
      // determine if anime. animation genre + japanese language = true
      let animation = false
      let g_ids = o.genre_ids
      g_ids.forEach((id) => {
        if (id === 16) {
          animation = true
        }
      })
      let is_anime = o.original_language === "ja" && animation === true ? true : false;
      // get details
      const response = await fetch("https://api.themoviedb.org/3/" + o.media_type + "/" + o.id + "?language=en-US", options);
      let details = await response.json();
      let upcoming_release = o.media_type === "movie" ? details.release_date : (details.next_episode_to_air !== null ? details.next_episode_to_air.air_date : details.last_air_date)

      // need to seperate what need to be added to subcollection vs main media collection
      // basically anything unique to the user will go in the sub
      let obj = {
        title: title,
        release_date: release_date,
        media_type: o.media_type,
        is_anime: is_anime,
        upcoming_release: upcoming_release,
        // these details could change: (new episodes etc, is it better to just use a get everytime and not store these? or have a refresh button to get more current data)
        details: details
      }
      try {
        const docRef = await addDoc(mediaCollectionRef, obj)
        const newDocId = docRef.id;
        if (newDocId) {
          return { media_uid: newDocId, title };
        } else {
          throw new Error('Failed to create media.');
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      const oldDocId = querySnapshot.docs[0].id;
      if (oldDocId) {
        return { media_uid: oldDocId, title };
      } else {
        throw new Error('Failed to create media.');
      }
    }
  }

  // console.log(user)

  useEffect(() => {
    // monitors login status
    onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u)
        updateUser(u)
        setLoading(false)
      } else {
        router.push('/auth')
      }
    })
    getTrending();
  }, []);

  if (loading) {
    return <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
        <h1>Loading...</h1>
      </div>
    </div >
  } else {
    return (
      <div>
        {contextHolder}
        <Body>
          <Hero
            onSearch={onSearch}
            clearSearch={clearSearch}
            disableClear={disableClear}
            loading={loading}
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
        </Body>
      </div>
    )
  }
}