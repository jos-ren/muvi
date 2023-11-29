'use client'
import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '@/context/store.js';
import { Statistic, Card, Button, message } from 'antd';
import { formatTime, capitalizeFirstLetter } from "@/api/utils";
import { calculateStatistics } from '@/api/statistics';
import Leaderboard from "@/components/Leaderboard"
import ShowCard from "@/components/ShowCard"
import styled from 'styled-components';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { refreshMembers, getPrincipalMembers, test } from "@/api/api"
import Image from "next/image";
import dynamic from 'next/dynamic';
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });
import { RightOutlined, LeftOutlined } from '@ant-design/icons'

const SimpleCarousel = ({ items, media_type }) => {
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
          media_type={media_type}
        />
      ))}
    </Slider>
  );
};

const CustomNextArrow = (props) => {
  const { onClick } = props;
  return (
    <RightOutlined
      className={'arrow-right'}
      onClick={onClick}
    />
  );
};

const CustomPrevArrow = (props) => {
  const { onClick } = props;
  return (
    <LeftOutlined
      className={'arrow-left'}
      onClick={onClick}
    />
  );
};

const MostWatchedList = ({ title, items }) => (
  <>
    <h2>{title}</h2>
    <ul>
      {items
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
  const [pmID, setPMID] = useState(null)
  const [messageApi, contextHolder] = message.useMessage();

  const fetchInitData = async () => {
    if (data !== null && user !== null) {
      // get top actors, etc
      const principalMembers = await getPrincipalMembers(user.uid)
      if (principalMembers.length !== 0) {
        setPMID(principalMembers[0].id)
      }
      // generate stats on movies
      const newStatistics = await calculateStatistics(data, user.uid);
      // combine
      newStatistics.principal_members = principalMembers[0];
      setStatistics(newStatistics);
    }
  };

  useEffect(() => {
    fetchInitData();
  }, [data, user]);

  useEffect(() => {
    if (statistics !== null && user !== null) {
      if (statistics.total_minutes !== 0 && statistics.longest_tv) {
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
  console.log(statistics)

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
        <div style={{ display: "flex", justifyContent: "end" }}>
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
        </div>



        <div style={{ marginTop: "16px" }}></div>
        <div style={{ display: "flex" }}>
          <Card style={{ width: '50%', marginRight: '16px' }}>
            <Statistic title="Total Watchtime" value={formatTime(statistics.total_minutes, 'H')} />
          </Card>
          <Card style={{ width: '50%', marginRight: '16px' }}>
            <Statistic title="Average Rating" value={statistics.average_rating} />
          </Card>
          <Card style={{ width: '50%' }}>
            <div>{statistics.oldest_media[statistics.oldest_media.length - 1].release_date}</div>
            <Statistic title="Oldest Movie" value={statistics.oldest_media[statistics.oldest_media.length - 1].title} />
          </Card>
          <Card style={{ width: '50%', marginRight: '16px' }}>
            <div>{statistics.oldest_media[0].release_date}</div>
            <Statistic title="Newest Movie" value={statistics.oldest_media[0].title} />
          </Card>
        </div>

        <h2>Number of Rewatched Movies</h2>

<h2>Percentage of Movies Finished</h2>
{/* for this uise that cool %ige comp in ant design */}
{/* total shows, animes, and movies */}

        <TwoColumnsContainer>
          <Column>
            <h2>Favorite Genres</h2>

            <Leaderboard data={statistics.genres} />
          </Column>
          <Column>
            <h2>Favorite Medium</h2>
            <Card>
              {(typeof window !== 'undefined') &&
                <ApexCharts options={apexOptions} series={apexSeries} type="radialBar" height={350} width={350} />
              }
            </Card>
          </Column>
        </TwoColumnsContainer>

        <h2>Top TV</h2>
        <SimpleCarousel items={statistics.longest_tv.slice(0, 10)} media_type={"tv"} />
        <h2>Longest Movies</h2>
        <SimpleCarousel items={statistics.longest_movie.slice(0, 10)} media_type={"movie"} />

        {statistics.principal_members ? <div>
          <MostWatchedList title="Most Watched Actors" items={statistics.principal_members.actors} />
          <MostWatchedList title="Most Watched Directors" items={statistics.principal_members.directors} />
          <MostWatchedList title="Top Producers" items={statistics.principal_members.producers} />
          <MostWatchedList title="DOP" items={statistics.principal_members.dop} />
          <MostWatchedList title="sound" items={statistics.principal_members.sound} />
          <MostWatchedList title="Editor" items={statistics.principal_members.editor} />
        </div> : null}
      </div>
    );
  }
};

export default StatisticsPage;