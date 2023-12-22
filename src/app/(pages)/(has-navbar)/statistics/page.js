'use client'
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Image from "next/image";
import dynamic from 'next/dynamic';

import { useGlobalContext } from '@/context/store.js';
import { formatTime, capitalizeFirstLetter } from "@/utils/utils";
import { calculateStatistics } from '@/api/statistics';
import { refreshMembers, getPrincipalMembers } from "@/api/api"

import TopTen from "@/components/statistics/TopTen"
import MovieCard from "@/components/statistics/MovieCard"
import SmallStat from '@/components/statistics/SmallStat';
import Box from "@/components/statistics/Box"
import Chart from "@/components/statistics/Chart"
import Widget from "@/components/statistics/Widget"

import { Button, message, Select, Collapse, List, Progress } from 'antd';
import { RightOutlined, LeftOutlined, ReloadOutlined, StarTwoTone, DownOutlined, StarFilled, ClockCircleFilled, HourglassFilled, ThunderboltFilled } from '@ant-design/icons'
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

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
        <MovieCard
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

const TwoColumnsContainer = styled.div`
  display: flex;
`;


const Spacer = styled.div`
  margin:16px 8px;
`;

const Column = styled.div`
  flex: 1;
  // padding: 16px;
  // border: 1px solid #ddd;
  // margin: 8px;
`;

let dropdownOptions = [
  {
    value: 'actors',
    label: 'Actors',
  },
  {
    value: 'directors',
    label: 'Directors',
  },
  {
    value: 'producers',
    label: 'Producers',
  },
  {
    value: 'dop',
    label: 'Director of Photography',
  },
  {
    value: 'sound',
    label: 'Composer',
  },
  {
    value: 'editor',
    label: 'Editor',
  },
]

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
const collapseItems = [
  {
    key: '1',
    label: 'This is panel header 1',
    children: <p>{text}</p>,
  },
  {
    key: '2',
    label: 'This is panel header 2',
    children: <p>{text}</p>,
  },
  {
    key: '3',
    label: 'This is panel header 3',
    children: <p>{text}</p>,
  },
];

const StatisticsPage = () => {
  const { user, data } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [pieValues, setPieValues] = useState([]);
  const [pieLabels, setPieLabels] = useState([]);
  const [barValues, setBarValues] = useState([]);
  const [barLabels, setBarLabels] = useState([]);
  const [dropdown, setDropdown] = useState('actors');
  const [pmID, setPMID] = useState(null)
  const [messageApi, contextHolder] = message.useMessage();

  console.log(statistics, "STATS")

  const handleChange = (value) => {
    setDropdown(value)
  };

  const onChange = (key) => {
    console.log(key);
  };

  console.log(dropdown, "dropdown")

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
      if (statistics.total_minutes !== 0 && statistics.longest_tv && statistics.principal_members) {
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
        <div style={{ marginTop: "145px" }}></div>
        <div style={{ display: "flex", justifyContent: "end", margin: "20px 0px" }}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={async () => {
              onMessage("Refreshing", "loading");
              await refreshMembers(data, user.uid, pmID);
              fetchInitData();
              onMessage("Refreshed Data", "success");
            }}
          >
            Refresh
          </Button>
        </div>

        <div style={{ display: "flex" }}>
          <Widget
            title="Total Watchtime"
            statistic={formatTime(statistics.total_minutes, 'H')}
            icon={<ClockCircleFilled style={{ color: 'white' }} />}
          />
          <Spacer />
          <Widget
            title="Average Rating"
            statistic={statistics.average_rating}
            icon={<StarFilled style={{ color: 'white' }} />}
          // color='#ffcc29'
          />
        </div>
        <Spacer />
        <div style={{ display: "flex" }}>
          <Widget
            title="Oldest Movie"
            statistic={statistics.oldest_media[statistics.oldest_media.length - 1].release_date + statistics.oldest_media[statistics.oldest_media.length - 1].title}
            icon={<HourglassFilled style={{ color: 'white' }} />}
          // color='#ff4757'
          />
          <Spacer />
          <Widget
            title="Newest Movie"
            statistic={statistics.oldest_media[0].title}
            icon={<ThunderboltFilled style={{ color: 'white' }} />}
          // color='#4dff4d'
          />
        </div>

        <Spacer />
        <Select
            defaultValue="Actors"
            style={{
              width: 120,
            }}
            onChange={handleChange}
            options={dropdownOptions}
          />
        <Spacer />
        <Chart data={statistics.principal_members[dropdown].slice(0, 20)} />

        {/* <Box><Progress type="dashboard" percent={75} /></Box> */}


        {(typeof window !== 'undefined') &&
          <ApexCharts options={apexOptions} series={apexSeries} type="radialBar" height={200} width={200} />
        }

        {/* <h2>Number of Rewatched Movies</h2> */}

        {/* <h2>Percentage of Movies Finished</h2> */}
        {/* for this uise that cool %ige comp in ant design */}
        {/* total shows, animes, and movies */}
        {/* a map of whwere each movie is made kinda likea  heat map of countries */}


        {/* <h2>Top TV</h2>
        <SimpleCarousel items={statistics.longest_tv.slice(0, 10)} media_type={"tv"} />

        <h2>Longest Movies</h2>
        <SimpleCarousel items={statistics.longest_movie.slice(0, 10)} media_type={"movie"} /> */}

        {/* {statistics.principal_members ? <div>
          <Select
            defaultValue="Actors"
            style={{
              width: 120,
            }}
            onChange={handleChange}
            options={dropdownOptions}
          />

          <h2>Most Watched {capitalizeFirstLetter(dropdown)}</h2>
          <ul>
            {statistics.principal_members[dropdown]
              .slice(0, 20)
              .map((item, index) => (
                <li key={index}>
                  <Image
                    unoptimized
                    height={50}
                    width={50}
                    quality="100"
                    style={{ objectFit: 'cover' }}
                    src={item.profile_path ? `https://image.tmdb.org/t/p/original/${item.profile_path}` : 'default_avatar.jpg'}
                    alt={item.name}
                  />
                  {item.count}x - {item.name}
                </li>
              ))}
          </ul>
        </div> : null} */}

        {/* <Collapse items={collapseItems} defaultActiveKey={['1']} onChange={onChange} /> */}

      </div>
    );
  }
};

export default StatisticsPage;