'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from '@/context/store.js';
import { Statistic, Card } from 'antd';
import { formatTime, capitalizeFirstLetter } from "@/api/utils";
import { calculateStatistics } from '@/api/api';
import { Doughnut, Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto'
import Leaderboard from "@/components/Leaderboard"
import ShowCard from "@/components/ShowCard"
import ReactApexChart from 'react-apexcharts'
import styled from 'styled-components';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const SimpleCarousel = ({ items }) => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    // centerMode: true,
    // centerPadding: '16px', // Adjust the spacing between items
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
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
          index={index+1}
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

  useEffect(() => {
    if (data !== null) {
      setStatistics(calculateStatistics(data));
    }
  }, [data]);

  useEffect(() => {
    if (statistics !== null && user !== null) {
      if (statistics.total_minutes !== 0) {
        setTopMedia(statistics.longest_medias.slice().sort((a, b) => b.time - a.time))
        getInfo()
        setLoading(false);
      }
    }
  }, [statistics, user]);

  console.log(topMedia)





  function getInfo() {
    if (statistics.media_types && statistics.genres.length !== 0) {
      let countArr = [];
      let labelArr = [];
      let countArrB = [];
      let labelArrB = [];

      // // Use Object.keys to iterate over object properties (keys)
      // Object.keys(statistics.media_types).forEach((key) => {
      //   labelArr.push(key);
      //   countArr.push(formatTime(statistics.media_types[key], "H2"));
      // });
      // setPieValues(countArr);
      // setPieLabels(labelArr);
      // Use Object.keys to iterate over object properties (keys)
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


  // console.log(pieLabels, pieValues, barLabels, barValues)

  // const segmentColors = [
  //   'rgba(255, 99, 132, 0.8)',
  //   'rgba(54, 162, 235, 0.8)',
  //   'rgba(255, 206, 86, 0.8)',
  //   'rgba(75, 192, 192, 0.8)', // Tealish
  //   'rgba(153, 102, 255, 0.8)', // Light Purple
  //   'rgba(255, 159, 64, 0.8)', // Peachy Orange
  //   'rgba(0, 128, 128, 0.8)', // Dark Teal
  //   'rgba(255, 140, 0, 0.8)', // Dark Orange
  //   // Add more colors as needed
  // ];

  const backgroundColors = [
    'rgba(255,186,230,0.2)',
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)',
  ]
  const borderColors = [
    'rgba(255,133,208,0.8)',
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
  ]

  const doughnutChartData = {
    labels: pieLabels,
    datasets: [{
      label: '# Of Hours',
      data: pieValues,
      borderWidth: 1,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
    }]
  };

  const chartOptions = {
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  };

  const barChartData = {
    labels: barLabels,
    datasets: [
      {
        label: 'Hours',
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
        hoverBorderColor: 'rgba(75, 192, 192, 1)',
        data: barValues,
      },
    ],
  };

  const barChartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        // ticks: {
        //   display: false, // Hide the labels on the x-axis
        // },
      },
      y: {
        beginAtZero: true,
        // ticks: {
        //   display: false, // Hide the labels on the y-axis
        // },
      },
    },
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
    },
  };

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
        <div style={{ marginBottom: "100px" }}></div>
        <Card>
          <Statistic title="Total Watchtime" value={formatTime(statistics.total_minutes, 'H')} />
        </Card>

        <h2>Top Media</h2>
        <SimpleCarousel items={topMedia.slice(0, 10)} />

        {/* if smaller viewport, rearrange columns to 1 wide */}
        <TwoColumnsContainer>
          <Column>
            <h2>Top Genres</h2>

            <Leaderboard data={statistics.genres} />

            {/* <Card style={{ maxWidth: '400px', maxHeight: '400px' }}>
              <Bar
                data={barChartData}
                options={barChartOptions}
                height={350}
                width={350}
              />
            </Card> */}
          </Column>
          <Column>
            <h2>Media Types Breakdown</h2>
            <Card>
              <ReactApexChart options={apexOptions} series={apexSeries} type="radialBar" height={350} />
            </Card>
            {/* <Card  >
              <Doughnut
                data={doughnutChartData}
                options={chartOptions}
              />
            </Card> */}
          </Column>
        </TwoColumnsContainer>


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