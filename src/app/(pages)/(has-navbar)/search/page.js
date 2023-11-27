"use client";
import { useState, useEffect } from "react";
import { message, Divider, Button } from 'antd';
import Card from "@/components/Card.js"
import Hero from "@/components/Hero.js"
import styled from "styled-components";
import { createUserMedia, getUserMedia } from "@/api/api.js"
import { useGlobalContext } from '@/context/store.js';
import { tmdbSearch, tmdbFetchMovies } from "@/vendor/vendor"
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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
  const [TMDBData, setTMDBData] = useState([]);
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

  const SimpleCarousel = ({ items }) => {
    const settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 6, // Number of slides to show at a time
      slidesToScroll: 1,
      swipeToSlide: true,
    };

    return (
      <Slider {...settings}>
        {items.map((item, index) => (
          <div key={index} className="carousel-item">
            <Card
              addToSeen={() => handleUserMedia(item, "seen", user)}
              addToWatchlist={() => handleUserMedia(item, "watchlist", user)}
              src={"https://image.tmdb.org/t/p/original/" + item.poster_path}
              alt={item.id}
              url={"https://www.themoviedb.org/" + item.media_type + "/" + item.id}
              details={{
                cardTitle: item.media_type === "movie" ? item.title : item.name,
                description: item.overview,
                rating: item.vote_average,
                vote_count: item.vote_count,
                release_date: item.release_date,
                media_type: item.media_type,
                genre_ids: item.genre_ids,
              }}
            />
          </div>
        ))}
      </Slider>
    );
  };

  useEffect(() => {
    const trendingFetch = async () => {
      let temp = {
        trending: await tmdbFetchMovies("trending/all/day"),
        // movie: {
        //   upcoming: await tmdbFetchMovies("movie/upcoming"),
        //   popular: await tmdbFetchMovies("movie/popular"),
        //   now_playing: await tmdbFetchMovies("movie/now_playing"),
        //   top_rated: await tmdbFetchMovies("movie/top_rated"),
        // },
        // tv: {
        //   airing_today: await tmdbFetchMovies("tv/airing_today"),
        //   on_the_air: await tmdbFetchMovies("tv/on_the_air"),
        //   popular: await tmdbFetchMovies("tv/popular"),
        //   top_rated: await tmdbFetchMovies("tv/top_rated"),
        // },
      }
      setTMDBData(temp);
    };
    trendingFetch();
  }, []);

  // console.log(TMDBData)

  useEffect(() => {
    if (user !== null && TMDBData.length !== 0) {
      setLoading(false)
    }
  }, [user, TMDBData]);

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
            {TMDBData.trending.map((o) =>
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
          {/* <SimpleCarousel items={TMDBData.trending} /> */}

          {/* <h2>Upcoming Movies</h2>
          <SimpleCarousel items={TMDBData.movie.upcoming} />

          <h2>Now Playing Movies</h2>
          <SimpleCarousel items={TMDBData.movie.now_playing} />

          <h2>Popular Movies</h2>
          <SimpleCarousel items={TMDBData.movie.popular} />

          <h2>Top Rated Movies</h2>
          <SimpleCarousel items={TMDBData.movie.top_rated} />

          <h2>Now Playing TV</h2>
          <SimpleCarousel items={TMDBData.tv.airing_today} />

          <h2>On The Air TV</h2>
          <SimpleCarousel items={TMDBData.tv.on_the_air} />

          <h2>Popular TV</h2>
          <SimpleCarousel items={TMDBData.tv.popular} />

          <h2>Top Rated TV</h2>
          <SimpleCarousel items={TMDBData.tv.top_rated} /> */}

        </Body>
      </div>
    )
  }
}