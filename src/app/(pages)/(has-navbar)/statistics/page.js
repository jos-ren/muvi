'use client'
import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '@/context/store.js';
import { Statistic, Card, Button, message } from 'antd';
import { formatTime } from "@/api/utils";
import { calculateStatistics } from '@/api/statistics';
import Leaderboard from "@/components/Leaderboard"
import ShowCard from "@/components/ShowCard"
import ReactApexChart from 'react-apexcharts'
import styled from 'styled-components';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { refreshMembers, getPrincipalMembers } from "@/api/api"
import Image from "next/image";

const SimpleCarousel = ({ items }) => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 1000,
    slidesToShow: 3.5,
    slidesToScroll: 3,
    // centerMode: true,
    // centerPadding: '16px', // Adjust the spacing between items
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    // autoplay: true,
    autoplaySpeed: 7500,
  };

  return (
    <Slider {...settings}>
      {items.map((item, index) => (
        <ShowCard
          key={index}
          title={item.title}
          time={item.time}
          poster_path={item.image}
          episodes={item.total_watched_eps}
          my_rating={item.my_rating}
          index={index + 1}
        />
      ))}
    </Slider>
  );
};

const CustomNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: 'block', background: 'black' }}
      onClick={onClick}
    />
  );
};

const CustomPrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: 'block', background: 'black' }}
      onClick={onClick}
    />
  );
};

const MostWatchedList = ({ title, items }) => (
  <>
    <h2>{title}</h2>
    <ul>
      {items
        .slice()
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
        .map((item, index) => (
          <li key={index}>
            {/* Include your image here if needed */}
            <Image
              unoptimized
              height={50}
              width={50}
              quality="100"
              style={{ objectFit: 'cover' }}
              src={item.profile_path ? `https://image.tmdb.org/t/p/original/${item.profile_path}` : 'default_avatar.jpg'}
              alt="profile_pic"
            />
            {item.count}x - {item.name}
          </li>
        ))}
    </ul>
  </>
);

const TwoColumnsContainer = styled.div`
  display: flex;
`;

const Column = styled.div`
  flex: 1;
  padding: 16px;
  // border: 1px solid #ddd;
  // margin: 8px;
`;

const StatisticsPage = () => {
  const { user, data } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [pieValues, setPieValues] = useState([]);
  const [pieLabels, setPieLabels] = useState([]);
  const [barValues, setBarValues] = useState([]);
  const [barLabels, setBarLabels] = useState([]);
  const [topMedia, setTopMedia] = useState([]);
  const [pmID, setPMID] = useState(null)
  const [messageApi, contextHolder] = message.useMessage();

  const fetchInitData = async () => {
    if (data !== null && user !== null) {
      const principalMembers = await getPrincipalMembers(user.uid)
      if (principalMembers.length !== 0) {
        setPMID(principalMembers[0].id)
      }
      const newStatistics = await calculateStatistics(data, user.uid);
      newStatistics.principal_members = principalMembers[0];
      setStatistics(newStatistics);
    }
  };

  useEffect(() => {
    fetchInitData();
  }, [data, user]);

  useEffect(() => {
    if (statistics !== null && user !== null) {
      if (statistics.total_minutes !== 0 && statistics.longest_medias) {
        setTopMedia(statistics.longest_medias.slice().sort((a, b) => b.time - a.time))
        getGraphInfo()
        setLoading(false);
      }
    }
  }, [statistics, user]);

  const onMessage = (message, type) => {
    messageApi.open({
      type: type,
      content: message,
      className: "message"
    });
  };

  function getGraphInfo() {
    if (statistics.media_types && statistics.genres.length !== 0) {
      let countArr = [];
      let labelArr = [];
      let countArrB = [];
      let labelArrB = [];

      Object.keys(statistics.media_types).forEach((key) => {
        labelArr.push(key);
        countArr.push(formatTime(statistics.media_types[key], "H2"));
      });
      // Output the updated countArr
      countArr.forEach((item, index) => countArr[index] = Math.round(item / formatTime(statistics.total_minutes, "H2") * 100));
      countArr.sort((a, b) => b - a)
      setPieValues(countArr);
      setPieLabels(labelArr);

      statistics.genres.sort((a, b) => b.watchtime - a.watchtime).slice(0, 10).forEach((item) => {
        labelArrB.push(`${item.emoji} ${item.name}`);
        countArrB.push(formatTime(item.watchtime, "H2"));
      });
      setBarValues(countArrB);
      setBarLabels(labelArrB);
    }
  }

  const apexSeries = pieValues;

  const apexOptions = {
    chart: {
      height: 350,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '22px',
          },
          value: {
            fontSize: '16px',
          },
          total: {
            show: true,
            label: 'Total',
            formatter: function (w) {
              // console.log(w, "w")
              // By default, this function returns the average of all series.
              // The below is just an example to show the use of a custom formatter function
              return formatTime(statistics.total_minutes, "H2") + " Hours"
            },
          },
        },
      },
    },
    labels: pieLabels,
  };

  // add at least 5 items to see some statistics on your watch habits


  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95vh" }}>
        <h1>Loading...</h1>
      </div>
    );
  } else {
    return (
      <div>
        {contextHolder}
        <div style={{ marginBottom: "100px" }}></div>
        <Button
          type="primary"
          onClick={async () => {
            onMessage("Refreshing", "loading");
            await refreshMembers(data, user.uid, pmID);
            fetchInitData();
            onMessage("Refreshed Data", "success");
          }}
        >
          Refresh Data
        </Button>

        <div style={{ marginTop: "20px" }}></div>
        <div style={{ display: "flex" }}>
          <Card style={{ width: '50%', marginRight: '16px' }}>
            <Statistic title="Total Watchtime" value={formatTime(statistics.total_minutes, 'H')} />
          </Card>
          <Card style={{ width: '50%', marginRight: '16px' }}>
            <Statistic title="Average Rating" value={statistics.average_rating} />
          </Card>
          <Card style={{ width: '50%', marginRight: '16px' }}>
            <Statistic title="Longest Movie" value={'Flower Moon'} />
          </Card>
          <Card style={{ width: '50%' }}>
            <Statistic title="Average Rating" value={statistics.average_rating} />
          </Card>
        </div>

        {/* maybe have a  refresh button like upcoming page and only refresh data when clicked or if never run before... could save on load times for page, but will detract from user experience */}

        {/* if smaller viewport, rearrange columns to 1 wide */}
        <TwoColumnsContainer>
          <Column>
            <h2>Favorite Genres</h2>

            <Leaderboard data={statistics.genres} />
          </Column>
          <Column>
            <h2>Favorite Medium</h2>
            <Card>
              <ReactApexChart options={apexOptions} series={apexSeries} type="radialBar" height={350} />
            </Card>
          </Column>
        </TwoColumnsContainer>

        <h2>Most Watched Shows</h2>
        <SimpleCarousel items={topMedia.slice(0, 10)} />

        {statistics.principal_members ? <div>
          <MostWatchedList title="Most Watched Actors" items={statistics.principal_members.actors} />
          <MostWatchedList title="Most Watched Directors" items={statistics.principal_members.directors} />
          <MostWatchedList title="Top Producers" items={statistics.principal_members.producers} />
          <MostWatchedList title="DOP" items={statistics.principal_members.dop} />
          <MostWatchedList title="sound" items={statistics.principal_members.sound} />
          <MostWatchedList title="Editor" items={statistics.principal_members.editor} />
        </div> : null}

        <h2>Longest Movie Watched</h2>
        <h2>Number of Rewatched Movies</h2>
        <h2>Oldest and Newest Movies Watched</h2>
        <h2>Percentage of Movies Finished</h2>
        {/* for this uise that cool %ige comp in ant design */}
        {/* total shows, animes, and movies */}


        {/* cards */}

        {/* <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: "16px" }}>
          {statistics.media_types && Object.entries(statistics.media_types).map(([media_type, minutes]) => (
            <Card key={media_type} >
              <Statistic title={capitalizeFirstLetter(media_type)} value={formatTime(minutes, "H")} />
            </Card>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: "16px" }}>
          {statistics.genres &&
            statistics.genres
              .slice() // Create a copy of the array to avoid mutating the original
              .sort((a, b) => b.watchtime - a.watchtime) // Sort by watchtime in descending order
              .map((i, index) => (
                <Card key={i.id}>
                  <Statistic
                    title={
                      <div>
                        <span style={{ color: "black" }}>{i.emoji}</span>{" "}
                        {capitalizeFirstLetter(i.name)}
                      </div>
                    }
                    value={formatTime(i.watchtime, "H")}
                  />
                </Card>
              ))
          }
        </div> */}
      </div>
    );
  }
};

export default StatisticsPage;