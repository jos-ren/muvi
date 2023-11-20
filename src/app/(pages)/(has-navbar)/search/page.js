"use client";
import { useState, useEffect, useRef } from "react";
import { message, Divider } from 'antd';
import Card from "@/components/Card.js"
import Hero from "@/components/Hero.js"
import styled from "styled-components";
import { createUserMedia, getUserMedia } from "@/api/api.js"
import { useGlobalContext } from '@/context/store.js';
import { tmdbSearch, tmdbTrending } from "@/vendor/vendor"

const Body = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Grid = styled.div`
  display: grid;
  grid-gap: 20px; 

  /* Media queries for different device sizes */
  @media only screen and (max-width: 449px) {
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 10px; 
  }

  @media only screen and (min-width: 450px) and (max-width: 749px) {
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 10px; 
  }

  @media only screen and (min-width: 750px) and (max-width: 1099px) {
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 15px; 
  }

  @media only screen and (min-width: 1100px) and (max-width: 1535px) {
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 20px; 
  }

  @media only screen and (min-width: 1536px) and (max-width: 1699px) {
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 25px; 
  }
  
  @media only screen and (min-width: 1700px) {
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 35px; 
  }
`;

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [search, setSearch] = useState([]);
  const [disableClear, setDisableClear] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const { user, data, setData } = useGlobalContext();

  const onMessage = (message, type) => {
    messageApi.open({
      type: type,
      content: message,
      className: "message"
    });
  };

  const handleUserMedia = async (o, list_type, user) => {
    const { message, type } = await createUserMedia(o, list_type, user.uid);
    // need to set data here after it is finished creating
    const result = await getUserMedia(user.uid)
    setData(result)
    onMessage(message, type);
  };

  useEffect(() => {
    const trendingFetch = async () => {
      const result = await tmdbTrending();
      setTrending(result);
    };
    trendingFetch();
  }, []);

  useEffect(() => {
    if (user !== null) {
      setLoading(false)
    }
  }, [user]);

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
            onSearch={async (value) => {
              const result = await tmdbSearch(value);
              setSearch(result);
              setDisableClear(false);
            }
            }
            clearSearch={() => {
              setSearch([]);
              setDisableClear(true);
            }}
            disableClear={disableClear}
            loading={loading}
          />
          <br />

          {search ? <>
            <Grid>
              {search.map((o) =>
                <Card
                  key={o.id}
                  addToSeen={() => handleUserMedia(o, "seen", user)}
                  addToWatchlist={() => handleUserMedia(o, "watchlist", user)}
                  src={"https://image.tmdb.org/t/p/original/" + o.poster_path}
                  alt={o.id}
                  url={"https://www.themoviedb.org/" + o.media_type + "/" + o.id}
                  details={{
                    cardTitle: o.media_type === "movie" ? o.title : o.name,
                    description: o.overview,
                    rating: o.vote_average,
                    vote_count: o.vote_count,
                    release_date: o.release_date,
                    media_type: o.media_type,
                    genre_ids: o.genre_ids,
                  }}
                />
              )}
            </Grid>
            <Divider />
          </> : <></>}


          <h2>Trending Shows</h2>
          <Grid>
            {trending.map((o) => {

              return <Card
                key={o.id}
                addToSeen={() => handleUserMedia(o, "seen", user)}
                addToWatchlist={() => handleUserMedia(o, "watchlist", user)}
                src={"https://image.tmdb.org/t/p/original/" + o.poster_path}
                alt={o.id}
                url={"https://www.themoviedb.org/" + o.media_type + "/" + o.id}
                details={{
                  cardTitle: o.media_type === "movie" ? o.title : o.name,
                  description: o.overview,
                  rating: o.vote_average,
                  vote_count: o.vote_count,
                  release_date: o.release_date,
                  media_type: o.media_type,
                  genre_ids: o.genre_ids,
                }}
              />
            }
            )}
          </Grid>
        </Body>
      </div>
    )
  }
}