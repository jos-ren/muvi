'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from '@/context/store.js';
import { Statistic, Card } from 'antd';
import { formatTime, capitalizeFirstLetter } from "@/api/utils";
import { calculateStatistics } from '@/api/api';
import { Doughnut, Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto'


const StatisticsPage = () => {
  const { user, data } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [pieValues, setPieValues] = useState([]);
  const [pieLabels, setPieLabels] = useState([]);
  const [barValues, setBarValues] = useState([]);
  const [barLabels, setBarLabels] = useState([]);

  useEffect(() => {
    if (data !== null) {
      setStatistics(calculateStatistics(data));
    }
  }, [data]);

  useEffect(() => {
    if (statistics !== null && user !== null) {
      getInfo()
      setLoading(false);
    }
  }, [statistics, user]);

  function getInfo() {
    if (statistics.total_minutes !== 0) {
      let countArr = [];
      let labelArr = [];
      let countArrB = [];
      let labelArrB = [];

      // Use Object.keys to iterate over object properties (keys)
      Object.keys(statistics.media_types).forEach((key) => {
        labelArr.push(key);
        countArr.push(formatTime(statistics.media_types[key], "H2"));
      });
      setPieValues(countArr);
      setPieLabels(labelArr);
      // Use Object.keys to iterate over object properties (keys)
      statistics.genres.slice().sort((a, b) => b.watchtime - a.watchtime).forEach((item) => {
        labelArrB.push(`${item.emoji} ${item.name}`);
        countArrB.push(formatTime(item.watchtime, "H2"));
      });
      setBarValues(countArrB);
      setBarLabels(labelArrB);

    }
  }

  console.log(pieLabels, pieValues, barLabels, barValues)

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
      },
      y: {
        beginAtZero: true,
      },
    },
    indexAxis: 'y',
  };



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
          <Statistic title="Total Watchtime" value={formatTime(statistics.total_minutes, 'H')} loading={loading} />
        </Card>

        <br />
        <div style={{ display: "flex" }}>
          <div style={{ width: '400px', height: '400px', marginRight:"16px" }}>
            <Card  >
              <Doughnut
                data={doughnutChartData}
                options={chartOptions}
              />
            </Card>
          </div>
          <div style={{ width: '800px', height: '400px' }}>
            <Card  >
              <Bar 
              data={barChartData} 
              options={barChartOptions}
              height={300} 
              width={400}
               />
            </Card>
          </div>
        </div>

        {/* Rest of your components */}
        {/* Rest of your components */}
        {/* <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: "16px" }}>
          {statistics.media_types && Object.entries(statistics.media_types).map(([media_type, minutes]) => (
            <Card key={media_type} >
              <Statistic title={capitalizeFirstLetter(media_type)} value={formatTime(minutes, "H")} />
            </Card>
          ))}
        </div> */}

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
        </div>

        {/* <Pie {...config} />; */}
      </div>
    );
  }
};

export default StatisticsPage;